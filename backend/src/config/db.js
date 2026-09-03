import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "../models/user.model.js";
import { Package } from "../models/package.model.js";
import { inMemoryStore } from "../utils/inMemoryStore.js";

dotenv.config();

export let isDbConnected = false;

/**
 * Initialize default Admin and seed data if database is empty
 */
const initDefaultDatabaseData = async () => {
  try {
    // 1. Ensure default Admin user exists: adideva@gmail.com / 12345678
    const adminEmail = "adideva@gmail.com";
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      await User.create({
        name: "Adideva Admin",
        email: adminEmail,
        password: "12345678",
        role: "admin",
        phone: "+91 98765 43210",
        city: "New Delhi",
        status: "active",
      });
      console.log("👑 Default Admin user (adideva@gmail.com / 12345678) initialized in MongoDB Atlas!");
    } else {
      let changed = false;
      if (existingAdmin.role !== "admin") {
        existingAdmin.role = "admin";
        changed = true;
      }
      const isMatch = await existingAdmin.isPasswordCorrect("12345678");
      if (!isMatch) {
        existingAdmin.password = "12345678";
        changed = true;
      }
      if (changed) {
        await existingAdmin.save();
        console.log("👑 Default Admin user (adideva@gmail.com / 12345678) updated with latest admin credentials!");
      }
    }

    // 2. Ensure initial packages are populated in MongoDB Atlas if empty
    const pkgCount = await Package.countDocuments();
    if (pkgCount === 0 && inMemoryStore.packages.length > 0) {
      console.log("📦 Auto-populating packages to MongoDB Atlas...");
      await Package.insertMany(inMemoryStore.packages);
      console.log(`✅ Seeded ${inMemoryStore.packages.length} luxury tour packages to Atlas database.`);
    }
  } catch (err) {
    console.warn("DB auto-init notice:", err.message);
  }
};

/**
 * Connect to MongoDB database via Mongoose with graceful fallback
 */
const connectDB = async () => {
  const mongoUri =
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    "mongodb+srv://wr3dman:Sunny123@cluster.l9sawiy.mongodb.net/bookmyindia?retryWrites=true&w=majority&appName=cluster";

  try {
    const connectionInstance = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 8000,
    });
    isDbConnected = true;
    console.log(
      `\n✅ MongoDB Atlas connected successfully! DB HOST: ${connectionInstance.connection.host}`
    );

    // Initialize admin user and seed data
    await initDefaultDatabaseData();

    return true;
  } catch (error) {
    isDbConnected = false;
    console.warn(
      "⚠️ MongoDB Atlas connection notice:",
      error.message,
      "— operating in resilient fallback mode with live memory sync."
    );
    return false;
  }
};

export default connectDB;
