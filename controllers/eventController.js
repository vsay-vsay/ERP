const Event = require("../models/Event");

// ✅ Create a new event
exports.createEvent = async (req, res) => {
  try {
    const { title, description, date, location, startDate, endDate, ...rest } =
      req.body;
    const createdBy = req.user.id; // Get logged-in user ID from token

    if (
      !title ||
      !date ||
      !location ||
      !startDate ||
      !endDate ||
      !description
    ) {
      return res
        .status(400)
        .json({ error: "Title, date, and location are required" });
    }

    const event = new Event({
      title,
      description,
      date,
      location,
      createdBy,
      startDate,
      endDate,
      ...rest,
    });
    await event.save();

    res.status(201).json({ message: "Event created successfully", event });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

// ✅ Update an event
exports.updateEvent = async (req, res) => {
  try {
    const data = req.body;
    const eventId = req.params.id;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ error: "Event not found" });

    // ✅ Ensure only the creator can update the event
    if (event.createdBy.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Unauthorized to update this event" });
    }

    // 🔄 Dynamically update all fields from req.body
    Object.keys(data).forEach((key) => {
      event[key] = data[key] || event[key];
    });

    await event.save();
    res.json({ message: "Event updated successfully", event });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
};


// ✅ Delete an event
exports.deleteEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await Event.findById(eventId);

    if (!event) return res.status(404).json({ error: "Event not found" });

    // ✅ Ensure only the creator can delete the event
    if (event.createdBy.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Unauthorized to delete this event" });
    }

    await event.deleteOne();
    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

// ✅ Get all events
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().populate("createdBy", "name email"); // ✅ Populate creator info
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};
