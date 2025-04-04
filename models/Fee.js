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

    acdemicYear: {
      type: String,
      required: true,
    },
    feeType: {
      type: String,
      enum: ["Tuition", "Transport", "Library", "Sports", "Hostel", "Other"],
      required: true,
    },
    paidAmmount: {
      type: Number,
      default: 0,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Partial", "Overdue"],
      default: "Pending",
    },
    // createdBy: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Accountant",
    //   required: true,
    // },
    // updatedBy: {
    //   updatedBy: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Accountant",
    //   },
    // },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Fee", FeeSchema);
