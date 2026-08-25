import { Request, Response } from "express";
import prisma from "../config/db";
import { AuthRequest } from "../middleware/authMiddleware";

// @route  GET /api/reviews/:productId
// Public — anyone browsing a product page can read its reviews.
export const getProductReviews = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { productId },
      orderBy: { createdAt: "desc" },
    });

    const count = reviews.length;
    const averageRating =
      count === 0 ? 0 : reviews.reduce((sum, r) => sum + r.rating, 0) / count;

    res.json({
      productId,
      count,
      averageRating: Math.round(averageRating * 10) / 10,
      reviews,
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @route  POST /api/reviews/:productId
// Requires a valid ShopSphere auth token. Body: { name, rating, comment }
// `name` comes from the client's own session (see ADR) since this service
// has no users table to look a display name up in.
export const createReview = async (req: AuthRequest, res: Response) => {
  try {
    const { productId } = req.params;
    const { name, rating, comment } = req.body;

    if (!name || !rating || !comment) {
      res.status(400).json({ message: "name, rating, and comment are required" });
      return;
    }

    const numericRating = Number(rating);
    if (numericRating < 1 || numericRating > 5) {
      res.status(400).json({ message: "rating must be between 1 and 5" });
      return;
    }

    const existing = await prisma.review.findFirst({
      where: { productId, userId: req.user!.id },
    });
    if (existing) {
      res
        .status(400)
        .json({ message: "You have already reviewed this product" });
      return;
    }

    const review = await prisma.review.create({
      data: {
        productId,
        userId: req.user!.id,
        userName: name,
        rating: numericRating,
        comment,
      },
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @route  DELETE /api/reviews/:id
// A user may delete their own review; an admin may delete any review.
export const deleteReview = async (req: AuthRequest, res: Response) => {
  try {
    const review = await prisma.review.findUnique({ where: { id: req.params.id } });
    if (!review) {
      res.status(404).json({ message: "Review not found" });
      return;
    }

    if (review.userId !== req.user!.id && req.user!.role !== "admin") {
      res.status(403).json({ message: "Not authorized to delete this review" });
      return;
    }

    await prisma.review.delete({ where: { id: req.params.id } });
    res.json({ message: "Review removed" });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
