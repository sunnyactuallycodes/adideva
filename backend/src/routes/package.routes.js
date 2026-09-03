import { Router } from "express";
import {
  getAllPackages,
  getPackageById,
  createPackage,
  updatePackage,
  togglePackageActive,
  deletePackage,
} from "../controllers/package.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// Public routes
router.get("/", getAllPackages);
router.get("/:id", getPackageById);

// Admin-only management routes
router.post(
  "/",
  verifyJWT,
  authorizeRoles("admin"),
  upload.single("image"),
  createPackage
);

router.put(
  "/:id",
  verifyJWT,
  authorizeRoles("admin"),
  upload.single("image"),
  updatePackage
);

router.patch(
  "/:id/toggle-active",
  verifyJWT,
  authorizeRoles("admin"),
  togglePackageActive
);

router.delete(
  "/:id",
  verifyJWT,
  authorizeRoles("admin"),
  deletePackage
);

export default router;
