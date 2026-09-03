import { Router } from "express";
import {
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  updateUserStatus,
  getAdminDashboardStats,
} from "../controllers/user.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();

// Protected user routes
router.get("/profile", verifyJWT, getUserProfile);
router.put("/profile", verifyJWT, updateUserProfile);

// Admin-only user management routes
router.get("/admin/stats", verifyJWT, authorizeRoles("admin"), getAdminDashboardStats);
router.get("/", verifyJWT, authorizeRoles("admin"), getAllUsers);
router.patch("/:id/status", verifyJWT, authorizeRoles("admin"), updateUserStatus);

export default router;
