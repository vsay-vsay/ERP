const Feedback = require("../models/Feedback");
const User = require("../models/User");

exports.createFeedback = async (req, res) => {
  try {
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ error: "Access Denied" });

    const verified = jwt.verify(
      token.replace("Bearer ", ""),
      process.env.JWT_SECRET
    );
    const user = await User.findById(verified.id).select("email");
    if (!user) return res.status(404).json({ error: "User not found" });

    const { feedbackText, rating } = req.body;
    if (!feedbackText || rating === undefined) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const newFeedback = new Feedback({
      user: user._id,
      feedbackText,
      rating,
    });

    await newFeedback.save();

    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      data: newFeedback,
    });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
