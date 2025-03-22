const Teacher = require("../models/Teacher");
const Student = require("../models/Student");
const Attendance = require("../models/Attendance");
const Exam = require("../models/Exam");
const Timetable = require("../models/Timetable");

// Get all teachers
exports.getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find().select("-password");
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

// Get a single teacher by ID
exports.getTeacherById = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) return res.status(404).json({ error: "Teacher not found" });
    res.json(teacher);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

// Add a student to a class
exports.addStudentToClass = async (req, res) => {
  try {
    const { name, email, className } = req.body;
    let existingStudent = await Student.findOne({ email });
    if (existingStudent) return res.status(400).json({ error: "Student already exists" });

    const student = new Student({ name, email, className });
    await student.save();
    res.json({ message: "Student added to class successfully", student });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

// Mark student attendance
exports.markAttendance = async (req, res) => {
  try {
    const { studentEmail, date, status } = req.body;
    const student = await Student.findOne({ email: studentEmail });
    if (!student) return res.status(404).json({ error: "Student not found" });

    const attendance = new Attendance({ student: student._id, date, status });
    await attendance.save();

    res.json({ message: "Attendance marked successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

// Schedule an exam
exports.scheduleExam = async (req, res) => {
  try {
    const { className, examName, examDate } = req.body;
    const exam = new Exam({ className, examName, examDate });
    await exam.save();
    res.json({ message: "Exam scheduled successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

// Assign marks to a student
exports.assignMarks = async (req, res) => {
  try {
    const { studentEmail, examName, marks } = req.body;
    const student = await Student.findOne({ email: studentEmail });
    if (!student) return res.status(404).json({ error: "Student not found" });

    student.marks.set(examName, marks);
    await student.save();

    res.json({ message: "Marks assigned successfully", student });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

// Get teacher timetable
exports.getTimetable = async (req, res) => {
  try {
    const { id } = req.params;
    const timetable = await Timetable.find({ teacher: id });
    if (!timetable.length) return res.status(404).json({ error: "Timetable not found" });

    res.json(timetable);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

// Add timetable for a student
exports.addStudentTimetable = async (req, res) => {
  try {
    const { teacherId, className, day, periods } = req.body;
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) return res.status(404).json({ error: "Teacher not found" });

    const timetable = new Timetable({ teacher: teacher._id, className, day, periods });
    await timetable.save();

    res.json({ message: "Timetable added successfully", timetable });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};
