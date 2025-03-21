import mongoose from "mongoose";

const weeklyTaskSchema = new mongoose.Schema(
  {
    oil: { type: String, required: true },
    coolants: { type: String, required: true },
  },
  { timestamps: true }
);

export const WeeklyTask = mongoose.model("WeeklyTask", weeklyTaskSchema);
