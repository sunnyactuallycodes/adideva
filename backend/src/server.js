import dotenv from "dotenv";
import connectDB from "./config/db.js";
import "./config/redis.js"; // Initialize redis listener
import app from "./app.js";

dotenv.config();

const PORT = Number(process.env.PORT) || 5001;

// Start server
const startServer = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`\n 🚀 BookMyIndia API server running on: http://localhost:${PORT}`);
    console.log(` 📋 Healthcheck: http://localhost:${PORT}/api/v1/health`);
    console.log(` 📦 Packages:    http://localhost:${PORT}/api/v1/packages`);
    console.log(` 🧾 Orders:      http://localhost:${PORT}/api/v1/orders`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.warn(`Port ${PORT} is busy. Trying fallback port ${PORT + 1}...`);
      app.listen(PORT + 1, () => {
        console.log(`\n 🚀 BookMyIndia API server running on fallback port: http://localhost:${PORT + 1}`);
      });
    } else {
      console.error("Server startup error:", err);
    }
  });
};

startServer();
