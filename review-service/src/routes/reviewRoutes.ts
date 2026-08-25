import express from "express";
import { getProductReviews, createReview, deleteReview } from "../controllers/reviewController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/:productId", getProductReviews);
router.post("/:productId", protect, createReview);
router.delete("/:id", protect, deleteReview);

export default router;
