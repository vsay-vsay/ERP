const express = require("express");
const { createEvent, updateEvent, deleteEvent, getAllEvents } = require("../controllers/eventController");
const authMiddleware = require("../middleware/authMiddleware"); // ✅ Protect routes

const router = express.Router();

router.post("/create-event", authMiddleware, createEvent); // ✅ Create an event
router.put("/:id", authMiddleware, updateEvent); // ✅ Update an event
router.delete("/:id", authMiddleware, deleteEvent); // ✅ Delete an event
router.get("/all-event", getAllEvents); // ✅ Get all events (public)

module.exports = router;
