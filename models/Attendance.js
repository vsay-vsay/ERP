// // const mongoose = require("mongoose");

// // const AttendanceSchema = new mongoose.Schema({
// //   user: {
// //     type: mongoose.Schema.Types.ObjectId,
// //     required: true,
// //     refPath: "User", // Dynamic reference
// //   },
// //   userModel: {
// //     type: String,
// //     required: true,
// //     enum: ["Student", "Teacher"], // Allowed models
// //   },
// //   date: {
// //     type: Date,
// //     required: true,
// //   },
// //   status: {
// //     type: String,
// //     enum: ["Present", "Absent"],
// //     required: true,
// //   },
// // });

// // module.exports = mongoose.model("Attendance", AttendanceSchema);

// const mongoose = require("mongoose");

// const AttendanceSchema = new mongoose.Schema(
//   {
//     student: {
//       // Changed from 'user' to 'student' to match your implementation
//       type: mongoose.Schema.Types.ObjectId,
//       required: true,
//       ref: "Student", // Direct reference to Student model
//     },
//     date: {
//       type: Date,
//       required: true,
//     },
//     status: {
//       type: String,
//       enum: ["Present", "Absent"],
//       required: true,
//     },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Attendance", AttendanceSchema);



const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["present", "absent", "leave"],
      default: "present",
    },
    type: {
      type: String,
      enum: ["Student", "Teacher"],
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
    },
    subject: {
      type: String,
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // whoever marked it - admin/teacher
    },
    remarks: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Attendance", AttendanceSchema);

