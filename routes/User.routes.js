import express from "express";
import {
  driverAggrement,
  createUser,
  login,
} from "../controller/User.controller.js";
import {auth} from "../middleware/auth.middleware.js"

const userRouter = express.Router();
userRouter.post("/createUser", createUser);
userRouter.post("/login", login);
userRouter.post("/driverAggrement",auth, driverAggrement);

export default userRouter;
