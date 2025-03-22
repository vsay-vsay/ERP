const express = require("express");
const {
  getTeacherDashboard,
  getStudentDashboard,
  getAccountantDashboard,
  getAdminDashboard,
} = require("../controllers/dashboardController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Teacher Dashboard
router.get("/teacher", authMiddleware, getTeacherDashboard);

// Student Dashboard
router.get("/student", authMiddleware, getStudentDashboard);

// Accountant Dashboard
router.get("/accountant", authMiddleware, getAccountantDashboard);

// Admin Dashboard
router.get("/admin", authMiddleware, getAdminDashboard);

module.exports = router;
