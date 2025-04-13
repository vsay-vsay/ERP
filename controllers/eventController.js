const Event = require("../models/Event");

// ✅ Create a new event
exports.createEvent = async (req, res) => {
  try {
    const { title, description, location, startDate, endDate, ...rest } =
      req.body;
    const createdBy = req.user.id; // Get logged-in user ID from token

    if (!title || !location || !startDate || !endDate || !description) {
      return res
        .status(400)
        .json({ error: "Title, startDate, endDate and location are required" });
    }

    const event = new Event({
      title,
      description,
      location,
      createdBy,
      startDate,
      endDate,
      ...rest,
    });
    await event.save();

    res.status(201).json({ message: "Event created successfully", event });
  } catch (error) {
    console.log(error);
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
      return res
        .status(403)
        .json({ error: "Unauthorized to update this event" });
    }

    // 🔄 Dynamically update all fields from req.body
    Object.keys(data).forEach((key) => {
      event[key] = data[key] || event[key];
    });
    // 🔄 Dynamically update all fields from req.body
    Object.keys(data).forEach((key) => {
      event[key] = data[key] || event[key];
    });

    await event.save();
    res.json({ message: "Event updated successfully", event });
  } catch (error) {
    console.error(error);
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
    const { role } = req.user;

    let events;

    if (role === "Admin") {
      events = await Event.find()
        .select("-visibility")
        .populate("createdBy", "name email");
    } else {
      events = await Event.find({
        visibility: { $in: [role] },
      })
        .select("-visibility")
        .populate("createdBy", "name email");
    }

    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
};

exports.getIdwiseEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.user;

    let event;

    if (role === "Admin") {
      event = await Event.findById(id)
        .populate("createdBy", "name email");
    } else {
      event = await Event.findOne({
        _id: id,
        visibility: { $in: [role] },
      })
        .select("-visibility")
        .populate("createdBy", "name email");
    }

    if (!event) {
      return res.status(404).json({ error: "Event not found or access denied" });
    }

    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
};
