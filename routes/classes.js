const express = require("express");
const { createClass, updateClass, deleteClass, getAllClasses, getClassDetails, addStudentToClass,removeStudentFromClass } = require("../controllers/classController");
const authMiddleware = require("../middleware/authMiddleware"); // ✅ Protect routes

const router = express.Router();

router.post("/create-class", authMiddleware, createClass); // ✅ Create a class
router.put("/:id", authMiddleware, updateClass); // ✅ Update a class
router.delete("/:id", authMiddleware, deleteClass); // ✅ Delete a class
router.get("/all-class", getAllClasses); // ✅ Get all classes (public)
router.get("/:id", getClassDetails); // ✅ Get class details with students
router.post("/:id/add-student", authMiddleware, addStudentToClass);
router.delete("/:id/remove-student", authMiddleware, removeStudentFromClass);

module.exports = router;
