const express = require("express");
const {
  createClass,
  updateClass,
  deleteClass,
  getAllClasses,
  getClassDetails,
  addStudentToClass,
  removeStudentFromClass,
} = require("../controllers/classController");
const authMiddleware = require("../middleware/authMiddleware"); // ✅ Protect routes
const authorizeRoles = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");
const { bulkCreateClass } = require("../controllers/excelUploadController");
const router = express.Router();



router.post(
  "/create-class",
  authMiddleware,
  authorizeRoles("Admin", "SuperUser"),
  createClass
); // ✅ Create a class

router.post("/bulk-create-class", authMiddleware, authorizeRoles("Admin") , upload.single("file"), bulkCreateClass);
router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("Admin"),
  updateClass
); // ✅ Update a class
router.delete("/:id", authMiddleware, authorizeRoles("Addmin"), deleteClass); // ✅ Delete a class
router.get("/all-class", getAllClasses); // ✅ Get all classes (public)
router.get("/:id", getClassDetails); // ✅ Get class details with students
router.post(
  "/:id/add-student",
  authMiddleware,
  authorizeRoles("Teacher", "Admin", "SuperUser"),
  addStudentToClass
);
router.delete(
  "/:id/remove-student",
  authMiddleware,
  authorizeRoles("Teacher", "Admin", "SuperUser"),
  removeStudentFromClass
);

module.exports = router;
