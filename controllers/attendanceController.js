const Attendance = require("../models/Attendance");
const User = require("../models/User");

exports.markAttendance = async (req, res) => {
  try {
    const { userId, date, status } = req.body;

    if (!userId || !date || !status) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const alreadyMarked = await Attendance.findOne({ user: userId, date });
    if (alreadyMarked) {
      return res.status(409).json({ success: false, message: "Attendance already marked for this date" });
    }

    const attendance = new Attendance({ user: userId, date, status });
    await attendance.save();

    res.status(200).json({ success: true, data: attendance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getOwnAttendance = async (req, res) => {
  try {
    const userId = req.user.id;
    const attendance = await Attendance.find({ user: userId }).sort({ date: -1 });
    res.status(200).json({ success: true, data: attendance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find().populate("user", "name role email").sort({ date: -1 });
    res.status(200).json({ success: true, data: attendance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const record = await Attendance.findById(id);
    if (!record) return res.status(404).json({ success: false, message: "Attendance record not found" });

    record.status = status;
    await record.save();

    res.status(200).json({ success: true, data: record });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Attendance.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, message: "Attendance record not found" });

    res.status(200).json({ success: true, message: "Attendance deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

