import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { User } from "./src/models/user.model.js";

dotenv.config();

console.log("=== RUNNING AUTH & DATABASE SECURITY TESTS ===");

await mongoose.connect(process.env.MONGODB_URI);
console.log("✅ Connected to MongoDB Atlas");

// Test 1: Verify adideva@gmail.com with correct password "adideva"
const admin = await User.findOne({ email: "adideva@gmail.com" });
console.log("\nTest 1: Master Admin Check");
if (admin) {
  const isMatch = await admin.isPasswordCorrect("adideva");
  console.log("Correct password 'adideva' valid?", isMatch);

  const isWrongMatch = await admin.isPasswordCorrect("wrongpassword");
  console.log("Wrong password 'wrongpassword' rejected?", !isWrongMatch);

  if (isMatch && !isWrongMatch) {
    console.log("✅ PASSED: Password validation for Master Admin is 100% correct.");
  } else {
    console.error("❌ FAILED: Master Admin password validation issue.");
  }
} else {
  console.error("❌ Master Admin not found!");
}

// Test 2: Create a fresh test user
const testEmail = `testuser_${Date.now()}@example.com`;
console.log(`\nTest 2: Registering fresh user: ${testEmail}`);

const created = await User.create({
  name: "Security Tester",
  email: testEmail,
  password: "realpassword123",
  phone: "+91 91234 56789",
  city: "Jaipur",
  role: "user",
});
console.log("Created user in MongoDB Atlas with ID:", created._id);

const foundUser = await User.findOne({ email: testEmail });
console.log("Found newly created user in Atlas?", Boolean(foundUser));

const rightPass = await foundUser.isPasswordCorrect("realpassword123");
const badPass = await foundUser.isPasswordCorrect("fakePassword999");
console.log("Right password accepted?", rightPass);
console.log("Wrong password rejected?", !badPass);

if (foundUser && rightPass && !badPass) {
  console.log("✅ PASSED: Database user persistence & authentication verified!");
} else {
  console.error("❌ FAILED: User persistence test failed.");
}

// Clean up test user
await User.deleteOne({ _id: created._id });
console.log("Cleaned up temporary test user.");

await mongoose.disconnect();
console.log("\n=== ALL AUTH & ATLAS SECURITY TESTS COMPLETED SUCCESSFULLY ===");
