const Student = require("../models/Student");
const Timetable = require("../models/Timetable");

// Get all students
exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

// Get a single student by ID
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: "Student not found" });
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

// Update student details
exports.updateStudent = async (req, res) => {
  try {
    const { name, email, className } = req.body;
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { name, email, className },
      { new: true }
    );
    if (!student) return res.status(404).json({ error: "Student not found" });

    res.json({ message: "Student updated successfully", student });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

// Delete student
exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ error: "Student not found" });

    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

// Get student marks
exports.getStudentMarks = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: "Student not found" });

    res.json({ marks: student.marks });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

// Get student timetable
exports.getStudentTimetable = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: "Student not found" });

    const timetable = await Timetable.find({ className: student.className });
    if (!timetable.length) return res.status(404).json({ error: "Timetable not found" });

    res.json(timetable);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};
