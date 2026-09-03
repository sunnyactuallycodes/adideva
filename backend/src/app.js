import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
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

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app") ||
        process.env.NODE_ENV !== "production"
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Body and URL parsers
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(cookieParser(process.env.COOKIE_SECRET || "bookmyindia_secret"));
app.use(express.static("public"));

// Healthcheck route
app.get("/api/v1/health", (req, res) => {
  return res.status(200).json({
    status: "ok",
    message: "BookMyIndia API is healthy and operational",
    timestamp: new Date().toISOString(),
  });
});

// Mount module routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/packages", packageRouter);
app.use("/api/v1/orders", orderRouter);

// 404 Route Handler
app.use(notFoundHandler);

// Centralized Global Error Handler
app.use(errorHandler);

export default app;
