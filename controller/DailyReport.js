import { User } from "../models/User.model.js";
import { TodayTask } from "../models/TodayTask.model.js";
import {
  DailyTaskCheckIn,
  DailyTaskCheckOut,
} from "../models/DailyTask.model.js";

export const getDailyReport = async (req, res) => {
  try {
    const { date, userId } = req.body;
    if (!date || !userId) {
      return res
        .status(400)
        .json({ success: false, message: "Provide date & userId" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    // Convert input date to start of the day for matching
    const inputDate = new Date(date);
    inputDate.setHours(0, 0, 0, 0);

    // Find check-in record for the date
    const checkInRecord = user.checkInRecords.find((record) => {
      const recordDate = new Date(record.date);
      recordDate.setHours(0, 0, 0, 0);
      return recordDate.getTime() === inputDate.getTime();
    });

    if (!checkInRecord) {
      return res.status(404).json({
        success: false,
        message: "No check-in record found for the given date.",
      });
    }

    // Extract check-in and check-out times
    const checkInTime = checkInRecord.checkInTime
      ? new Date(checkInRecord.checkInTime)
      : null;
    const checkOutTime = checkInRecord.checkOutTime
      ? new Date(checkInRecord.checkOutTime)
      : null;

    let totalHoursWorked = "Not Available";
    if (checkInTime && checkOutTime) {
      const diffMs = checkOutTime - checkInTime;
      const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
      const totalMinutes = Math.floor(
        (diffMs % (1000 * 60 * 60)) / (1000 * 60)
      );
      totalHoursWorked = `${totalHours}h ${totalMinutes}m`;
    }

    // Fetch Daily Task Check-In details
    const dailyTaskCheckIn = await DailyTaskCheckIn.findOne({
      user: userId,
      createdAt: {
        $gte: inputDate,
        $lt: new Date(inputDate.getTime() + 86400000),
      },
    });

    let taskCheckInDetails = null;
    if (dailyTaskCheckIn) {
      taskCheckInDetails = {
        truckDisplayImage: dailyTaskCheckIn.truckDisplayImage,
        tierPressure: dailyTaskCheckIn.isTierPressure
          ? "Checked"
          : "Not Checked",
        light: dailyTaskCheckIn.isLight ? "Checked" : "Not Checked",
        fullTruckInspection: dailyTaskCheckIn.isInspection
          ? "Completed"
          : "Pending",
        frontTruckImage: dailyTaskCheckIn.frontTruckImage,
        backTruckImage: dailyTaskCheckIn.backTruckImage,
        leftTruckImage: dailyTaskCheckIn.leftTruckImage,
        rightTruckImage: dailyTaskCheckIn.rightTruckImage,
      };
    }

    // Fetch Daily Task Check-Out details
    const dailyTaskCheckOut = await DailyTaskCheckOut.findOne({
      user: userId,
      createdAt: {
        $gte: inputDate,
        $lt: new Date(inputDate.getTime() + 86400000),
      },
    });

    let taskCheckOutDetails = null;
    if (dailyTaskCheckOut) {
      taskCheckOutDetails = {
        truckDisplayImage: dailyTaskCheckOut.truckDisplayImage,
        isDamagedTruck: dailyTaskCheckOut.isDamagedTruck,
        damageTruckImage:
          dailyTaskCheckOut.damageTruckImage || "No Damage Reported",
      };
    }

    // Fetch Today Task details
    const todayTask = await TodayTask.findOne({
      user: userId,
      date: { $gte: inputDate, $lt: new Date(inputDate.getTime() + 86400000) },
    });

    let todayTaskDetails = null;
    if (todayTask) {
      todayTaskDetails = {
        truckNo: todayTask.truck_no,
        trailerNo: todayTask.trailer_no,
        date: todayTask.date.toISOString().split("T")[0], // Format date as YYYY-MM-DD
        location: todayTask.location,
        customerName: todayTask.customerName,
        hourly: todayTask.salary_type ? "Yes" : "No",
        salaryRemark: todayTask.salaryRemark || "N/A",
        remark: todayTask.remark || "N/A",
      };
    }

    return res.status(200).json({
      success: true,
      date,
      checkInTime: checkInTime
        ? checkInTime.toLocaleTimeString()
        : "Not Checked In",
      checkOutTime: checkOutTime
        ? checkOutTime.toLocaleTimeString()
        : "Not Checked Out",
      totalHoursWorked,
      taskCheckInDetails:
        taskCheckInDetails || "No daily task check-in data found.",
      taskCheckOutDetails:
        taskCheckOutDetails || "No daily task check-out data found.",
      todayTaskDetails: todayTaskDetails || "No today task data found.",
    });
  } catch (error) {
    console.error("Error fetching daily report:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};
