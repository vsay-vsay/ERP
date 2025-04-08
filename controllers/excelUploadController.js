const XLSX = require("xlsx");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Student = require("../models/Student");
const Domain = require("../models/Domain");
const Class = require("../models/Class");
const Fee = require("../models/Fee");
const Teacher = require("../models/Teacher");
const Attendance = require("../models/Attendance");
const Exam = require("../models/Exam");
const Timetable = require("../models/Timetable");


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
      errors: [],
    };

    const domainName = req.user.domainName;

    const domain = await Domain.findOne({ domainName });
    if (!domain) {
      fs.unlinkSync(file.path);
      return res
        .status(404)
        .json({ error: "Domain not found for current user" });
    }

    for (const userData of users) {
      const { name, email, password, role } = userData;

      try {
        if (!name || !email || !password || !role) {
          results.skipped.push({
            email: email || "unknown",
            reason: "Missing fields",
          });
          continue;
        }

        const existing = await User.findOne({ email });
        if (existing) {
          results.skipped.push({ email, reason: "Email already exists" });
          continue;
        }

        const roleCounts = await User.countDocuments({ domainName, role });
        const roleLimits = {
          Admin: domain.maxAdmins,
          Teacher: domain.maxTeachers,
          Student: domain.maxStudents,
          Accountant: domain.maxAccountants,
        };

        if (roleLimits[role] !== undefined && roleCounts >= roleLimits[role]) {
          results.skipped.push({ email, reason: `Max ${role}s limit reached` });
          continue;
        }

        const hashedPassword = await bcrypt.hash(String(password), 10);

        if (role === "Student") {
          await Promise.all([
            new Student({
              name,
              email,
              password: hashedPassword,
              role,
              domainName,
            }).save(),
            new User({
              name,
              email,
              password: hashedPassword,
              role,
              domainName,
            }).save(),
          ]);
        } else {
          await new User({
            name,
            email,
            password: hashedPassword,
            role,
            domainName,
          }).save();
        }

        results.created.push({ email });
      } catch (innerErr) {
        results.errors.push({
          email: userData.email || "unknown",
          error: innerErr.message || "Unknown error",
        });
      }
    }

    fs.unlinkSync(file.path);

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
      const { name, section, description, classTeacher } = row;

      if (!name || !section) {
        results.skipped.push({
          name: name || "Unknown",
          reason: "Missing required fields",
        });
        continue;
      }

      try {
        const existing = await Class.findOne({ name, section });
        if (existing) {
          results.skipped.push({
            name,
            section,
            reason: "Class already exists",
          });
          continue;
        }

        const newClass = new Class({
          name,
          section,
          description,
          classTeacher,
          createdBy,
        });
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

exports.bulkAddStudentsFromExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    let added = [];
    let skipped = [];

    for (const entry of data) {
      const { name, email, className } = entry;

      if (!name || !email || !className) {
        skipped.push({ email, reason: "Missing required fields" });
        continue;
      }

      const existingStudent = await Student.findOne({ email });

      if (existingStudent) {
        skipped.push({ email, reason: "Already exists" });
        continue;
      }

      const student = new Student({ name, email, className });
      await student.save();
      added.push(student);
    }

    // Optionally remove the uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      message: "Bulk student upload complete",
      addedCount: added.length,
      skippedCount: skipped.length,
      added,
      skipped,
    });
  } catch (error) {
    console.error("Bulk Upload Error:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

exports.bulkAddExamsFromExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const added = [];
    const skipped = [];

    for (const [index, entry] of data.entries()) {
      const { title, subject, date, duration, className } = entry;

      if (!title || !subject || !date || !duration || !className) {
        skipped.push({ row: index + 2, reason: "Missing required fields" }); // Excel row number
        continue;
      }

      try {
        const exam = new Exam({
          title: title.trim(),
          subject: subject.trim(),
          date: new Date(date), // Parse properly
          duration: Number(duration),
          class: className.trim(),
          createdBy: req.user?._id || null, // Ensure req.user exists
        });

        await exam.save();
        added.push(exam);
      } catch (err) {
        console.error(`Error saving exam at row ${index + 2}:`, err.message);
        skipped.push({ row: index + 2, reason: err.message });
      }
    }

    // Remove uploaded file safely
    fs.unlink(req.file.path, (err) => {
      if (err) console.warn("Error deleting uploaded file:", err);
    });

    res.json({
      message: "Bulk exam upload complete",
      addedCount: added.length,
      skippedCount: skipped.length,
      added,
      skipped,
    });
  } catch (error) {
    console.error("Bulk Upload Error:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

exports.addTeachers = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const added = [];
    const skipped = [];

    const domainName = req.user.domainName;

    for (let [index, entry] of data.entries()) {
      const { name, email, password, salary } = entry;

      const existing = await User.findOne({ email });
      if (existing) {
        console.log(`Teacher with email ${email} already exists.`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(String(password), 10);

      await new User({
        name,
        email,
        password: hashedPassword,
        role: "Teacher",
        domainName,
      }).save();

      console.log(`Teacher with email ${email} added.`);
    }

    res.json({ message: "Teachers added successfully." });
  } catch (err) {
    console.error("Error adding teachers:", err);
    res.status(500).json({ error: "Server Error" });
  }
};





// Bulk Timetable 


exports.bulkUploadTimetable = async (req, res) => {
  try {
    const filePath = req.file.path;
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    const timetableMap = {};

    // Group rows by Title + AssignedToID
    rows.forEach((row) => {
      const key = `${row.Title}_${row.AssignedToID}`;
      if (!timetableMap[key]) {
        timetableMap[key] = {
          title: row.Title,
          forRole: row.ForRole,
          forRoleRef: row.ForRoleRef,
          assignedTo: row.AssignedToID,
          classId: row.ClassID,
          academicYear: new Date().getFullYear() + "-" + (new Date().getFullYear() + 1),
          days: {},
        };
      }

      const day = row.Day;
      if (!timetableMap[key].days[day]) {
        timetableMap[key].days[day] = [];
      }

      timetableMap[key].days[day].push({
        subject: row.Subject,
        startTime: row.StartTime,
        endTime: row.EndTime,
        teacher: row.TeacherID,
        room: row.Room || "Not Assigned",
      });
    });

    // Convert to documents
    const documents = Object.values(timetableMap).map((item) => ({
      ...item,
      days: Object.entries(item.days).map(([day, periods]) => ({
        day,
        periods,
      })),
    }));

    await Timetable.insertMany(documents);
    fs.unlinkSync(filePath); // delete after upload

    res.json({ message: "Bulk upload successful", count: documents.length });
  } catch (err) {
    console.error("Bulk upload error:", err);
    res.status(500).json({ error: "Failed to process bulk upload" });
  }
};