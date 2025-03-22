const mongoose = require("mongoose");

const TimetableSchema = new mongoose.Schema({
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true },
  className: { type: String, required: true },
  day: { type: String, required: true },
  periods: [
    {
      period: String,
      time: String,
      subject: String,
    },
  ],
});

module.exports = mongoose.model("Timetable", TimetableSchema);
