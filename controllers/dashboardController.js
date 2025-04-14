const User = require("../models/User");
const Teacher = require("../models/Teacher");
const Student = require("../models/Student");
const Attendance = require("../models/Attendance");
const Exam = require("../models/Exam");
const Timetable = require("../models/Timetable");
const Transaction = require("../models/Transaction");
const Class = require("../models/Class");

// 🎯 Teacher Dashboard
exports.getTeacherDashboard = async (req, res) => {
  try {
    console.log("User from token:", req.user); // Debugging line

    const teacher = await Teacher.findOne({ teacherId: req.user.id });
    if (!teacher) return res.status(404).json({ error: "Teacher not found" });

    const students = await Student.find({
      class: { $in: teacher.classesAssigned },
    });
    const timetable = await Timetable.find({ teacher: teacher._id });
    const exams = await Exam.find({ class: { $in: teacher.classesAssigned } });
    const assignedClass= await Class.findOne({classTeacher:teacher._id})

    res.json({
      totalStudents: students.length,
      timetable,
      exams,
      assignedClass
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
    const exams = await Exam.find({ class: student.classId });
    const timetable = await Timetable.find({ class: student.className });

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

    const accountant = await User.findOne({
      email: req.user.email,
      role: "Accountant",
    });
    if (!accountant)
      return res.status(404).json({ error: "Accountant not found" });

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
    const [
      totalUsers,
      totalTeachers,
      totalStudents,
      totalTransactions,
      totalClass,
      transactions,
      activeStudents,
      inactiveStudents,
      activeTeachers,
      inactiveTeachers,
      recentTransactions,
      students,
      classes,
    ] = await Promise.all([
      User.countDocuments(),
      Teacher.countDocuments(),
      Student.countDocuments(),
      Transaction.countDocuments(),
      Class.countDocuments(),
      Transaction.find(),
      Student.countDocuments({ isActive: true }),
      Student.countDocuments({ isActive: false }),
      Teacher.countDocuments({ isActive: true }),
      Teacher.countDocuments({ isActive: false }),
      Transaction.find().sort({ createdAt: -1 }).limit(5),
      Student.find({}, 'email name gender classId totalPaid'),
      Class.find({}, 'name'),
    ]);

    const totalRevenue = transactions.reduce((sum, txn) => sum + txn.amount, 0);

    // ✅ Monthly Revenue Analytics - Last 6 months
    const monthlyRevenue = {};
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    for (let i = 0; i < 6; i++) {
      const month = new Date(sixMonthsAgo.getFullYear(), sixMonthsAgo.getMonth() + i, 1);
      const monthKey = month.toLocaleString('default', { month: 'short', year: 'numeric' });

      const monthSum = transactions
        .filter(txn => new Date(txn.createdAt).getMonth() === month.getMonth())
        .reduce((sum, txn) => sum + txn.amount, 0);

      monthlyRevenue[monthKey] = monthSum;
    }

    // ✅ Top 5 Students by Payment (Assumes you track totalPaid or similar)
    const topPayingStudents = students
      .filter(s => s.totalPaid)
      .sort((a, b) => b.totalPaid - a.totalPaid)
      .slice(0, 5);

    // ✅ Class-wise Student Count
    const studentsPerClass = classes.map(cls => {
      const count = students.filter(s => s.classId?.toString() === cls._id.toString()).length;
      return { className: cls.name, count };
    });

    // ✅ Gender Ratio
    const genderStats = {
      Male: students.filter(s => s.gender === "Male").length,
      Female: students.filter(s => s.gender === "Female").length,
      // Other: students.filter(s => s.gender === "Other").length,
    };

    res.json({
      totals: {
        totalUsers,
        totalTeachers,
        totalStudents,
        totalTransactions,
        totalRevenue,
        totalClass,
        activeStudents,
        inactiveStudents,
        activeTeachers,
        inactiveTeachers,
      },
      recentTransactions,
      monthlyRevenue,
      topPayingStudents,
      studentsPerClass,
      genderStats,
    });

  } catch (error) {
    console.error("Dashboard Error 💥", error);
    res.status(500).json({ error: "Server Error" });
  }
};

