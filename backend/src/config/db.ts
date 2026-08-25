import { PrismaClient } from "@prisma/client";

// Reuse a single PrismaClient across hot reloads in dev / serverless
// invocations, instead of opening a fresh connection pool every import.
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

const prisma =
  global.__prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.__prisma = prisma;
}

export const connectDB = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log("✅ Supabase PostgreSQL connected (Prisma)");
  } catch (error) {
    console.error(
      `❌ Error connecting to PostgreSQL: ${(error as Error).message}`,
    );
    process.exit(1); // Stop the app if we can't connect to the DB
  }
};

export default prisma;
