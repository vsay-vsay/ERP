const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "User", // Dynamic reference
  },
  userModel: {
    type: String,
    required: true,
    enum: ["Student", "Teacher"], // Allowed models
  },
  date: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["Present", "Absent"],
    required: true,
  },
});

module.exports = mongoose.model("Attendance", AttendanceSchema);
