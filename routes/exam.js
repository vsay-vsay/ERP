const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  createExam,
  updateExam,
  getExams,
} = require("../controllers/examController");
const { bulkAddExamsFromExcel } = require("../controllers/excelUploadController");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post('/add-exams',authMiddleware, upload.single('file'), bulkAddExamsFromExcel);
router.post("/create", authMiddleware, createExam);
router.post("/update", authMiddleware, updateExam);
router.get("/get", authMiddleware, getExams);

module.exports = router;
