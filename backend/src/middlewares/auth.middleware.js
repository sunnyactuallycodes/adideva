import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { isDbConnected } from "../config/db.js";
import { inMemoryStore } from "../utils/inMemoryStore.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Middleware to verify JWT token from Authorization header or cookies
 */
export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized request. No token provided.");
  }

  try {
    const secret = process.env.JWT_SECRET || "bookmyindia_super_secure_jwt_secret_key_2026_luxury_travel";
    const decodedToken = jwt.verify(token, secret);

    let user = null;

    if (isDbConnected) {
      try {
        user = await User.findById(decodedToken?._id).select("-password");
      } catch (e) {
        console.warn("verifyJWT DB lookup fallback:", e.message);
      }
    }

    if (!user) {
      user = inMemoryStore.users.find(
        (u) =>
          u._id === decodedToken?._id ||
          u.id === decodedToken?._id ||
          u.email === decodedToken?.email
      );
    }

    if (!user) {
      // Fallback construct user from token claims
      user = {
        _id: decodedToken?._id,
        email: decodedToken?.email,
        name: decodedToken?.name,
        role: decodedToken?.role || "user",
        status: "active",
      };
    }

    if (user.status === "inactive") {
      throw new ApiError(403, "Your account has been deactivated. Please contact support.");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid or expired access token.");
  }
});

/**
 * Optional authentication middleware: attaches req.user if a valid token exists
 */
export const optionalAuth = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (token) {
    try {
      const secret = process.env.JWT_SECRET || "bookmyindia_super_secure_jwt_secret_key_2026_luxury_travel";
      const decodedToken = jwt.verify(token, secret);

      let user = null;
      if (isDbConnected) {
        try {
          user = await User.findById(decodedToken?._id).select("-password");
        } catch {}
      }

      if (!user) {
        user = inMemoryStore.users.find(
          (u) =>
            u._id === decodedToken?._id ||
            u.id === decodedToken?._id ||
            u.email === decodedToken?.email
        );
      }

      if (!user && decodedToken?.email) {
        user = {
          _id: decodedToken?._id,
          email: decodedToken?.email,
          name: decodedToken?.name,
          role: decodedToken?.role || "user",
          status: "active",
        };
      }

      if (user && user.status === "active") {
        req.user = user;
      }
    } catch {}
  }
  next();
});

/**
 * Middleware for Role-Based Access Control (e.g., 'admin', 'user')
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ApiError(
        403,
        `Access denied. Role (${req.user?.role || "guest"}) is not authorized to access this resource.`
      );
    }
    next();
  };
};
