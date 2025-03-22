const express = require("express");
const { 
  getAllStudents, 
  getStudentById, 
  updateStudent, 
  deleteStudent, 
  getStudentMarks, 
  getStudentTimetable 
} = require("../controllers/studentController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get all students
router.get("/all", authMiddleware, getAllStudents);

// Get a student by ID
router.get("/:id", authMiddleware, getStudentById);

// Update student details
router.put("/:id", authMiddleware, updateStudent);

// Delete a student
router.delete("/:id", authMiddleware, deleteStudent);

// Get student marks
router.get("/:id/marks", authMiddleware, getStudentMarks);

// Get student timetable
router.get("/:id/timetable", authMiddleware, getStudentTimetable);

module.exports = router;
