import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name:
    process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.CLOUDINARY_CLOUDNAME ||
    "di2y9s4lo",
  api_key:
    process.env.CLOUDINARY_API_KEY ||
    process.env.CLOUDINARY_APIKEY ||
    "867852488778659",
  api_secret:
    process.env.CLOUDINARY_API_SECRET ||
    process.env.CLOUDINARY_SECRET ||
    "r0LfXZoCx0YTU0AJKBo2xHRFPiU",
  secure: true,
});

export default cloudinary;
