const mongoose = require("mongoose");
const Class = require("./Class");

const StudentSchema = new mongoose.Schema(
  {
    rollNo: {
      type: String,
      unique: true,
      index: true,
    },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    domainName: { type: String },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    dateOfBirth: {
      type: Date,
    },
    contact: {
      phone: String,
    },
    address: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },
    guardian: {
      name: String,
      relation: String,
      phone: String,
    },
    admissionDate: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
    },
    timetable: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Timetable",
    },
    marks: {
      type: Object,
      default: {},
    },
    status:{
      type:String,
      enum:["active", "inactive"],
      default:"active"
    }
  },
  { timestamps: true }
);

// ✅ Fixed auto-generate rollNo before saving
StudentSchema.pre("save", async function (next) {
  if (this.rollNo || !this.classId) return next();

  try {
    const classDoc = await Class.findById(this.classId);
    if (!classDoc) return next(new Error("Invalid classId"));

    const classPrefix = classDoc.name.replace(/\s+/g, "").toUpperCase();
    const year = new Date().getFullYear();

    const count = await this.constructor.countDocuments({
      classId: this.classId,
      admissionDate: {
        $gte: new Date(`${year}-01-01`),
        $lte: new Date(`${year}-12-31`),
      },
    });

    const serial = String(count + 1).padStart(3, "0");
    this.rollNo = `${classPrefix}${year}${serial}`;

    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("Student", StudentSchema);
