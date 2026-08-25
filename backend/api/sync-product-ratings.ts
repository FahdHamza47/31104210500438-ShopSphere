// Vercel Serverless Function (Task 3.3) — a background workload that runs
// OUTSIDE the main Express app in api/server.ts. Deployed as its own
// function by Vercel because it lives under /api and is listed as its own
// "build" in vercel.json.
//
// What it does: the review service (an independent microservice, see
// ../../review-service) owns all review data. The main Product table still
// carries denormalized `rating` / `numReviews` fields for fast product-list
// rendering without a REST call per card. This function is what keeps those
// denormalized fields honest — it pulls the current review aggregate for
// every product from the review service over REST and writes it back into
// Postgres via Prisma.
//
// Triggered on a schedule by Vercel Cron (see the `crons` entry in
// vercel.json) — not by user traffic — which is what makes this a
// background workload rather than a request-handling endpoint.

import type { VercelRequest, VercelResponse } from "@vercel/node";
import prisma from "../src/config/db";

interface ReviewAggregate {
  productId: string;
  count: number;
  averageRating: number;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Vercel Cron requests carry this header automatically; anyone else
  // hitting the URL directly needs the shared secret. Keeps a public
  // serverless URL from being triggerable (and DB-writable) by strangers.
  const isCron = req.headers["x-vercel-cron"] !== undefined;
  const hasSecret =
    req.headers.authorization === `Bearer ${process.env.CRON_SECRET}`;

  if (!isCron && !hasSecret) {
    res.status(401).json({ message: "Not authorized" });
    return;
  }

  const reviewServiceUrl = process.env.REVIEW_SERVICE_URL;
  if (!reviewServiceUrl) {
    res.status(500).json({ message: "REVIEW_SERVICE_URL is not configured" });
    return;
  }

  try {
    const products = await prisma.product.findMany({ select: { id: true } });

    let updated = 0;
    const failures: string[] = [];

    for (const product of products) {
      try {
        const response = await fetch(
          `${reviewServiceUrl}/api/reviews/${product.id}`,
        );
        if (!response.ok) {
          failures.push(product.id);
          continue;
        }

        const aggregate = (await response.json()) as ReviewAggregate;

        await prisma.product.update({
          where: { id: product.id },
          data: {
            rating: aggregate.averageRating,
            numReviews: aggregate.count,
          },
        });
        updated += 1;
      } catch {
        failures.push(product.id);
      }
    }

    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "info",
        message: "product rating sync completed",
        totalProducts: products.length,
        updated,
        failed: failures.length,
      }),
    );

    res.status(200).json({
      message: "Product ratings synced",
      totalProducts: products.length,
      updated,
      failed: failures.length,
    });
  } catch (error) {
    console.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "error",
        message: (error as Error).message,
      }),
    );
    res.status(500).json({ message: (error as Error).message });
  }
}
