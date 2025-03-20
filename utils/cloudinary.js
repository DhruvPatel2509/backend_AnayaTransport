import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import fs from "fs"; // Import fs to delete files after upload

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SEC,
});

// Upload file to Cloudinary using file path
const uploadOnCloudinary = (filePath, folder) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      filePath,
      { resource_type: "auto", folder: folder },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Upload Error:", error.message);
          return reject(error);
        }
        // Delete local file after successful upload
        fs.unlinkSync(filePath);
        resolve(result);
      }
    );
  });
};

export default uploadOnCloudinary;
