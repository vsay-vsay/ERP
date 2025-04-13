const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendanceController");
const authorizeRoles = require("../middleware/roleMiddleware");
const authenticateUser = require("../middleware/authMiddleware");

// Authenticated routes
router.post(
  "/mark",
  authenticateUser,
  authorizeRoles("Admin", "Teacher"),
  attendanceController.markAttendance
);
router.get(
  "/me",
  authenticateUser,
  authorizeRoles("Student", "Teacher"),
  attendanceController.getOwnAttendance
);
router.get(
  "/all",
  authenticateUser,
  authorizeRoles("Admin"),
  attendanceController.getAllAttendance
);
router.put(
  "/:id",
  authenticateUser,
  authorizeRoles("Admin"),
  attendanceController.updateAttendance
);
router.delete(
  "/:id",
  authenticateUser,
  authorizeRoles("Admin"),
  attendanceController.deleteAttendance
);

module.exports = router;
