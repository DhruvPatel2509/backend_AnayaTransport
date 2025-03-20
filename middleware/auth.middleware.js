import jwt from "jsonwebtoken";
import sendResponse from "../utils/response.util.js";

export const auth = async (req, res, next) => {
  try {
    console.log("Auth Middleware");
    
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    console.log(token);

    if (!token) {
      return sendResponse(res, 401, "", "User not Authenticated");
    }

    const decoded = jwt.verify(token, process.env.JWT_KEY);
    if (!decoded) {
      return sendResponse(res, 401, "", "Invalid Token");
    }

    req.userId = decoded.userId;

    next();
  } catch (error) {
    console.error("Authentication Error:", error);
    return sendResponse(res, 500, "", "Internal Server Error"); // Send a generic error response
  }
};
