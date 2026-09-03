import app from "../src/app.js";
import connectDB, { isDbConnected } from "../src/config/db.js";

let dbPromise = null;

export default async function handler(req, res) {
  if (!isDbConnected) {
    if (!dbPromise) {
      dbPromise = connectDB().catch((err) => {
        console.warn("Serverless DB connection notice:", err.message);
        dbPromise = null;
      });
    }
    await dbPromise;
  }

  return app(req, res);
}
