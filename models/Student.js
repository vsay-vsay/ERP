

// const mongoose = require("mongoose");

// const StudentSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class" }, // ✅ Link to Class Model
//   marks: { type: Object, default: {} }, // ✅ Stores exam name and marks
//   teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" }, // ✅ Link to Teacher Model
//   timetable: { type: mongoose.Schema.Types.ObjectId, ref: "Timetable" }, //
// });

// module.exports = mongoose.model("Student", StudentSchema);

const mongoose = require("mongoose");


const StudentSchema = new mongoose.Schema({
  rollNo: {
    type: String,
    unique: true,
    index: true
  },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
  },
  dateOfBirth: {
    type: Date,
  },
  contact: {
    phone: String
  },
  address: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  guardian: {
    name: String,
    relation: String,
    phone: String
  },
  admissionDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher"
  },
  timetable: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Timetable"
  },
  marks: {
    type: Object,
    default: {}
  }
}, { timestamps: true });


// Auto-generate rollNo before saving
StudentSchema.pre("save", async function (next) {
  if (this.rollNo || !this.classId) return next();

  try {
    const classDoc = await mongoose.model("Class").findById(this.classId);
    if (!classDoc) return next(new Error("Invalid classId for roll number generation"));

    const classPrefix = classDoc.name.replace(/\s+/g, '').toUpperCase(); // e.g., "10A"

    const currentYear = new Date().getFullYear();

    const count = await mongoose.model("Student").countDocuments({
      classId: this.classId,
      admissionDate: {
        $gte: new Date(`${currentYear}-01-01`),
        $lte: new Date(`${currentYear}-12-31`)
      }
    });

    const serial = String(count + 1).padStart(3, "0");
    this.rollNo = `${classPrefix}${currentYear}${serial}`;
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("Student", StudentSchema);
