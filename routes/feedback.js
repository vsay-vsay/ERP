const express = require("express");
const authMiddleware = require("../middleware/authMiddleware"); // ✅ Protect routes
const { createFeedback } = require("../controllers/feedbackController");

const router = express.Router();

router.post("/create", authMiddleware, createFeedback);

module.exports = router;
