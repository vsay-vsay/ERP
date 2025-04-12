const User = require("../models/User");
const Timetable = require("../models/Timetable");
const Exam = require("../models/Exam"); // Assume you have this model
const Student=require("../models/Student")

// Function to fetch specific fields from different models
exports.getCommonData = async (req, res) => {
  try {
    const [teachers, students, classes, exams] = await Promise.all([
      User.find({ role: "Teacher" }).select("_id name email"),
      User.find({ role: "Student" }).select("_id name rollNo class section email"),
      Timetable.distinct("class"),
      Exam.find().select("_id title class date")
    ]);

    res.json({
      teachers,
      students,
      classes,
      exams
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to load common data", error: err.message });
  }
};
