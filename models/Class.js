const mongoose = require("mongoose");

const ClassSchema = new mongoose.Schema({
  name: { type: String, required: true },
  section: { type: String, required: true },
  description: { type: String },
  academicYear: {
    type: String,
    required: true,
    match: /^\d{4}-\d{4}$/, // e.g., "2024-2025"
  },
  classTeacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
  },
  room: {
    number: { type: String }, // e.g., "204A"
    building: { type: String }, // optional
    floor: { type: String }, // optional
  },
  capacity: {
    type: Number,
    default: 40,
  },
  timings: {
    startTime: { type: String }, // e.g., "08:00"
    endTime: { type: String }, // e.g., "14:00"
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
  room: {},
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }], // ✅ Store student IDs
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Class", ClassSchema);
