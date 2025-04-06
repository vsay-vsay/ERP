const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  createTimetable,
  updateTimetable,
  getAllTimetables,
  getMyTimetables,
} = require("../controllers/timetableController");

const router = express.Router();

router.post("/create", authMiddleware, createTimetable);
router.post("/update", authMiddleware, updateTimetable);
router.get("/getAllTimetables", authMiddleware, getAllTimetables);
router.get("/getMyTimetable", authMiddleware, getMyTimetables);

module.exports = router;
