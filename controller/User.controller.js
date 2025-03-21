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

export const driverAgreement = async (req, res) => {
  try {
    const { file } = req;
    // const { isAgreed } = req.body;
    const isAgreed = true;
    const userId = req.userId;

    if (!isAgreed) {
      return sendResponse(res, 400, null, "Please accept all the conditions.");
    }
    if (!file) {
      return sendResponse(res, 400, null, "Please upload the signature.");
    }

    // Get today's date at 00:00:00 to ignore time differences
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if the user already signed the agreement today
    const existingAgreement = await User.findOne({
      _id: userId,
      isAgreed: true,
    });

    if (existingAgreement) {
      return sendResponse(
        res,
        400,
        null,
        "You have already signed the agreement."
      );
    }

    // Upload signature to Cloudinary
    const uploadResult = await uploadOnCloudinary(file.path, "Signature");
    if (!uploadResult) {
      return sendResponse(res, 500, null, "Failed to upload signature.");
    }

    // Update user with signature and agreement status
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        sign_image: uploadResult.secure_url,
        isAgreed: true, // Ensure agreement is stored
      },
      { new: true }
    );

    if (!updatedUser) {
      return sendResponse(res, 404, null, "User not found.");
    }

    return sendResponse(
      res,
      200,
      updatedUser,
      "Agreement signed successfully."
    );
  } catch (error) {
    console.error("Agreement error:", error);
    return sendResponse(res, 500, null, "Internal Server Error.");
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, mobileNumber, address } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return sendResponse(res, 404, null, "User not found");
    }
    if (name) {
      user.name = name;
    }
    if (mobileNumber) {
      user.mobileNumber = mobileNumber;
    }
    if (address) {
      user.address = address;
    }
    await user.save();
    return sendResponse(res, 200, user, "Profile Updated Successfully");
  } catch (error) {
    console.error("Profile Update error:", error);
    return sendResponse(res, 500, null, "Internal Server Error");
  }
};
