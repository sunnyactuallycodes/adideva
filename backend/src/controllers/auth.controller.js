import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { isDbConnected } from "../config/db.js";
import { inMemoryStore, generateToken } from "../utils/inMemoryStore.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

/**
 * @desc    Register a new user directly into MongoDB Atlas
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone, city, role } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email, and password are required fields.");
  }

  // Whitespace and format validation
  if (typeof email !== "string" || email.includes(" ")) {
    throw new ApiError(400, "Email address cannot contain spaces.");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    throw new ApiError(400, "Please enter a valid email address.");
  }

  if (typeof password !== "string" || password.startsWith(" ") || password.endsWith(" ")) {
    throw new ApiError(400, "Password cannot contain leading or trailing spaces.");
  }

  if (password.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters long.");
  }

  if (typeof name !== "string" || !name.trim() || name.trim().length < 2) {
    throw new ApiError(400, "Full name must be at least 2 characters long.");
  }

  const normalizedEmail = email.toLowerCase().trim();
  const userRole =
    normalizedEmail === "adideva@gmail.com" || role === "admin"
      ? "admin"
      : "user";

  let createdDbUser = null;
  let token = null;

  // 1. Check and save into MongoDB Atlas if connected
  const isAtlasReady = mongoose.connection.readyState === 1 || isDbConnected;
  if (isAtlasReady) {
    try {
      const existingDb = await User.findOne({ email: normalizedEmail });
      if (existingDb) {
        throw new ApiError(409, "A user with this email address already exists.");
      }

      createdDbUser = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password,
        phone: phone ? phone.trim() : "",
        city: city ? city.trim() : "",
        role: userRole,
      });

      token = createdDbUser.generateAccessToken();
    } catch (e) {
      if (e instanceof ApiError) throw e;
      console.warn("User register DB error, writing to memory fallback:", e.message);
    }
  }

  // 2. Sync to in-memory store
  const passwordHash = await bcrypt.hash(password, 10);
  const newUserObj = {
    _id: createdDbUser?._id?.toString() || `user_${Date.now()}`,
    id: `U${Math.floor(100 + Math.random() * 900)}`,
    name: name.trim(),
    email: normalizedEmail,
    role: userRole,
    phone: phone ? phone.trim() : "",
    city: city ? city.trim() : "",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
    status: "active",
    totalBookings: 0,
    totalSpent: 0,
    createdAt: new Date(),
    passwordHash,
  };

  const memIdx = inMemoryStore.users.findIndex((u) => u.email === normalizedEmail);
  if (memIdx !== -1) {
    inMemoryStore.users[memIdx] = newUserObj;
  } else {
    inMemoryStore.users.push(newUserObj);
  }

  if (!token) {
    token = generateToken(newUserObj);
  }

  const safeUser = createdDbUser
    ? {
        _id: createdDbUser._id,
        name: createdDbUser.name,
        email: createdDbUser.email,
        role: createdDbUser.role,
        phone: createdDbUser.phone,
        city: createdDbUser.city,
        avatar: createdDbUser.avatar,
        status: createdDbUser.status,
        totalBookings: createdDbUser.totalBookings,
        totalSpent: createdDbUser.totalSpent,
        createdAt: createdDbUser.createdAt,
      }
    : {
        _id: newUserObj._id,
        name: newUserObj.name,
        email: newUserObj.email,
        role: newUserObj.role,
        phone: newUserObj.phone,
        city: newUserObj.city,
        avatar: newUserObj.avatar,
        status: newUserObj.status,
        totalBookings: newUserObj.totalBookings,
        totalSpent: newUserObj.totalSpent,
        createdAt: newUserObj.createdAt,
      };

  return res
    .status(201)
    .cookie("accessToken", token, cookieOptions)
    .json(
      new ApiResponse(
        201,
        {
          user: safeUser,
          token,
        },
        "User registered successfully"
      )
    );
});

/**
 * @desc    Login user with MongoDB Atlas credentials
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required.");
  }

  if (typeof email !== "string" || email.includes(" ")) {
    throw new ApiError(400, "Email address cannot contain spaces.");
  }

  if (typeof password !== "string" || password.startsWith(" ") || password.endsWith(" ")) {
    throw new ApiError(400, "Password cannot contain leading or trailing spaces.");
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Special Master Admin check for adideva@gmail.com / 12345678
  if (normalizedEmail === "adideva@gmail.com") {
    if (password !== "12345678") {
      throw new ApiError(401, "Invalid email or password.");
    }

    let adminUser = null;
    if (mongoose.connection.readyState === 1 || isDbConnected) {
      try {
        adminUser = await User.findOne({ email: "adideva@gmail.com" });
        if (!adminUser) {
          adminUser = await User.create({
            name: "Adideva Admin",
            email: "adideva@gmail.com",
            password: "12345678",
            role: "admin",
            phone: "+91 98765 43210",
            city: "New Delhi",
            status: "active",
          });
        } else {
          let changed = false;
          if (adminUser.role !== "admin") {
            adminUser.role = "admin";
            changed = true;
          }
          const isMatch = await adminUser.isPasswordCorrect("12345678");
          if (!isMatch) {
            adminUser.password = "12345678";
            changed = true;
          }
          if (changed) {
            await adminUser.save();
          }
        }
      } catch (err) {
        console.warn("Admin lookup DB notice:", err.message);
      }
    }

    const token = adminUser
      ? adminUser.generateAccessToken()
      : generateToken({
          _id: "admin_adideva",
          email: "adideva@gmail.com",
          name: "Adideva Admin",
          role: "admin",
        });

    const safeAdmin = {
      _id: adminUser?._id || "admin_adideva",
      name: adminUser?.name || "Adideva Admin",
      email: "adideva@gmail.com",
      role: "admin",
      phone: adminUser?.phone || "+91 98765 43210",
      city: adminUser?.city || "New Delhi",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
      status: "active",
    };

    return res
      .status(200)
      .cookie("accessToken", token, cookieOptions)
      .json(new ApiResponse(200, { user: safeAdmin, token }, "Admin login successful"));
  }

  // 1. Query MongoDB Atlas
  const isAtlasReady = mongoose.connection.readyState === 1 || isDbConnected;
  if (isAtlasReady) {
    try {
      const dbUser = await User.findOne({ email: normalizedEmail });
      if (dbUser) {
        const isMatch = await dbUser.isPasswordCorrect(password);
        if (!isMatch) {
          throw new ApiError(401, "Invalid email or password.");
        }

        const token = dbUser.generateAccessToken();
        const safeDbUser = await User.findById(dbUser._id).select("-password");

        return res
          .status(200)
          .cookie("accessToken", token, cookieOptions)
          .json(new ApiResponse(200, { user: safeDbUser, token }, "Login successful"));
      }
    } catch (e) {
      if (e instanceof ApiError) throw e;
      console.warn("Login DB lookup error:", e.message);
    }
  }

  // 2. Check in-memory store fallback
  const memUser = inMemoryStore.users.find((u) => u.email === normalizedEmail);
  if (memUser) {
    let isMatch = false;
    if (memUser.passwordHash) {
      isMatch = await bcrypt.compare(password, memUser.passwordHash);
    }
    if (
      !isMatch &&
      ((normalizedEmail === "admin@bookmyindia.com" && password === "adminpassword123") ||
        (normalizedEmail === "traveller@bookmyindia.com" && password === "userpassword123"))
    ) {
      isMatch = true;
    }

    if (!isMatch) {
      throw new ApiError(401, "Invalid email or password.");
    }

    const token = generateToken(memUser);
    const { passwordHash: _, ...safeUser } = memUser;

    return res
      .status(200)
      .cookie("accessToken", token, cookieOptions)
      .json(new ApiResponse(200, { user: safeUser, token }, "Login successful"));
  }

  throw new ApiError(401, "Invalid email or password. Please check your credentials or sign up.");
});

/**
 * @desc    Get current user profile via JWT Token
 * @route   GET /api/v1/auth/me
 * @access  Private / Authenticated
 */
export const getCurrentUser = asyncHandler(async (req, res) => {
  let user = req.user;

  if (!user) {
    user = inMemoryStore.users[0];
  }

  const { passwordHash: _, ...safeUser } = user._doc || user;

  return res.status(200).json(
    new ApiResponse(200, { user: safeUser }, "Current user profile retrieved")
  );
});

/**
 * @desc    Logout user & clear cookie
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
export const logoutUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .json(new ApiResponse(200, null, "User logged out successfully"));
});
