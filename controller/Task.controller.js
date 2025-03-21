import sendResponse from "../utils/response.util.js";
import { DailyTask } from "../models/DailyTask.model.js";
import { WeeklyTask } from "../models/WeeklyTask.model.js";
import { TodayTask } from "../models/TodayTask.model.js";

import moment from "moment";
import uploadOnCloudinary from "../utils/cloudinary.js";
import { User } from "../models/User.model.js";

export const dailyTaskCheckIn = async (req, res) => {
  try {
    // const { isDamagedTruck, isInspection, isLight, isTierPressure } = req.body;
    const isDamagedTruck = false;
    const isInspection = true;
    const isLight = true;
    const isTierPressure = true;
    // Validate required fields
    if (
      isDamagedTruck === undefined ||
      isInspection === undefined ||
      isLight === undefined ||
      isTierPressure === undefined
    ) {
      return sendResponse(
        res,
        400,
        null,
        "Missing required fields in the request body."
      );
    }

    const userId = req.userId;

    // Fetch user details
    const user = await User.findById(userId);
    if (!user) {
      return sendResponse(res, 404, null, "User not found.");
    }

    // Extract image files from request
    const truckDisplayImage = req.files?.truckDisplayImage?.[0];
    const backTruckImage = req.files?.backTruckImage?.[0];
    const frontTruckImage = req.files?.frontTruckImage?.[0];
    const leftTruckImage = req.files?.leftTruckImage?.[0];
    const rightTruckImage = req.files?.rightTruckImage?.[0];
    const damageTruckImage = req.files?.damageTruckImage?.[0];

    // Validate required images
    if (
      !truckDisplayImage ||
      !backTruckImage ||
      !frontTruckImage ||
      !leftTruckImage ||
      !rightTruckImage
    ) {
      return sendResponse(
        res,
        400,
        null,
        "Missing required truck images. Please provide images of the back, front, left, right, and display view of the truck."
      );
    }

    // If truck is damaged, ensure damageTruckImage is provided
    if (isDamagedTruck && !damageTruckImage) {
      return sendResponse(
        res,
        400,
        null,
        "Truck is marked as damaged, but no damage image was provided. Please upload an image of the damage."
      );
    }

    // Generate Cloudinary folder path (daily)
    const userName = user.name?.replace(/\s+/g, "_") || `user_${userId}`;
    const todayDate = moment().format("DD-MM-YYYY");
    const cloudinaryFolder = `daily-tasks/${todayDate}/${userName}`;
    console.log("Uploading to folder:", cloudinaryFolder);

    // Function to upload an image with custom name
    const uploadImage = async (file, imageType) => {
      if (!file) return null;
      try {
        const publicId = `${imageType}_${userId}`; // Custom format: id_imageType
        return await uploadOnCloudinary(file.path, cloudinaryFolder, publicId);
      } catch (error) {
        console.error("Cloudinary upload error:", error.message);
        return null;
      }
    };

    // Upload all images in parallel
    const [
      uploadTruckDisplayImage,
      uploadBackTruckImage,
      uploadFrontTruckImage,
      uploadLeftTruckImage,
      uploadRightTruckImage,
      uploadDamageTruckImage,
    ] = await Promise.all([
      uploadImage(truckDisplayImage, "truckDisplayImage"),
      uploadImage(backTruckImage, "backTruckImage"),
      uploadImage(frontTruckImage, "frontTruckImage"),
      uploadImage(leftTruckImage, "leftTruckImage"),
      uploadImage(rightTruckImage, "rightTruckImage"),
      isDamagedTruck ? uploadImage(damageTruckImage, "damageTruckImage") : null,
    ]);

    // Get today's date at 00:00:00 to ignore time differences
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if user already checked in today
    const existingCheckIn = await User.findOne({
      _id: userId,
      "checkInRecords.date": today,
    });

    if (existingCheckIn) {
      return sendResponse(res, 400, null, "You have already checked in today.");
    }

    // Create a new DailyTask entry
    const dailyTask = new DailyTask({
      truckDisplayImage: uploadTruckDisplayImage?.secure_url,
      backTruckImage: uploadBackTruckImage?.secure_url,
      frontTruckImage: uploadFrontTruckImage?.secure_url,
      leftTruckImage: uploadLeftTruckImage?.secure_url,
      rightTruckImage: uploadRightTruckImage?.secure_url,
      damageTruckImage: isDamagedTruck
        ? uploadDamageTruckImage?.secure_url
        : null,
      isDamagedTruck,
      isInspection,
      isLight,
      isTierPressure,
      user: userId,
    });

    await dailyTask.save();

    // Update user with new check-in record
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          checkInRecords: {
            date: today,
            checkInTime: new Date(), // Check-in time recorded here
          },
        },
      },
      { new: true }
    );

    return sendResponse(
      res,
      201,
      dailyTask,
      "Truck check-in completed successfully. The daily inspection details have been recorded."
    );
  } catch (error) {
    console.error("Daily task check-in error:", error);
    return sendResponse(
      res,
      500,
      null,
      "An error occurred while processing the check-in. Please try again later."
    );
  }
};

export const todaysTask = async (req, res) => {
  try {
    const userId = req.userId;
    const { truck_no, trailer_no, date, location, customerName, remark } =
      req.body;

    // Validate required fields
    if (!truck_no || !date || !location || !customerName) {
      return sendResponse(res, 400, null, "Missing required fields.");
    }

    // Validate trailer_no (Must be an array and max 4)
    if (!Array.isArray(trailer_no) || trailer_no.length > 4) {
      return sendResponse(
        res,
        400,
        null,
        "You can store up to 4 trailer numbers only."
      );
    }

    // Create a new TodayTask entry
    const todayTask = new TodayTask({
      truck_no,
      trailer_no,
      date,
      location,
      customerName,
      remark,
      user: userId,
    });

    // Save task to the database
    await todayTask.save();

    // Find the latest DailyTask entry for the user
    const latestDailyTask = await DailyTask.findOne({ user: userId }).sort({
      createdAt: -1,
    });

    if (latestDailyTask) {
      // Update DailyTask with the truck_no
      latestDailyTask.truck_no = truck_no;
      await latestDailyTask.save();
    }

    return sendResponse(
      res,
      201,
      todayTask,
      "Today's task has been successfully recorded."
    );
  } catch (error) {
    console.error("Today's task error:", error);
    return sendResponse(
      res,
      500,
      null,
      "An error occurred while processing today's task. Please try again later."
    );
  }
};

export const weeklyTask = async (req, res) => {
  try {
    const { oil, coolants } = req.body;
    if (!oil || !coolants) {
      return sendResponse(
        res,
        400,
        null,
        "Missing required fields. Please provide the oil and coolants levels."
      );
    }

    const weeklyTask = new WeeklyTask({ oil, coolants });
    await weeklyTask.save();
    return sendResponse(
      res,
      201,
      weeklyTask,
      "Weekly task completed successfully. The oil and coolants levels have been recorded."
    );
  } catch (error) {
    console.error("Weekly task error:", error);
    return sendResponse(
      res,
      500,
      null,
      "An error occurred while processing the weekly task. Please try again later."
    );
  }
};
