import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "./src/models/user.model.js";
import { Package } from "./src/models/package.model.js";

dotenv.config();

const uri = process.env.MONGODB_URI;
console.log("Connecting to Atlas URI...");

try {
  await mongoose.connect(uri);
  console.log("✅ Successfully connected to MongoDB Atlas!");

  const count = await User.countDocuments();
  console.log("Current Users in Database:", count);

  // Check if adideva@gmail.com exists
  let admin = await User.findOne({ email: "adideva@gmail.com" });
  if (!admin) {
    console.log("Creating default admin user: adideva@gmail.com");
    admin = await User.create({
      name: "Adideva Admin",
      email: "adideva@gmail.com",
      password: "adideva",
      role: "admin",
      phone: "+91 98765 43210",
      city: "New Delhi",
      status: "active",
    });
    console.log("✅ Created admin user:", admin.email, "role:", admin.role);
  } else {
    console.log("Found existing admin user:", admin.email, "role:", admin.role);
  }

  const allUsers = await User.find().select("-password");
  console.log("All DB Users:", allUsers);

  const pkgCount = await Package.countDocuments();
  console.log("Current Packages in DB:", pkgCount);

  await mongoose.disconnect();
  console.log("Disconnected successfully.");
} catch (err) {
  console.error("❌ Connection or query error:", err);
}
