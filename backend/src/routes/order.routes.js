import { Router } from "express";
import {
  calculatePrice,
  createRazorpayOrder,
  verifyAndCreateOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/order.controller.js";
import {
  verifyJWT,
  optionalAuth,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";

const router = Router();

// Payment & Booking routes (open to guests and logged-in users)
router.post("/calculate-price", optionalAuth, calculatePrice);
router.post("/razorpay-order", optionalAuth, createRazorpayOrder);
router.post("/verify", optionalAuth, verifyAndCreateOrder);
router.get("/my-orders", optionalAuth, getMyOrders);

// Admin-only order routes
router.get("/", verifyJWT, authorizeRoles("admin"), getAllOrders);
router.patch("/:id/status", verifyJWT, authorizeRoles("admin"), updateOrderStatus);

// Single order lookup
router.get("/:id", optionalAuth, getOrderById);

export default router;
