import { User } from "../models/User.model.js";
import sendResponse from "../utils/response.util.js";
import bcrypt from "bcrypt";

export const createUser = async (req, res) => {
  try {
    const { name, mobileNumber, email, address, password } = req.body;
    if (!name || !mobileNumber || !email || !address || !password) {
      return sendResponse(
        res,
        400,
        null,
        "Please provide all required fields."
      );
    }
    const trimmedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) {
      return sendResponse(res, 400, null, "User Already Exists");
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      mobileNumber,
      email: trimmedEmail,
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

export const login = async (req,res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return sendResponse(
        res,
        400,
        null,
        "Please provide all required fields."
      );
    }
    const trimmedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: trimmedEmail });
    if (!user) {
      return sendResponse(res, 404, null, "User not found");
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return sendResponse(res, 400, null, "Invalid credentials");
    }
    return sendResponse(res, 200, user, "Login successful");
  } catch (error) {
    console.error("Login error:", error);
    return sendResponse(res, 500, null, "Internal Server Error");
  }
};
