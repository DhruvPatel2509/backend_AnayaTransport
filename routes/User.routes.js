import express from "express";
import { createUser } from "../controller/User.controller.js";

const userRouter = express.Router();
userRouter.post("/createUser", createUser);

export default userRouter;
