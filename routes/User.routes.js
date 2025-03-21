import express from "express";
import {
  
  createUser,
  driverAgreement,
  login,
  updateUserProfile,
} from "../controller/User.controller.js";
import { auth } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.js";

const userRouter = express.Router();
userRouter.post("/createUser", createUser);
userRouter.post("/login", login);
userRouter.post(
  "/driverAggrement",
  upload.single("file"),
  auth,
  driverAgreement
);
userRouter.put("/updateUserProfile", auth, updateUserProfile);

export default userRouter;
