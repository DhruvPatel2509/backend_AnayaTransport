import { User } from "../models/User.model.js";
import sendResponse from "../utils/response.util.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import uploadOnCloudinary from "../utils/cloudinary.js";

export const createUser = async (req, res) => {
  try {
    const { name, mobileNumber, address, password, email } = req.body;
    if (!name || !mobileNumber || !address || !password) {
      return sendResponse(
        res,
        400,
        null,
        "Please provide all required fields."
      );
    }
    //change email use number
    if (email) {
      const trimmedEmail = email.trim().toLowerCase();
    }
    const existingUser = await User.findOne({ mobileNumber });
    if (existingUser) {
      return sendResponse(res, 400, null, "User Already Exists");
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      mobileNumber,

      address,
      password: hashedPassword,
    });

    await user.save();
    return sendResponse(
      res,
      201,
      user,
      `Welcome, ${user.name}! Your account has been successfully created.`
    );
  } catch (error) {
    console.error("Registration error:", error);
    return sendResponse(res, 500, null, "Internal Server Error");
  }
};

export const login = async (req, res) => {
  try {
    const { mobileNumber, password, email } = req.body;
    if (!mobileNumber || !password) {
      return sendResponse(
        res,
        400,
        null,
        "Please provide all required fields."
      );
    }
    if (email) {
      const trimmedEmail = email.trim().toLowerCase();
    }
    const user = await User.findOne({ mobileNumber });
    if (!user) {
      return sendResponse(res, 404, null, "User not found");
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return sendResponse(res, 400, null, "Invalid credentials");
    }

    // Remove password from user object before sending response
    const { password: _, ...userWithoutPassword } = user.toObject();

    // Generate JWT Token
    const tokenData = {
      user: userWithoutPassword, // Excluding password
    };

    const token = jwt.sign(tokenData, process.env.JWT_KEY, { expiresIn: "3d" });

    return sendResponse(
      res,
      200,
      { token, user: userWithoutPassword },
      "Login successful"
    );
  } catch (error) {
    console.error("Login error:", error);
    return sendResponse(res, 500, null, "Internal Server Error");
  }
};

export const driverAggrement = async (req, res) => {
  try {
    const { isAgreed } = req.body;
    const file = req.file;
    const userId = req.userId;
    if (!isAgreed) {
      return sendResponse(res, 400, null, "Please Accept All The Condition");
    }
    if (!file) {
      return sendResponse(res, 400, null, "Please Upload The Signature");
    }
    const user = await User.findById(userId);
    if (!user) {
      return sendResponse(res, 404, null, "User not found");
    }
    if (file) {
      const uploadResult = await uploadOnCloudinary(file.path, "Signature");
      if (uploadResult) {
        user.sign_image = uploadResult.secure_url;
      } else {
        return sendResponse(res, 500, null, "Failed to upload profile photo");
      }

      user.isAgreed = isAgreed;

      await user.save();
      return sendResponse(res, 200, user, "Agreement Accepted Successfully");
    }
  } catch (error) {
    console.error("Agreement error:", error);
    return sendResponse(res, 500, null, "Internal Server Error");
  }
};
