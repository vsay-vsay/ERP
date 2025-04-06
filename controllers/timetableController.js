const Timetable = require("../models/Timetable");
const mongoose = require("mongoose");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

exports.createTimetable = async (req, res) => {
  const { title, days, forRole, forRoleRef, assignedTo } = req.body;

  if (
    !["teacher", "student"].includes(forRole) ||
    !["Teacher", "Student"].includes(forRoleRef)
  ) {
    return res.status(400).json({ error: "Invalid role or reference" });
  }

  if (!isValidId(assignedTo)) {
    return res.status(400).json({ error: "Invalid assignedTo ID" });
  }

  // Teachers can only assign to students
  if (req.role === "teacher" && forRoleRef !== "Student") {
    return res
      .status(403)
      .json({ error: "Teachers can only assign timetables to students" });
  }

  const timetable = new Timetable({
    title,
    days,
    forRole,
    forRoleRef,
    assignedTo,
    createdBy: req.user._id,
    createdByModel: req.role === "admin" ? "Admin" : "Teacher",
  });

  try {
    const saved = await timetable.save();
    res.status(201).json({ message: "Timetable created", timetable: saved });
  } catch (err) {
    res.status(500).json({ error: "Creation failed", details: err.message });
  }
};

exports.updateTimetable = async (req, res) => {
  const { id } = req.params;

  if (!isValidId(id))
    return res.status(400).json({ error: "Invalid timetable ID" });

  try {
    const timetable = await Timetable.findById(id);
    if (!timetable)
      return res.status(404).json({ error: "Timetable not found" });

    // Permission check
    if (req.role === "admin") {
      // Admin has full access
    } else if (req.role === "teacher") {
      const isForStudent = timetable.forRoleRef === "Student";
      const isOwnTimetable =
        timetable.forRoleRef === "Teacher" &&
        timetable.assignedTo.toString() === req.user._id.toString();

      if (!isForStudent && !isOwnTimetable) {
        return res.status(403).json({
          error: "Teachers can only update student timetables or their own",
        });
      }
    } else {
      return res.status(403).json({ error: "Unauthorized role" });
    }

    const allowedFields = ["title", "days"];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        timetable[field] = req.body[field];
      }
    });

    await timetable.save();

    res.status(200).json({ message: "Timetable updated", timetable });
  } catch (err) {
    res.status(500).json({ error: "Update failed", details: err.message });
  }
};

exports.getAllTimetables = async (req, res) => {
  if (req.role !== "admin") {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    const timetables = await Timetable.find()
      .populate("assignedTo")
      .populate("createdBy");
    res.status(200).json(timetables);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch", details: err.message });
  }
};

exports.getMyTimetables = async (req, res) => {
  try {
    const filter =
      req.role === "teacher"
        ? {
            $or: [
              { createdBy: req.user._id, createdByModel: "Teacher" },
              { assignedTo: req.user._id, forRoleRef: "Teacher" },
            ],
          }
        : req.role === "student"
        ? { assignedTo: req.user._id, forRoleRef: "Student" }
        : {};

    const timetables = await Timetable.find(filter)
      .populate("assignedTo")
      .populate("createdBy");

    res.status(200).json(timetables);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch", details: err.message });
  }
};
