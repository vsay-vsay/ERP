const Teacher = require("../models/Teacher");
const Student = require("../models/Student");
const Attendance = require("../models/Attendance");
const Exam = require("../models/Exam");
const Timetable = require("../models/Timetable");
const User = require("../models/User");


exports.addTeacher = async (req, res) => {
  try {
    const { name, email, password, gender, subject, classesAssigned, salary, timetable } = req.body;

    if (!name || !email || !password || !subject) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const domainName = req.user.domainName || "default";

    let user = await User.findOne({ email });

    if (user) {
      // Check if user is already a teacher
      const existingTeacher = await Teacher.findOne({ email });
      if (existingTeacher) {
        return res.status(400).json({ error: "Teacher already exists" });
      }

      // If user exists but no teacher profile, reuse user
      if (user.role !== "Teacher") {
        user.role = "Teacher"; // Optionally update role
        await user.save();
      }

    } else {
      // Create a new user if not found
      const hashedPassword = await bcrypt.hash(password, 10);

      user = new User({
        name,
        email,
        password: hashedPassword,
        role: "Teacher",
        domainName,
      });
      await user.save();
    }

    // Create teacher profile
    const teacher = new Teacher({
      teacherId: user.id,
      name,
      email,
      gender,
      subject,
      classesAssigned,
      salary,
      timetable,
      domainName
    });
    await teacher.save();

    res.status(201).json({
      message: "Teacher added successfully",
      teacher,
    });

  } catch (error) {
    console.error("Add Teacher Error:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

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
    const { name, email, className, rollNo } = req.body;
    let existingStudent = await Student.findOne({ rollNo });
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
