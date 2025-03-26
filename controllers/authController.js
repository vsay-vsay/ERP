const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Teacher = require("../models/Teacher");
const Student = require("../models/Student");
const Accountant = require("../models/Accountant");
const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const Domain = require("../models/Domain");

exports.register = async (req, res) => {
    try {
      const { name, email, password, role, domainName } = req.body;
  
      // Check if user already exists
      let existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ error: "Email already exists" });
  
      // Validate domain
      if (!domainName) {
        return res.status(400).json({ error: "Domain name is required" });
      }
      const domain = await Domain.findOne({ domainName: domainName });
      if (!domain) return res.status(404).json({ error: "Domain not found" });
  
      // Check role limits
      const roleCounts = await User.countDocuments({ domainName, role });
      if (
        (role === "Admin" && roleCounts >= domain.maxAdmins) ||
        (role === "Teacher" && roleCounts >= domain.maxTeachers) ||
        (role === "Student" && roleCounts >= domain.maxStudents) ||
        (role === "Accountant" && roleCounts >= domain.maxAccountants)
      ) {
        return res.status(400).json({ error: `Max ${role}s limit reached for this domain` });
      }
  
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Create User with domainName
      const user = new User({ name, email, password: hashedPassword, role, domainName });
      await user.save();
  
      res.status(201).json({ message: `${role} created successfully in ${domainName}`, user });
    } catch (error) {
      console.error("Error in register:", error);
      res.status(500).json({ error: "Server Error" });
    }
  };
  

// exports.login = async (req, res) => {
//     try {
//       const { email, password } = req.body;
//       const user = await User.findOne({ email });
//       if (!user) return res.status(400).json({ error: "Invalid credentials" });
  
//       const isMatch = await bcrypt.compare(password, user.password);
//       if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });
  
//       const token = jwt.sign(
//         { id: user._id, role: user.role, domainId: user.domainId },
//         process.env.JWT_SECRET,
//         { expiresIn: "1h" }
//       );
  
//       res.json({ token, role: user.role.toLowerCase() });
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   };

exports.login = async (req, res) => {
    try {
      const { email, password, domainName } = req.body;

      // ✅ Check if the user exists
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ error: "Invalid credentials" });

      // ✅ Check if the user belongs to the provided domain
      if (user.domainName !== domainName) {
        return res.status(403).json({ error: "Access denied. Incorrect domain." });
      }

      // ✅ Check if the password matches
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

      // ✅ Generate JWT token
      const token = jwt.sign(
        { id: user._id, role: user.role, domainName: user.domainName },
        process.env.JWT_SECRET,
        { expiresIn: "365d" }
      );

      res.json({ token, role: user.role, domainName: user.domainName, email: user.email, name: user.name});
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
};
