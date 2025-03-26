const User = require("../models/User");

// Get users by domain name (POST request)
exports.getAllUsers = async (req, res) => {
  try {
    const { domain } = req.body; // Extract domain from request body

    if (!domain) {
      return res.status(400).json({ error: "Domain is required" });
    }

    const users = await User.find({ domainName: domain }).select("-password"); // Exclude passwords

    if (users.length === 0) {
      return res.status(404).json({ message: "No users found for this domain" });
    }

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};



// Get a single user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const updatedUser = await User.findByIdAndUpdate(req.params.id, { name, email, role }, { new: true });
    if (!updatedUser) return res.status(404).json({ error: "User not found" });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};
