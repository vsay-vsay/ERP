const mongoose = require("mongoose");

const ExamSchema = new mongoose.Schema({
  className: { type: String, required: true },
  examName: { type: String, required: true },
  examDate: { type: Date, required: true },
});

module.exports = mongoose.model("Exam", ExamSchema);
