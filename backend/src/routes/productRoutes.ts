import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
} from "../controllers/productController";
import { protect, admin } from "../middleware/authMiddleware";
import upload from "../middleware/uploadMiddleware";

const router = express.Router();

// Public routes - anyone can view products
router.get("/", getProducts);
router.get("/categories", getCategories);
router.get("/:id", getProductById);

// Admin-only routes - must be logged in AND be an admin
router.post("/", protect, admin, upload.array("images", 5), createProduct);
router.put("/:id", protect, admin, upload.array("images", 5), updateProduct);
router.delete("/:id", protect, admin, deleteProduct);

export default router;
