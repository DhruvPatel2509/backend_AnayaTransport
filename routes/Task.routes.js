import express from "express";
import {
  dailyTaskCheckInFun,
  dailyTaskCheckOutFun,
  todaysTask,
} from "../controller/Task.controller.js";
import { auth } from "../middleware/auth.middleware.js";

import { upload } from "../middleware/multer.js";
import { getDailyReport } from "../controller/DailyReport.js";

const taskRouter = express.Router();

taskRouter.post(
  "/dailyTaskCheckIn",
  auth,
  upload.fields([
    { name: "truckDisplayImage", maxCount: 1 }, // Display view of the truck
    { name: "backTruckImage", maxCount: 1 }, // Back view of the truck
    { name: "frontTruckImage", maxCount: 1 }, // Front view of the truck
    { name: "leftTruckImage", maxCount: 1 }, // Left view of the truck
    { name: "rightTruckImage", maxCount: 1 }, // Right view of the truck
    { name: "damageTruckImage", maxCount: 1 }, // Damage view of the truck
  ]),
  dailyTaskCheckInFun
);

taskRouter.post(
  "/dailyTaskCheckOut",
  auth,
  upload.fields([
    { name: "truckDisplayImage", maxCount: 1 },
    { name: "damageTruckImage", maxCount: 1 },
  ]),
  dailyTaskCheckOutFun
);
taskRouter.post("/todaysTask", auth, todaysTask);

taskRouter.get("/dailyReport",auth, getDailyReport);

export default taskRouter;
