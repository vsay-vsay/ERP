const Student = require("../models/Student");
const Timetable = require("../models/Timetable");
const User = require("../models/User");
exports.createStudent = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      gender,
      dateOfBirth,
      classId,
      contact,
      address,
      guardian,
      timetable,
      marks,
      teacher // Optional if linking teacher info at student level
    } = req.body;

    if (!name || !email || !password || !classId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const domainName = req.user?.domainName || "default";

    let user = await User.findOne({ email });

    if (user) {
      const existingStudent = await Student.findOne({ email });
      if (existingStudent) {
        return res.status(400).json({ error: "Student already exists" });
      }

      // Optionally update the role
      if (user.role !== "Student") {
        user.role = "Student";
        await user.save();
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);

      user = new User({
        name,
        email,
        password: hashedPassword,
        role: "Student",
        domainName,
      });

      await user.save();
    }

    const student = new Student({
      userId: user._id,
      name,
      email,
      gender,
      dateOfBirth,
      classId,
      contact,
      address,
      guardian,
      timetable,
      teacher,
      marks
    });

    await student.save(); // rollNo will be auto-generated here

    res.status(201).json({
      message: "Student enrolled successfully",
      student,
    });

  } catch (error) {
    console.error("Create Student Error:", error);
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
};
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
    if (!timetable.length)
      return res.status(404).json({ error: "Timetable not found" });

    res.json(timetable);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};
