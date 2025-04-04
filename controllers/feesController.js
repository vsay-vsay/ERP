const Class = require("../models/Class.js");
const Fee = require("../models/Fee.js");
const Fees = require("../models/Fee.js");
const Student = require("../models/Student.js");

exports.createFeeForStudent = async (req, res) => {
  try {
    const {
      studentEmail,
      className,
      classSection,
      acdemicYear,
      feeType,
      paidAmmount,
      paymentStatus,
    } = req.body;

    if (
      !studentEmail ||
      !className ||
      !classSection ||
      !acdemicYear ||
      !feeType ||
      !paidAmmount ||
      !paymentStatus
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing fields",
      });
    }

    const student = await Student.findOne({ email: studentEmail });

    const studentClass = await Class.findOne({
      name: className,
      section: classSection,
    });

    if (!student) {
      return res.status(400).json({ error: "Student does not exist" });
    }

    if (!studentClass) {
      return res.status(400).json({ error: "Class does not exist" });
    }

    const newFee = new Fee({
      students: student._id,
      class: studentClass._id,
      acdemicYear,
      feeType,
      paidAmmount,
      paymentStatus,
    });

    await newFee.save();

    res.status(200).json({
      success: true,
      message: "Fee record created successfully",
      data: newFee,
    });
  } catch (error) {
    console.error("Error adding fee:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.updateFeeForStudent = async (req, res) => {
  try {
    const {
      studentEmail,
      className,
      classSection,
      acdemicYear,
      feeType,
      paidAmmount,
      paymentStatus,
    } = req.body;

    if (
      !studentEmail ||
      !className ||
      !classSection ||
      !acdemicYear ||
      !feeType
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const student = await Student.findOne({ email: studentEmail });
    if (!student) {
      return res.status(400).json({ error: "Student does not exist" });
    }

    const studentClass = await Class.findOne({
      name: className,
      section: classSection,
    });
    if (!studentClass) {
      return res.status(400).json({ error: "Class does not exist" });
    }

    const feeRecord = await Fee.findOne({
      students: student._id,
      class: studentClass._id,
      acdemicYear,
      feeType,
    });

    if (!feeRecord) {
      return res.status(404).json({ error: "Fee record not found" });
    }

    if (paidAmmount !== undefined) feeRecord.paidAmmount = paidAmmount;
    if (paymentStatus !== undefined) feeRecord.paymentStatus = paymentStatus;

    await feeRecord.save();

    res.status(200).json({
      success: true,
      message: "Fee record updated successfully",
      data: feeRecord,
    });
  } catch (error) {
    console.error("Error updating fee:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.getAllFeeRecords = async (req, res) => {
  try {
    const fees = await Fee.find().populate("students").populate("class");
    res.status(200).json({
      success: true,
      message: "All fee records retrieved successfully",
      data: fees,
    });
  } catch (error) {
    console.error("Error fetching fee records:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
