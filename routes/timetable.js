const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  createTimetable,
  updateTimetable,
  getAllTimetables,
  getMyTimetables,
  getTimetables,
} = require("../controllers/timetableController");

const router = express.Router();

router.post("/create", authMiddleware, createTimetable);
router.post("/update", authMiddleware, updateTimetable);
router.get("/get", authMiddleware, getTimetables);

module.exports = router;
