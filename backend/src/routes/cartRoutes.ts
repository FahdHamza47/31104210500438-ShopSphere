import express from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../controllers/cartController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

// All cart routes require the user to be logged in
router.use(protect);

router.get("/", getCart);
router.post("/", addToCart);
router.put("/:productId", updateCartItem);
router.delete("/:productId", removeFromCart);
router.delete("/", clearCart);

export default router;
