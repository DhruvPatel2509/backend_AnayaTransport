import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SEC,
});

// Upload file to Cloudinary with compression
const uploadOnCloudinary = (filePath, folder, publicId) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      filePath,
      {
        resource_type: "image",
        folder: folder,
        public_id: publicId, // Custom name format: id_imageType
        width: 800, // Resize to max 800px width
        quality: "auto:low", // Auto compress image
        format: "jpg", // Convert all images to JPG
        transformation: [{ fetch_format: "auto", quality: "auto" }],
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Upload Error:", error.message);
          return reject(error);
        }
        // Delete local file after successful upload
        fs.unlink(filePath, (err) => {
          if (err) console.error("File deletion error:", err);
        });
        resolve(result);
      }
    );
  });
};

export default uploadOnCloudinary;
