const express = require("express");
const authMiddleware = require("../middleware/authMiddleware"); // ✅ Protect routes
const authorizeRoles = require("../middleware/roleMiddleware");
const { getCommonData } = require("../controllers/commonDatacontroller");


const router=express.Router()


router.get('/', authMiddleware, getCommonData);


module.exports = router;
