import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import connectDB, { isDbConnected } from "./config/db.js";
import { notFoundHandler, errorHandler } from "./middlewares/error.middleware.js";

// Import modular routers
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import packageRouter from "./routes/package.routes.js";
import orderRouter from "./routes/order.routes.js";

const app = express();

// Allowed origins for CORS (local development + Vercel deployments)
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith(".vercel.app") ||
      origin.includes("localhost") ||
      process.env.NODE_ENV !== "production"
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Database auto-connection middleware for serverless invocations
app.use(async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    try {
      await connectDB();
    } catch (e) {
      console.warn("DB connection notice in middleware:", e.message);
    }
  }
  next();
});

// Body and URL parsers
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
app.use(cookieParser(process.env.COOKIE_SECRET || "bookmyindia_secret"));

// Serve static public folder safely
try {
  app.use(express.static("public"));
} catch (e) {
  // Ignore in serverless
}

// Healthcheck & Diagnostic Routes
const healthcheckHandler = (req, res) => {
  return res.status(200).json({
    status: "ok",
    service: "BookMyIndia Backend API",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "production",
    database: mongoose.connection.readyState === 1 || isDbConnected ? "connected" : "fallback_mode",
    timestamp: new Date().toISOString(),
    endpoints: {
      health: "/api/v1/health",
      packages: "/api/v1/packages",
      orders: "/api/v1/orders",
      auth: "/api/v1/auth",
      users: "/api/v1/users",
    },
  });
};

app.get("/", healthcheckHandler);
app.get("/health", healthcheckHandler);
app.get("/api", healthcheckHandler);
app.get("/api/health", healthcheckHandler);
app.get("/api/v1", healthcheckHandler);
app.get("/api/v1/health", healthcheckHandler);

// 1. Primary API routes (/api/v1/*)
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/packages", packageRouter);
app.use("/api/v1/orders", orderRouter);

// 2. Secondary API routes (/api/*) for backwards compatibility
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/packages", packageRouter);
app.use("/api/orders", orderRouter);

// 3. Direct root aliases (/*) to prevent 404s if baseUrl lacks /api/v1 prefix
app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use("/packages", packageRouter);
app.use("/orders", orderRouter);

// 404 Route Handler
app.use(notFoundHandler);

// Centralized Global Error Handler
app.use(errorHandler);

export default app;
