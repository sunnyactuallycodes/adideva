import multer from "multer";
import path from "path";
import fs from "fs";
import { ApiError } from "../utils/apiError.js";

import os from "os";

// Ensure temp upload directory exists in writable OS temp folder (compatible with Vercel Serverless / AWS Lambda)
const tempDir = path.join(os.tmpdir(), "bmi_uploads");
try {
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
} catch (e) {
  // If filesystem creation fails, storage fallback is preserved
  console.warn("Notice: Temp upload directory creation skipped or using memory storage:", e.message);
}

// Disk storage for file uploads (pointing to /tmp on serverless)
const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    try {
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      cb(null, tempDir);
    } catch (err) {
      cb(null, os.tmpdir());
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname || "image.jpg");
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// Memory storage for direct buffer upload
const memoryStorage = multer.memoryStorage();

// File filter for images
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/jpg",
    "image/gif",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        400,
        "Invalid file format. Only JPEG, JPG, PNG, WEBP, and GIF images are allowed."
      ),
      false
    );
  }
};

export const upload = multer({
  storage: diskStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter,
});

export const uploadMemory = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter,
});
