const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  createFeeForStudent,
  updateFeeForStudent,
  getAllFeeRecords,
} = require("../controllers/feesController");

const router = express.Router();

router.post("/create", createFeeForStudent);

router.post("/update", updateFeeForStudent);

router.get("/getFees", getAllFeeRecords);

module.exports = router;
