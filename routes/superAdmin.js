const express = require("express");
const { checkDomainExists, createDomain } = require("../controllers/superAdminController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Super Admin creates a domain
router.post("/create-domain", authMiddleware, createDomain);
router.post("/domain", checkDomainExists);

module.exports = router;
