import jwt from "jsonwebtoken";
import sendResponse from "../utils/response.util.js";

export const auth = async (req, res, next) => {
  try {
    
    
    const token = req.headers.authorization;

    if (!token) {
      return sendResponse(res, 401, "", "User not Authenticated");
    }

    const decoded = jwt.verify(token, process.env.JWT_KEY);
    console.log(decoded.user._id);
    
    if (!decoded) {
      return sendResponse(res, 401, "", "Invalid Token");
    }

    req.userId = decoded.user._id;

    next();
  } catch (error) {
    console.error("Authentication Error:", error);
    return sendResponse(res, 500, "", "Internal Server Error"); // Send a generic error response
  }
};
