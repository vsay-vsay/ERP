const mongoose = require("mongoose");

const AccountantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "Accountant" }
});

module.exports = mongoose.model("Accountant", AccountantSchema);
