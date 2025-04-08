const mongoose = require("mongoose");

const TeacherSchema = new mongoose.Schema({
  teacherId: {
    type: String,
  },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  gender: { type: String },
  subject: { type: String },
  domainName: { type: String },
  classesAssigned: [{ type: String }], // Array of class names assigned
  salary: {
    total: { type: Number, default: 0 },
    paid: { type: Number, default: 0 },
  },
  timetable: [{ type: mongoose.Schema.Types.ObjectId, ref: "Timetable" }],
});

module.exports = mongoose.model("Teacher", TeacherSchema);
