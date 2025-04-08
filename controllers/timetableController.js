const Timetable = require("../models/Timetable");
const mongoose = require("mongoose");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

exports.createTimetable = async (req, res) => {
  const { title, days, forRole, forRoleRef, assignedTo } = req.body;

  if (
    !["Teacher", "Student"].includes(forRole) ||
    !["Teacher", "Student"].includes(forRoleRef)
  ) {
    return res.status(400).json({ error: "Invalid role or reference" });
  }

  if (!isValidId(assignedTo)) {
    return res.status(400).json({ error: "Invalid assignedTo ID" });
  }

  // Teachers can only assign to students
  if (req.role === "Teacher" && forRoleRef !== "Student") {
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
    createdBy: req.user.id,
    createdByModel: req.user.role === "Admin" ? "Admin" : "Teacher",
  });

  try {
    const saved = await timetable.save();
    res
      .status(201)
      .json({ success: true, message: "Timetable created", data: saved });
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
    if (req.role === "Admin") {
      // Admin has full access
    } else if (req.role === "Teacher") {
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

exports.getTimetables = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "Admin") {
      // Admin: no filter needed, get all timetables
      filter = {};
    } else if (req.user.role === "Teacher") {
      // Teacher: fetch timetables they created or assigned to
      filter = {
        $or: [
          { createdBy: req.user.id, createdByModel: "Teacher" },
          { assignedTo: req.user.id, forRoleRef: "Teacher" },
        ],
      };
    } else if (req.user.role === "Student") {
      // Student: fetch timetables assigned to them
      filter = {
        assignedTo: req.user.id,
        forRoleRef: "Student",
      };
    } else {
      return res.status(403).json({ error: "Access denied" });
    }

    const timetables = await Timetable.find(filter)
      .populate("assignedTo")
      .populate("createdBy");

    res.status(200).json({ success: true, data: timetables });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch", details: err.message });
  }
};





// // controllers/timetableController.js
// const Timetable = require("../models/Timetable");
// const Teacher = require("../models/Teacher");
// const Student = require("../models/Student");

// // Create Timetable
// exports.createTimetable = async (req, res) => {
//   try {
//     const timetable = new Timetable({
//       ...req.body,
//       createdBy: req.user._id,
//       createdByModel: req.user.role,
//     });

//     const savedTimetable = await timetable.save();
//     res.status(201).json({ message: "Timetable created successfully", timetable: savedTimetable });
//   } catch (err) {
//     console.error("Error creating timetable:", err);
//     res.status(500).json({ error: "Failed to create timetable" });
//   }
// };

// // Get Timetable by ID
// exports.getTimetableById = async (req, res) => {
//   try {
//     const timetable = await Timetable.findById(req.params.id)
//       .populate("assignedTo")
//       .populate("classTeacher", "name email")
//       .populate("days.periods.teacher", "name email");

//     if (!timetable) return res.status(404).json({ error: "Timetable not found" });
//     res.json(timetable);
//   } catch (err) {
//     console.error("Error fetching timetable:", err);
//     res.status(500).json({ error: "Failed to fetch timetable" });
//   }
// };

// // Get My Timetable (Student/Teacher)
// exports.getMyTimetable = async (req, res) => {
//   try {
//     const timetable = await Timetable.findOne({
//       assignedTo: req.user._id,
//       forRole: req.user.role,
//       status: "Active",
//     })
//       .populate("classTeacher", "name email")
//       .populate("days.periods.teacher", "name email");

//     if (!timetable) return res.status(404).json({ error: "No timetable found" });
//     res.json(timetable);
//   } catch (err) {
//     console.error("Error getting my timetable:", err);
//     res.status(500).json({ error: "Failed to get timetable" });
//   }
// };

// // Update Timetable
// exports.updateTimetable = async (req, res) => {
//   try {
//     const updatedTimetable = await Timetable.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true }
//     );
//     if (!updatedTimetable) return res.status(404).json({ error: "Timetable not found" });
//     res.json({ message: "Updated successfully", timetable: updatedTimetable });
//   } catch (err) {
//     console.error("Update error:", err);
//     res.status(500).json({ error: "Failed to update timetable" });
//   }
// };

// // Delete Timetable
// exports.deleteTimetable = async (req, res) => {
//   try {
//     await Timetable.findByIdAndDelete(req.params.id);
//     res.json({ message: "Timetable deleted successfully" });
//   } catch (err) {
//     console.error("Delete error:", err);
//     res.status(500).json({ error: "Failed to delete timetable" });
//   }
// };

// // Get all timetables (Admin)
// exports.getAllTimetables = async (req, res) => {
//   try {
//     const timetables = await Timetable.find()
//       .populate("assignedTo", "name email")
//       .populate("classTeacher", "name")
//       .populate("days.periods.teacher", "name");

//     res.json(timetables);
//   } catch (err) {
//     console.error("Fetch all error:", err);
//     res.status(500).json({ error: "Failed to fetch timetables" });
//   }
// };
