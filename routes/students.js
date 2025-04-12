const express = require("express");
const {
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  getStudentMarks,
  getStudentTimetable,
  createStudent,
} = require("../controllers/studentController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/add", authMiddleware, authorizeRoles("Admin"), createStudent);

// Get all students
router.get("/all", authMiddleware, getAllStudents);

// Get a student by ID
router.get("/:id", authMiddleware, getStudentById);

// Update student details
router.put(
  "/:id",
  authorizeRoles("Admin", "Teacher"),
  authMiddleware,
  updateStudent
);

// Delete a student
router.delete("/:id", authorizeRoles("Admin"), authMiddleware, deleteStudent);

// Get student marks
router.get("/:id/marks", authMiddleware, getStudentMarks);

// Get student timetable
router.get("/:id/timetable", authMiddleware, getStudentTimetable);

module.exports = router;
