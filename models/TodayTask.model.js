import mongoose from "mongoose";

const todayTaskSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    remark: { type: String },
    salaryRemark: { type: String },
    salary_type: { type: Boolean, required: true, default: false },
    trailer_no: { type: String, required: true },
    truck_no: { type: String, required: true },
  },
  { timestamps: true }
);

const TodayTask = mongoose.model("TodayTask", todayTaskSchema);
