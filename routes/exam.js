const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  createExam,
  updateExam,
  getExams,
} = require("../controllers/examController");

const router = express.Router();

router.post("/create", authMiddleware, createExam);
router.post("/update", authMiddleware, updateExam);
router.get("/get", authMiddleware, getExams);

module.exports = router;
