const express = require("express");
const { 
  getAllTeachers, 
  getTeacherById, 
  addStudentToClass, 
  markAttendance, 
  scheduleExam, 
  assignMarks, 
  getTimetable, 
  addStudentTimetable 
} = require("../controllers/teacherController");
const upload = require("../middleware/uploadMiddleware");


const authMiddleware = require("../middleware/authMiddleware");
const { bulkAddStudentsFromExcel } = require("../controllers/excelUploadController");

const router = express.Router();

// Get all teachers
router.get("/all", authMiddleware, getAllTeachers);

router.post('/add-students', upload.single('file'), bulkAddStudentsFromExcel);

// Get a specific teacher by ID
router.get("/:id", authMiddleware, getTeacherById);

// Add a student to a class
router.post("/add-student", authMiddleware, addStudentToClass);

// Mark student attendance
router.post("/mark-attendance", authMiddleware, markAttendance);

// Schedule an exam
router.post("/schedule-exam", authMiddleware, scheduleExam);

// Assign marks to a student
router.post("/assign-marks", authMiddleware, assignMarks);

// Get teacher timetable
router.get("/get-timetable/:email", authMiddleware, getTimetable);

// Add timetable for a student
router.post("/add-student-timetable", authMiddleware, addStudentTimetable);

module.exports = router;
