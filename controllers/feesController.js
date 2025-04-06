const Class = require("../models/Class.js");
const Fee = require("../models/Fee.js");
const Student = require("../models/Student.js");

exports.createFeeForStudent = async (req, res) => {
  try {
    const {
      studentEmail,
      className,
      classSection,
      academicYear,
      feeType,
      paidAmount,
      paymentStatus,
    } = req.body;

    if (
      !studentEmail ||
      !className ||
      !classSection ||
      !academicYear ||
      !feeType ||
      paidAmount == null ||
      !paymentStatus
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Missing fields" });
    }

    const student = await Student.findOne({ email: studentEmail });
    const studentClass = await Class.findOne({
      name: className,
      section: classSection,
    });

    if (!student)
      return res.status(400).json({ error: "Student does not exist" });
    if (!studentClass)
      return res.status(400).json({ error: "Class does not exist" });

    const newFee = new Fee({
      students: student._id,
      class: studentClass._id,
      academicYear,
      feeType,
      paidAmount,
      paymentStatus,
    });

    await newFee.save();

    res
      .status(200)
      .json({ success: true, message: "Fee record created", data: newFee });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal error",
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
      academicYear,
      feeType,
      paidAmount,
      paymentStatus,
    } = req.body;

    if (
      !studentEmail ||
      !className ||
      !classSection ||
      !academicYear ||
      !feeType
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const student = await Student.findOne({ email: studentEmail });
    const studentClass = await Class.findOne({
      name: className,
      section: classSection,
    });

    if (!student)
      return res.status(400).json({ error: "Student does not exist" });
    if (!studentClass)
      return res.status(400).json({ error: "Class does not exist" });

    const feeRecord = await Fee.findOne({
      students: student._id,
      class: studentClass._id,
      academicYear,
      feeType,
    });

    if (!feeRecord)
      return res.status(404).json({ error: "Fee record not found" });

    if (paidAmount !== undefined) feeRecord.paidAmount = paidAmount;
    if (paymentStatus !== undefined) feeRecord.paymentStatus = paymentStatus;

    await feeRecord.save();

    res
      .status(200)
      .json({ success: true, message: "Fee record updated", data: feeRecord });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal error",
      error: error.message,
    });
  }
};

exports.getAllFeeRecords = async (req, res) => {
  try {
    const { role, id } = req.user;

    let fees;
    if (id && role === "Student") {
      // Fetch only the fees for this student
      fees = await Fee.find({ students: id })
        .populate("students")
        .populate("class");
    } else {
      // Admin or other roles - fetch all records
      fees = await Fee.find().populate("students").populate("class");
    }

    res
      .status(200)
      .json({ success: true, message: "Fees retrieved", data: fees });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal error",
      error: error.message,
    });
  }
};

exports.getFeesByStudent = async (req, res) => {
  try {
    const { email } = req.params;
    const student = await Student.findOne({ email });
    if (!student) return res.status(404).json({ error: "Student not found" });

    const fees = await Fee.find({ students: student._id }).populate("class");
    res.status(200).json({ success: true, data: fees });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteFeeRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Fee.findByIdAndDelete(id);
    if (!deleted)
      return res.status(404).json({ error: "Fee record not found" });

    res.status(200).json({ success: true, message: "Fee deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getFeeSummaryByStudent = async (req, res) => {
  try {
    const { email } = req.params;
    const student = await Student.findOne({ email });
    if (!student) return res.status(404).json({ error: "Student not found" });

    const fees = await Fee.find({ students: student._id });
    const summary = fees.reduce(
      (acc, fee) => {
        acc.totalPaid += fee.paidAmount;
        if (fee.paymentStatus !== "Paid") acc.pendingFees += fee.paidAmount;
        return acc;
      },
      { totalPaid: 0, pendingFees: 0 }
    );

    res.status(200).json({ success: true, summary });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
