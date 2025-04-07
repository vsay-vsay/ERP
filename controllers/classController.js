const Class = require("../models/Class");
const Student = require("../models/Student");

// ✅ Create a new class
exports.createClass = async (req, res) => {
  try {
    const { name, section, description, classTeacher } = req.body;
    const createdBy = req.user.id; // Get logged-in user ID from token

    if (!name || !section || !classTeacher) {
      return res.status(400).json({ error: "Class name and section are required" });
    }

    const newClass = new Class({ name, section, description, createdBy });
    await newClass.save();

    res.status(201).json({ message: "Class created successfully", class: newClass });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

// ✅ Update a class
exports.updateClass = async (req, res) => {
  try {
    const { name, section, description } = req.body;
    const classId = req.params.id;

    const existingClass = await Class.findById(classId);
    if (!existingClass) return res.status(404).json({ error: "Class not found" });

    // ✅ Ensure only the creator can update the class
    if (existingClass.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized to update this class" });
    }

    existingClass.name = name || existingClass.name;
    existingClass.section = section || existingClass.section;
    existingClass.description = description || existingClass.description;

    await existingClass.save();
    res.json({ message: "Class updated successfully", class: existingClass });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

// ✅ Get all classes
exports.getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find().populate("createdBy", "name email");
    res.json(classes);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

// ✅ Get class details with students list
exports.getClassDetails = async (req, res) => {
  try {
    const classId = req.params.id;
    const classDetails = await Class.findById(classId)
      .populate("createdBy", "name email") // Show creator info
      .populate("students", "name email className"); // Show students list

    if (!classDetails) return res.status(404).json({ error: "Class not found" });

    res.json(classDetails);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

exports.deleteClass = async (req, res) => {
    try {
      const classId = req.params.id;
      const existingClass = await Class.findById(classId);
  
      if (!existingClass) return res.status(404).json({ error: "Class not found" });
  
      // ✅ Ensure only the creator can delete the class
      if (existingClass.createdBy.toString() !== req.user.id) {
        return res.status(403).json({ error: "Unauthorized to delete this class" });
      }
  
      await existingClass.deleteOne();
      res.json({ message: "Class deleted successfully" });
    } catch (error) {
      console.error("Error deleting class:", error);
      res.status(500).json({ error: "Server Error" });
    }
  };
  
  // ✅ Add a student to a class
  exports.addStudentToClass = async (req, res) => {
    try {
      const classId = req.params.id;
      const { email } = req.body; // ✅ Get student by email instead of `_id`
  
      // ✅ Find the class
      const existingClass = await Class.findById(classId);
      if (!existingClass) return res.status(404).json({ error: "Class not found" });
  
      // ✅ Check if the student exists in Student collection
      const student = await Student.findOne({ email });
      if (!student) {
        return res.status(404).json({ error: "Student not found in Student collection" });
      }
  
      // ✅ Prevent duplicate students
      if (existingClass.students.includes(student._id)) {
        return res.status(400).json({ error: "Student already in this class" });
      }
  
      // ✅ Add student to class & update Student model with classId
      existingClass.students.push(student._id);
      student.classId = classId; // ✅ Link student to the class
      await existingClass.save();
      await student.save();
  
      res.status(200).json({ message: "Student added to class successfully", class: existingClass });
    } catch (error) {
      console.error("Error adding student:", error);
      res.status(500).json({ error: "Server Error" });
    }
  };

  exports.removeStudentFromClass = async (req, res) => {
    try {
      const classId = req.params.id;
      const { email } = req.body; // ✅ Get student by email
  
      // ✅ Find the class
      const existingClass = await Class.findById(classId);
      if (!existingClass) return res.status(404).json({ error: "Class not found" });
  
      // ✅ Check if the student exists in Student collection
      const student = await Student.findOne({ email });
      if (!student) {
        return res.status(404).json({ error: "Student not found in Student collection" });
      }
  
      // ✅ Check if the student is actually in the class
      if (!existingClass.students.includes(student._id)) {
        return res.status(400).json({ error: "Student is not in this class" });
      }
  
      // ✅ Remove student from class
      existingClass.students = existingClass.students.filter(id => id.toString() !== student._id.toString());
      student.classId = null; // ✅ Unlink student from class
      await existingClass.save();
      await student.save();
  
      res.status(200).json({ message: "Student removed from class successfully", class: existingClass });
    } catch (error) {
      console.error("Error removing student:", error);
      res.status(500).json({ error: "Server Error" });
    }
  };