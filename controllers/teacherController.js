const Teacher = require("../models/Teacher");
const Student = require("../models/Student");
const Attendance = require("../models/Attendance");
const Exam = require("../models/Exam");
const Timetable = require("../models/Timetable");
const User = require("../models/User");
const Class = require("../models/Class");

exports.addTeacher = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      gender,
      subject,
      classesAssigned,
      salary,
      timetable,
    } = req.body;

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
      domainName,
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
    const { email, classId } = req.body;

    const student = await Student.findOne({ email });

    if (!student) {
      return res
        .status(400)
        .json({ success: false, msg: "No student exists with that email." });
    }

    const updatedClass = await Class.findByIdAndUpdate(
      classId,
      { $addToSet: { students: student._id } }, // $addToSet avoids duplicates
      { new: true }
    );

    if (!updatedClass) {
      return res.status(404).json({ success: false, msg: "Class not found" });
    }

    res.json({
      success: true,
      message: "Student added to class successfully",
      student,
      class: updatedClass,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Mark student attendance
// exports.markAttendance = async (req, res) => {
//   try {
//     const { studentEmail, date, status } = req.body;
//     console.log(req.body);

//     const student = await Student.findOne({ email: studentEmail });
//     if (!student) return res.status(404).json({ error: "Student not found" });

//     const attendance = new Attendance({ student: student._id, date, status });
//     console.log("asdasd");
//     await attendance.save();

//     res.json({ message: "Attendance marked successfully" });
//   } catch (error) {
//     res.status(500).json({ error: "Server Error" });
//   }
// };

exports.markAttendance = async (req, res) => {
  try {
    const { studentEmail, date, status, batchRecords } = req.body;

    // Handle batch operations
    if (batchRecords && Array.isArray(batchRecords)) {
      const results = [];

      for (const record of batchRecords) {
        try {
          const student = await Student.findOne({ email: record.studentEmail });
          if (!student) {
            results.push({
              error: `Student not found: ${record.studentEmail}`,
            });
            continue;
          }

          const attendance = new Attendance({
            student: student._id,
            date: record.date,
            status: record.status,
          });

          await attendance.save();
          results.push({ success: true, student: student.email });
        } catch (error) {
          results.push({
            error: `Failed for ${record.studentEmail}: ${error.message}`,
          });
        }
      }

      return res.json({
        message: "Batch attendance processed",
        results,
      });
    }

    // Handle single record (original functionality)
    const student = await Student.findOne({ email: studentEmail });
    if (!student) return res.status(404).json({ error: "Student not found" });

    const attendance = new Attendance({
      student: student._id,
      date,
      status,
    });

    await attendance.save();
    res.json({ message: "Attendance marked successfully" });
  } catch (error) {
    console.error("Attendance error:", error);
    res.status(500).json({
      error: "Server Error",
      details: error.message,
    });
  }
};

// Get attendance for a class
// exports.getClassAttendance = async (req, res) => {
//   try {
//     const { classId } = req.params;

//     console.log(classId);

//     // Get attendance records with student details
//     const attendance = await Attendance.find({ class: classId })
//       .populate("student", "name email")
//       .sort({ date: -1 });

//     res.json({
//       success: true,
//       data: attendance,
//     });
//   } catch (error) {
//     console.error("Error fetching attendance:", error);
//     res.status(500).json({ error: "Server error" });
//   }
// };

exports.getClassAttendance = async (req, res) => {
  try {
    const { studentIds } = req.query;

    const filter = {};

    // If filtered student IDs are provided, filter by them
    if (studentIds) {
      const idsArray = Array.isArray(studentIds)
        ? studentIds
        : studentIds.split(","); // in case they come as comma-separated string

      filter.student = { $in: idsArray };
    }

    const attendance = await Attendance.find(filter)
      .populate("student", "name email")
      .sort({ date: -1 });

    res.json({
      success: true,
      data: attendance,
    });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Schedule an exam
exports.scheduleExam = async (req, res) => {
  try {
    const { classId, title, date, subject, totalMarks, duration, time } = req.body;

    const examdata = new Exam({ title, class: classId, date, subject, totalMarks, duration, time, createdBy:req.user.id });
    await examdata.save();
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
    if (!timetable.length)
      return res.status(404).json({ error: "Timetable not found" });

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

    const timetable = new Timetable({
      teacher: teacher._id,
      className,
      day,
      periods,
    });
    await timetable.save();

    res.json({ message: "Timetable added successfully", timetable });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};
