const Exam = require("../models/Exam");

const hasExamAccess = (role) => role === "Teacher" || role === "Admin";

exports.createExam = async (req, res) => {
  if (!hasExamAccess(req.user.role)) {
    return res.status(403).json({
      error: "Access denied. Only teachers or admins can create exams.",
    });
  }

  try {
    const { title, subject, date, duration, className } = req.body;
    const exam = new Exam({
      title,
      subject,
      date,
      duration,
      class: className,
      createdBy: req.user._id,
    });

    await exam.save();
    res.status(201).json({ message: "Exam created successfully", exam });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

exports.updateExam = async (req, res) => {
  if (!hasExamAccess(req.user.role)) {
    return res.status(403).json({
      error: "Access denied. Only teachers or admins can update exams.",
    });
  }

  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ error: "Exam not found" });

    // Optional: Restrict teacher to only update their own exams
    if (req.user.role === "teacher" && !exam.createdBy.equals(req.user._id)) {
      return res
        .status(403)
        .json({ error: "Teachers can only update their own exams." });
    }

    await exam.save();

    res.status(200).json({ message: "Exam updated successfully", exam });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

exports.getExams = async (req, res) => {
  try {
    let exams;

    if (req.user.role === "Admin") {
      exams = await Exam.find().populate("createdBy", "email role");
    } else if (req.user.role === "Teacher") {
      exams = await Exam.find({ createdBy: req.user._id }).populate(
        "createdBy",
        "email role"
      );
    } else {
      return res.status(403).json({ error: "Access denied" });
    }

    res.status(200).json({ success: true, exams });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};
