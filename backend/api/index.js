import app from "../src/app.js";
import connectDB from "../src/config/db.js";

// Ensure DB connection is initiated on serverless cold start
connectDB().catch((err) => {
  console.warn("Serverless DB connection init notice:", err.message);
});

export default app;
