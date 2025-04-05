const mongoose = require("mongoose");

const FeeSchema = new mongoose.Schema(
  {
    students: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    academicYear: {
      type: String,
      required: true,
    },
    feeType: {
      type: String,
      enum: ["Tuition", "Transport", "Library", "Sports", "Hostel", "Other"],
      required: true,
    },
    paidAmount: {
      type: Number,
      default: 0,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Partial", "Overdue"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Fee", FeeSchema);
