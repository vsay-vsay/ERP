const XLSX = require("xlsx");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Student = require("../models/Student");
const Domain = require("../models/Domain");
const Class = require("../models/Class");


exports.bulkRegister = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const workbook = XLSX.readFile(file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const users = XLSX.utils.sheet_to_json(sheet);

    const results = {
      created: [],
      skipped: [],
      errors: []
    };

    for (const userData of users) {
      const { name, email, password, role, domainName } = userData;

      try {
        if (!name || !email || !password || !role || !domainName) {
          results.skipped.push({ email: email || "unknown", reason: "Missing fields" });
          continue;
        }

        const existing = await User.findOne({ email });
        if (existing) {
          results.skipped.push({ email, reason: "Email already exists" });
          continue;
        }

        const domain = await Domain.findOne({ domainName });
        if (!domain) {
          results.skipped.push({ email, reason: "Domain not found" });
          continue;
        }

        const roleCounts = await User.countDocuments({ domainName, role });
        const roleLimits = {
          Admin: domain.maxAdmins,
          Teacher: domain.maxTeachers,
          Student: domain.maxStudents,
          Accountant: domain.maxAccountants
        };

        if (roleLimits[role] !== undefined && roleCounts >= roleLimits[role]) {
          results.skipped.push({ email, reason: `Max ${role}s limit reached` });
          continue;
        }

        const hashedPassword = await bcrypt.hash(String(password), 10); // Ensure password is string

        if (role === "Student") {
          await Promise.all([
            new Student({ name, email, password: hashedPassword, role, domainName }).save(),
            new User({ name, email, password: hashedPassword, role, domainName }).save(),
          ]);
        } else {
          await new User({ name, email, password: hashedPassword, role, domainName }).save();
        }

        results.created.push({ email });
      } catch (innerErr) {
        results.errors.push({
          email: userData.email || "unknown",
          error: innerErr.message || "Unknown error"
        });
      }
    }

    fs.unlinkSync(file.path); // Delete uploaded file

    res.status(200).json({
      message: "Bulk registration completed",
      results,
    });
  } catch (error) {
    console.error("Bulk register error:", error);
    res.status(500).json({ error: "Server error" });
  }
};




exports.bulkCreateClass = async (req, res) => {
  try {
    const file = req.file;
    const createdBy = req.user.id;

    if (!file) {
      return res.status(400).json({ error: "No Excel file uploaded" });
    }

    const workbook = XLSX.readFile(file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    const results = {
      created: [],
      skipped: [],
      errors: [],
    };

    for (const row of rows) {
      const { name, section, description } = row;

      if (!name || !section) {
        results.skipped.push({ name: name || "Unknown", reason: "Missing required fields" });
        continue;
      }

      try {
        const existing = await Class.findOne({ name, section });
        if (existing) {
          results.skipped.push({ name, section, reason: "Class already exists" });
          continue;
        }

        const newClass = new Class({ name, section, description, createdBy });
        await newClass.save();

        results.created.push({ name, section });
      } catch (err) {
        results.errors.push({
          name: name || "Unknown",
          section: section || "Unknown",
          error: err.message,
        });
      }
    }

    fs.unlinkSync(file.path); // delete the uploaded file

    res.status(200).json({
      message: "Bulk class creation completed",
      results,
    });
  } catch (error) {
    console.error("Bulk class creation error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
