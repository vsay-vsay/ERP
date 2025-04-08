// const mongoose = require("mongoose");

// const EventSchema = new mongoose.Schema({
//   title: { type: String, required: true },
//   description: { type: String },
//   date: { type: Date, required: true },
//   location: { type: String, required: true },
//   createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   createdAt: { type: Date, default: Date.now },
// });

// module.exports = mongoose.model("Event", EventSchema);

const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  eventType: {
    type: String,
    enum: ['Seminar', 'Workshop', 'Holiday', 'Exam', 'Meeting', 'Festival', 'Other'],
    default: 'Other'
  },
  location: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  visibility: {
    type: String,
    enum: ['Admin', 'Teacher', 'Student', 'Accountant'],
    default: ['Student', 'Teacher', 'Admin', 'Accountant']
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  // attachments: [{
  //   fileUrl: String,
  //   fileName: String,
  // }],
  // allowRegistration: {
  //   type: Boolean,
  //   default: false,
  // },
  // registeredStudents: [{
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'Student'
  // }],
  // isPublished: {
  //   type: Boolean,
  //   default: true,
  // },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Event', eventSchema);
