import express from "express";
import {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/orderController";
import { protect, admin } from "../middleware/authMiddleware";

const router = express.Router();

router.use(protect); // every order route requires login

router.post("/", createOrder);
router.get("/myorders", getMyOrders);

// Admin-only
router.get("/", admin, getAllOrders);
router.put("/:id/status", admin, updateOrderStatus);

export default router;
