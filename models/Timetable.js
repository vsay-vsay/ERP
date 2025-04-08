// const mongoose = require("mongoose");

// const timetableSchema = new mongoose.Schema(
//   {
//     title: { type: String, required: true },

//     days: [
//       {
//         day: { type: String, required: true }, // e.g., Monday
//         periods: [
//           {
//             subject: { type: String, required: true },
//             startTime: { type: String, required: true },
//             endTime: { type: String, required: true },
//             teacher: {
//               type: mongoose.Schema.Types.ObjectId,
//               ref: "Teacher",
//             },
//           },
//         ],
//       },
//     ],

//     forRole: {
//       type: String,
//       enum: ["Teacher", "Student"],
//       required: true,
//     },

//     assignedTo: {
//       type: mongoose.Schema.Types.ObjectId,
//       refPath: "forRoleRef",
//       required: true,
//     },

//     forRoleRef: {
//       type: String,
//       required: true,
//       enum: ["Teacher", "Student"],
//     },

//     createdBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       required: true,
//       refPath: "createdByModel",
//     },

//     createdByModel: {
//       type: String,
//       required: true,
//       enum: ["Admin", "Teacher"],
//     },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Timetable", timetableSchema);



const mongoose = require("mongoose");

const timetableSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: function () {
        return this.forRole === "Student";
      },
    },

    section: {
      type: String,
      default: "A",
    },

    days: [
      {
        day: {
          type: String,
          enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          required: true,
        },
        periods: [
          {
            subject: {
              type: String,
              required: true,
            },
            startTime: {
              type: String,
              required: true,
            },
            endTime: {
              type: String,
              required: true,
            },
            teacher: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Teacher",
            },
            room: {
              type: String,
              default: "Not Assigned",
            },
            notes: {
              type: String,
              default: "",
            },
          },
        ],
      },
    ],

    forRole: {
      type: String,
      enum: ["Teacher", "Student"],
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

    classTeacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
    },

    academicYear: {
      type: String,
      default: () => {
        const year = new Date().getFullYear();
        return `${year}-${year + 1}`;
      },
    },

    status: {
      type: String,
      enum: ["Active", "Archived"],
      default: "Active",
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
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Timetable", timetableSchema);