const User = require("../models/User");
const Teacher = require("../models/Teacher");
const Student = require("../models/Student");
const Attendance = require("../models/Attendance");
const Exam = require("../models/Exam");
const Timetable = require("../models/Timetable");
const Transaction = require("../models/Transaction");

// 🎯 Teacher Dashboard
exports.getTeacherDashboard = async (req, res) => {
    try {
      console.log("User from token:", req.user); // Debugging line
  
      const teacher = await Teacher.findOne({ email: req.user.email });
      if (!teacher) return res.status(404).json({ error: "Teacher not found" });
  
      const students = await Student.find({ className: { $in: teacher.classesAssigned } });
      const timetable = await Timetable.find({ teacher: teacher._id });
      const exams = await Exam.find({ className: { $in: teacher.classesAssigned } });
  
      res.json({
        teacher,
        totalStudents: students.length,
        timetable,
        exams,
      });
    } catch (error) {
      console.error("Error in Teacher Dashboard:", error);
      res.status(500).json({ error: "Server Error" });
    }
  };
  

// 🎯 Student Dashboard
exports.getStudentDashboard = async (req, res) => {
    try {
      console.log("User from token:", req.user); // Debugging line
  
      const student = await Student.findOne({ email: req.user.email });
      if (!student) return res.status(404).json({ error: "Student not found" });
  
      const attendance = await Attendance.find({ student: student._id });
      const exams = await Exam.find({ className: student.className });
      const timetable = await Timetable.find({ className: student.className });
  
      res.json({
        student,
        attendance,
        exams,
        timetable,
      });
    } catch (error) {
      console.error("Error in Student Dashboard:", error);
      res.status(500).json({ error: "Server Error" });
    }
  };
  

// 🎯 Accountant Dashboard
exports.getAccountantDashboard = async (req, res) => {
    try {
      console.log("User from token:", req.user); // Debugging line
  
      const accountant = await User.findOne({ email: req.user.email, role: "Accountant" });
      if (!accountant) return res.status(404).json({ error: "Accountant not found" });
  
      const transactions = await Transaction.find();
      const totalRevenue = transactions.reduce((sum, txn) => sum + txn.amount, 0);
  
      res.json({
        accountant,
        totalTransactions: transactions.length,
        totalRevenue,
        transactions,
      });
    } catch (error) {
      console.error("Error in Accountant Dashboard:", error);
      res.status(500).json({ error: "Server Error" });
    }
  };
  
// 🎯 Admin Dashboard
exports.getAdminDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTeachers = await Teacher.countDocuments();
    const totalStudents = await Student.countDocuments();
    const totalTransactions = await Transaction.countDocuments();
    const totalRevenue = (await Transaction.find()).reduce((sum, txn) => sum + txn.amount, 0);

    res.json({
      totalUsers,
      totalTeachers,
      totalStudents,
      totalTransactions,
      totalRevenue,
    });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};
