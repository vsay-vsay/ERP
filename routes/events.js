const express = require("express");
const {
  createEvent,
  updateEvent,
  deleteEvent,
  getAllEvents,
} = require("../controllers/eventController");
const authMiddleware = require("../middleware/authMiddleware"); // ✅ Protect routes
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
  "/create-event",
  authMiddleware,
  authorizeRoles("Admin", "Teacher"),
  createEvent
); // ✅ Create an event
router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("Admin", "Teacher"),
  updateEvent
); // ✅ Update an event
router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("Admin", "Teacher"),
  deleteEvent
); // ✅ Delete an event
router.get("/all-event", authMiddleware, getAllEvents); // ✅ Get all events (public)

module.exports = router;
