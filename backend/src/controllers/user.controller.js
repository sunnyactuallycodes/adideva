import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Order } from "../models/order.model.js";
import { Package } from "../models/package.model.js";
import { isDbConnected } from "../config/db.js";
import { inMemoryStore } from "../utils/inMemoryStore.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * @desc    Get current user profile
 * @route   GET /api/v1/users/profile
 * @access  Private
 */
export const getUserProfile = asyncHandler(async (req, res) => {
  let user = req.user;

  if (mongoose.connection.readyState === 1 || isDbConnected) {
    try {
      if (req.user?._id) {
        const dbUser = await User.findById(req.user._id).select("-password");
        if (dbUser) user = dbUser;
      }
    } catch {}
  }

  if (!user) {
    user = inMemoryStore.users[0];
  }

  const { passwordHash: _, ...safeUser } = user._doc || user;
  return res.status(200).json(new ApiResponse(200, { user: safeUser }, "User profile retrieved"));
});

/**
 * @desc    Update user profile
 * @route   PUT /api/v1/users/profile
 * @access  Private
 */
export const updateUserProfile = asyncHandler(async (req, res) => {
  const { name, phone, city, avatar } = req.body;
  let user = req.user;

  if (mongoose.connection.readyState === 1 || isDbConnected) {
    try {
      if (req.user?._id) {
        const updateFields = {};
        if (name) updateFields.name = name.trim();
        if (phone !== undefined) updateFields.phone = phone.trim();
        if (city !== undefined) updateFields.city = city.trim();
        if (avatar) updateFields.avatar = avatar;

        const updatedDb = await User.findByIdAndUpdate(req.user._id, updateFields, { new: true }).select("-password");
        if (updatedDb) user = updatedDb;
      }
    } catch (e) {
      console.warn("Update profile DB error:", e.message);
    }
  }

  if (user) {
    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (city !== undefined) user.city = city.trim();
    if (avatar) user.avatar = avatar;
  }

  const { passwordHash: _, ...safeUser } = user._doc || user;
  return res.status(200).json(new ApiResponse(200, { user: safeUser }, "Profile updated successfully"));
});

/**
 * @desc    Get all users from MongoDB Atlas (Admin only)
 * @route   GET /api/v1/users
 * @access  Private/Admin
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const { search, status } = req.query;

  let dbUsers = [];
  if (mongoose.connection.readyState === 1 || isDbConnected) {
    try {
      const query = {};
      if (status && status !== "all") query.status = status;
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { city: { $regex: search, $options: "i" } },
        ];
      }
      dbUsers = await User.find(query).select("-password").sort({ createdAt: -1 });
    } catch (e) {
      console.warn("DB getAllUsers error:", e.message);
    }
  }

  // If DB empty or returned 0, fallback to in-memory store
  if (!dbUsers || dbUsers.length === 0) {
    let users = inMemoryStore.users;
    if (status && status !== "all") {
      users = users.filter((u) => u.status === status);
    }
    if (search) {
      const q = search.toLowerCase();
      users = users.filter(
        (u) =>
          u.name?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.city?.toLowerCase().includes(q)
      );
    }
    dbUsers = users.map(({ passwordHash: _, ...u }) => u);
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        users: dbUsers,
        total: dbUsers.length,
        page: 1,
        pages: 1,
      },
      "Users retrieved successfully from database"
    )
  );
});

/**
 * @desc    Toggle user status active/inactive (Admin only)
 * @route   PATCH /api/v1/users/:id/status
 * @access  Private/Admin
 */
export const updateUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  let updatedUser = null;

  if (mongoose.connection.readyState === 1 || isDbConnected) {
    try {
      if (String(id).match(/^[0-9a-fA-F]{24}$/)) {
        updatedUser = await User.findByIdAndUpdate(id, { status }, { new: true }).select("-password");
      }
    } catch (e) {
      console.warn("updateUserStatus DB error:", e.message);
    }
  }

  const idx = inMemoryStore.users.findIndex(
    (u) => u.id === id || String(u._id) === id
  );
  if (idx !== -1) {
    inMemoryStore.users[idx].status = status;
    if (!updatedUser) updatedUser = inMemoryStore.users[idx];
  }

  const { passwordHash: _, ...safeUser } = updatedUser || {};
  return res
    .status(200)
    .json(new ApiResponse(200, { user: safeUser }, `User marked as ${status}`));
});

/**
 * @desc    Get comprehensive dashboard analytics from MongoDB Atlas (Admin only)
 * @route   GET /api/v1/users/admin/stats
 * @access  Private/Admin
 */
export const getAdminDashboardStats = asyncHandler(async (req, res) => {
  let totalRevenue = 0;
  let confirmedOrders = 0;
  let totalOrders = 0;
  let totalGuests = 0;
  let totalPackages = 0;
  let activePackages = 0;
  let totalUsers = 0;
  let activeUsers = 0;

  if (mongoose.connection.readyState === 1 || isDbConnected) {
    try {
      const orders = await Order.find();
      totalOrders = orders.length;
      totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
      confirmedOrders = orders.filter((o) => o.status === "confirmed").length;
      totalGuests = orders.reduce((sum, o) => sum + (o.guests || 1), 0);

      totalPackages = await Package.countDocuments();
      activePackages = await Package.countDocuments({ active: true });

      totalUsers = await User.countDocuments();
      activeUsers = await User.countDocuments({ status: "active" });
    } catch (e) {
      console.warn("DB getAdminDashboardStats fallback:", e.message);
    }
  }

  if (totalOrders === 0 && inMemoryStore.orders.length > 0) {
    const orders = inMemoryStore.orders;
    totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    confirmedOrders = orders.filter((o) => o.status === "confirmed").length;
    totalGuests = orders.reduce((sum, o) => sum + (o.guests || 1), 0);
    totalOrders = orders.length;
  }

  if (totalPackages === 0) {
    totalPackages = inMemoryStore.packages.length;
    activePackages = inMemoryStore.packages.filter((p) => p.active).length;
  }

  if (totalUsers === 0) {
    totalUsers = inMemoryStore.users.length;
    activeUsers = inMemoryStore.users.filter((u) => u.status === "active").length;
  }

  const stats = {
    totalRevenue,
    confirmedOrders,
    totalOrders,
    totalGuests,
    totalPackages,
    activePackages,
    totalUsers,
    activeUsers,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, stats, "Admin analytics retrieved successfully"));
});
