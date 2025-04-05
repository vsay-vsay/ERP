const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  createFeeForStudent,
  updateFeeForStudent,
  getAllFeeRecords,
  getFeesByStudent,
  deleteFeeRecord,
  getFeeSummaryByStudent,
} = require("../controllers/feesController");
const authorizeRoles = require("../middleware/roleMiddleware");
const router = express.Router();

router.post("/create", createFeeForStudent);
router.post("/update", updateFeeForStudent);
router.get(
  "/getFees",
  authMiddleware,
  // authorizeRoles("Admin", "Accountant", "Superadmin"),
  getAllFeeRecords
);
router.get("/student/:email", authMiddleware, getFeesByStudent);
router.delete("/:id", authMiddleware, deleteFeeRecord);
router.get("/summary/:email", authMiddleware, getFeeSummaryByStudent);

module.exports = router;
