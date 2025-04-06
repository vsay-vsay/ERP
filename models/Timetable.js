const mongoose = require("mongoose");

const timetableSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },

    days: [
      {
        day: { type: String, required: true }, // e.g., Monday
        periods: [
          {
            subject: { type: String, required: true },
            startTime: { type: String, required: true },
            endTime: { type: String, required: true },
            teacher: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Teacher",
            },
          },
        ],
      },
    ],

    forRole: {
      type: String,
      enum: ["teacher", "student"],
      required: true,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "forRoleRef",
      required: true,
    },

    forRoleRef: {
      type: String,
      required: true,
      enum: ["Teacher", "Student"],
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "createdByModel",
    },

    createdByModel: {
      type: String,
      required: true,
      enum: ["Admin", "Teacher"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Timetable", timetableSchema);
