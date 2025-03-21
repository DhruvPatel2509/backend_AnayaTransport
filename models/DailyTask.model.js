import mongoose from "mongoose";

const dailyTaskCheckInSchema = new mongoose.Schema(
  {
    backTruckImage: { type: String, required: true },
    frontTruckImage: { type: String, required: true },
    leftTruckImage: { type: String, required: true },
    rightTruckImage: { type: String, required: true },
    damageTruckImage: { type: String },
    isDamagedTruck: { type: Boolean, default: false, required: true },
    isInspection: { type: Boolean, default: false },
    isLight: { type: Boolean, default: false },
    isTierPressure: { type: Boolean, default: false },
    truckDisplayImage: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    truck_no: { type: String },
  },
  { timestamps: true }
);

export const DailyTaskCheckIn = mongoose.model(
  "DailyTaskCheckIn",
  dailyTaskCheckInSchema
);

const dailyTaskCheckOutSchema = new mongoose.Schema({
  truckDisplayImage: { type: String, required: true },
  isDamagedTruck: { type: Boolean, default: false, required: true },
  damageTruckImage: { type: String },
  remark: { type: String },
  truck_no: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});
export const DailyTaskCheckOut = mongoose.model(
  "DailyTaskCheckOut",
  dailyTaskCheckOutSchema
);
