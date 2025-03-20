import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SEC,
});

const uploadOnCloudinary = (fileBuffer, fileName, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "auto", folder: folder },
      (error, result) => {
        if (error) {
          console.error("Failed to upload on Cloudinary:", error.message);
          return reject(error);
        }
        resolve(result);
      }
    );

    // Pipe the buffer to Cloudinary
    stream.end(fileBuffer);
  });
};

export default uploadOnCloudinary;
