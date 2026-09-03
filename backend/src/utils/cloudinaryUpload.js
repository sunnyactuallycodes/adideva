import cloudinary from "../config/cloudinary.js";
import fs from "fs";

/**
 * Upload file from local path to Cloudinary
 * @param {string} localFilePath - Path to local file
 * @param {string} folder - Destination folder on Cloudinary
 * @returns {Promise<object|null>}
 */
export const uploadOnCloudinary = async (localFilePath, folder = "bookmyindia") => {
  try {
    if (!localFilePath) return null;

    // Check if Cloudinary is configured with actual keys
    const cloudName =
      process.env.CLOUDINARY_CLOUD_NAME ||
      process.env.CLOUDINARY_CLOUDNAME ||
      "di2y9s4lo";
    if (!cloudName || cloudName === "demo") {
      console.warn("Cloudinary not configured with production keys; returning local path simulation.");
      return {
        url: localFilePath.startsWith("http") ? localFilePath : `https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&auto=format&fit=crop`,
        public_id: `demo_${Date.now()}`,
      };
    }

    const response = await cloudinary.uploader.upload(localFilePath, {
      folder,
      resource_type: "auto",
    });

    // Remove local temp file after upload
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return response;
  } catch (error) {
    if (localFilePath && fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    console.error("Cloudinary upload error:", error);
    return null;
  }
};

/**
 * Upload file from memory buffer to Cloudinary
 * @param {Buffer} buffer
 * @param {string} folder
 * @returns {Promise<object>}
 */
export const uploadBufferOnCloudinary = async (buffer, folder = "bookmyindia") => {
  return new Promise((resolve, reject) => {
    const cloudName =
      process.env.CLOUDINARY_CLOUD_NAME ||
      process.env.CLOUDINARY_CLOUDNAME ||
      "di2y9s4lo";
    if (!cloudName || cloudName === "demo") {
      return resolve({
        url: `https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&auto=format&fit=crop`,
        public_id: `demo_buf_${Date.now()}`,
      });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "auto" },
      (error, result) => {
        if (error) {
          console.error("Cloudinary buffer upload error:", error);
          return reject(error);
        }
        resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
};

/**
 * Delete an asset from Cloudinary by public ID
 * @param {string} publicId
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId || publicId.startsWith("demo")) return true;
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    console.error("Failed to delete asset from Cloudinary:", error);
    return false;
  }
};
