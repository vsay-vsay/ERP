const express = require("express");
const { getAllUsers, getUserById, updateUser, deleteUser } = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get all users (Admin only)
router.get("/all-users", authMiddleware, getAllUsers);

// Get a single user by ID
router.get("/:id", authMiddleware, getUserById);

// Update user details
router.put("/:id", authMiddleware, updateUser);

// Delete a user
router.delete("/:id", authMiddleware, deleteUser);

module.exports = router;
