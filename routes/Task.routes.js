import express from "express";
import { dailyTaskCheckIn, todaysTask } from "../controller/Task.controller.js";
import { auth } from "../middleware/auth.middleware.js";

import { upload } from "../middleware/multer.js";

const taskRouter = express.Router();

taskRouter.post(
  "/dailyTask",
  auth,
  upload.fields([
    { name: "truckDisplayImage", maxCount: 1 }, // Display view of the truck
    { name: "backTruckImage", maxCount: 1 }, // Back view of the truck
    { name: "frontTruckImage", maxCount: 1 }, // Front view of the truck
    { name: "leftTruckImage", maxCount: 1 }, // Left view of the truck
    { name: "rightTruckImage", maxCount: 1 }, // Right view of the truck
    { name: "damageTruckImage", maxCount: 1 }, // Damage view of the truck
  ]),
  dailyTaskCheckIn
);
taskRouter.post("/todaysTask", auth, todaysTask);
export default taskRouter;
