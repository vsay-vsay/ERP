const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ error: "Access Denied" });

  try {
    const verified = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
    req.user = await User.findById(verified.id).select("email role domainName");
    if (!req.user) return res.status(404).json({ error: "User not found" });

    next();
  } catch (error) {
    res.status(400).json({ error: "Invalid Token" });
  }
};
