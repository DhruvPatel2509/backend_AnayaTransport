import mongoose from "mongoose";

const dailyTaskSchema = new mongoose.Schema(
  {
    backTruckImage: { type: String, required: true },
    frontTruckImage: { type: String, required: true },
    damageTruckImage: { type: String },
    isDamagedTruck: { type: Boolean, default: false },
    isInspection: { type: Boolean, default: false },
    isLight: { type: Boolean, default: false },
    isTierPancture: { type: Boolean, default: false },
    trackDisplayDocument: { type: String },
  },
  { timestamps: true }
);

const DailyTask = mongoose.model("DailyTask", dailyTaskSchema);
