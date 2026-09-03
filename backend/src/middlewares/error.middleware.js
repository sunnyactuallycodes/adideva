import { ApiError } from "../utils/apiError.js";

/**
 * 404 Route Not Found Handler
 */
export const notFoundHandler = (req, res, next) => {
  const error = new ApiError(404, `Route not found - ${req.originalUrl}`);
  next(error);
};

/**
 * Global Centralized Error Handling Middleware
 */
export const errorHandler = (err, req, res, next) => {
  let error = err;

  // If error is not an instance of ApiError, normalize it
  if (!(error instanceof ApiError)) {
    const statusCode =
      error.statusCode || (error.name === "ValidationError" ? 400 : 500);
    const message = error.message || "Internal Server Error";
    error = new ApiError(statusCode, message, error?.errors || [], err.stack);
  }

  // Handle Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    error = new ApiError(409, `Duplicate value for ${field}. Please use another value.`);
  }

  // Handle Mongoose invalid ObjectId CastError
  if (err.name === "CastError") {
    error = new ApiError(400, `Resource not found. Invalid ID format.`);
  }

  // Handle JSON Web Token Error
  if (err.name === "JsonWebTokenError") {
    error = new ApiError(401, "Invalid access token.");
  }

  // Handle Token Expired Error
  if (err.name === "TokenExpiredError") {
    error = new ApiError(401, "Access token has expired. Please login again.");
  }

  const response = {
    statusCode: error.statusCode,
    success: false,
    message: error.message,
    errors: error.errors || [],
    ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {}),
  };

  return res.status(error.statusCode || 500).json(response);
};
