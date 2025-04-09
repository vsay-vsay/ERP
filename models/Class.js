const mongoose = require("mongoose");

const ClassSchema = new mongoose.Schema({
  name: { type: String, required: true },
  section: { type: String, required: true },
  description: { type: String },
  classTeacher: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" }, // ✅ Store teacher ID
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }], // ✅ Store student IDs
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Class", ClassSchema);
