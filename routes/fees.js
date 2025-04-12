const express = require("express");
const {
  createFeeForStudent,
  updateFeeForStudent,
  getAllFeeRecords,
  getFeesByStudent,
  deleteFeeRecord,
  getFeeSummaryByStudent,
} = require("../controllers/feesController");
const authorizeRoles = require("../middleware/roleMiddleware");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

router.post(
  "/create",
  authorizeRoles("Admin", "Accountant", "Superadmin"),
  authMiddleware,
  createFeeForStudent
);
router.post("/update",authorizeRoles("Admin", "Accountant", "Superadmin"),authMiddleware, updateFeeForStudent);
router.get("/getFees", authMiddleware, getAllFeeRecords);
router.get("/student/:email", authMiddleware, getFeesByStudent);
router.delete("/:id", authMiddleware, deleteFeeRecord);
router.get("/summary/:email", authMiddleware, getFeeSummaryByStudent);

module.exports = router;
