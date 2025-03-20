import { User } from "../models/User.model.js";
import sendResponse from "../utils/response.util.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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
    const tokenData = {
      userId: user._id,
      mobileNumber: user.mobileNumber,
      isAdmin: user.isAdmin,
    };
    const token = jwt.sign(tokenData, process.env.JWT_KEY, { expiresIn: "3d" });
    const userResponse = {
      token: token,
    };
    return sendResponse(res, 200, userResponse, "Login successful");
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
    // if (!file) {
    //   return sendResponse(res, 400, null, "Please Upload The Signature");
    // }

    const user = await User.findById(userId);
    if (!user) {
      return sendResponse(res, 404, null, "User not found");
    }

    if (isAgreed) {
      user.isAgreed = true;
    }
    await user.save();
    return sendResponse(res, 200, user, "Agreement Accepted Successfully");
  } catch (error) {
    console.error("Agreement error:", error);
    return sendResponse(res, 500, null, "Internal Server Error");
  }
};
