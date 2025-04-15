const mongoose = require("mongoose");

const TeacherSchema = new mongoose.Schema(
  {
    teacherId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      require: true,
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    phone: {
      type: String,
      default: "7651853228",
    },
    dateOfBirth: {
      type: Date,
    },
    profileImage: {
      type: String, // URL or filename
    },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      postalCode: { type: String },
      country: { type: String, default: "India" },
    },
    designation: {
      type: String,
      default: "Assistant Professor",
    },
    qualifications: {
      type: String,
    },
    experienceYears: {
      type: Number,
      default: 0,
    },
    domainName: {
      type: String, // e.g., school/college name for multitenancy
    },
    status: {
      type: String,
      enum: ["active", "inactive", "on_leave", "terminated"],
      default: "active",
    },
    subjects: [
      {
        type: String, // or you can reference a Subject model
      },
    ],
    classesAssigned: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class", // assuming a Class model exists
      },
    ],
    salary: {
      total: { type: Number, default: 0 },
      paid: { type: Number, default: 0 },
      lastPaidDate: { type: Date },
    },
    attendance: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Attendance",
      },
    ],
    achievements: [
      {
        title: String,
        description: String,
        date: Date,
      },
    ],
    bio: {
      type: String,
      default: "Hi",
    },
    timetable: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Timetable",
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      default: "teacher",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // track which admin/staff created this teacher
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

module.exports = mongoose.model("Teacher", TeacherSchema);
