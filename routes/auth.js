// routes/authRoutes.js
const express = require("express");
const { register, login } = require("../controllers/authController");
const { bulkRegister } = require("../controllers/excelUploadController");
const upload = require("../middleware/uploadMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post(
  "/bulk-register",
  authMiddleware,
  authorizeRoles("Admin", "Superuser"),
  upload.single("file"),
  bulkRegister 
);

module.exports = router;
