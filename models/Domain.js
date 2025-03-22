const mongoose = require("mongoose");

const DomainSchema = new mongoose.Schema({
  domainName: { type: String, required: true, unique: true }, // Ensure `domainName` is unique and required
  maxAdmins: { type: Number, required: true },
  maxTeachers: { type: Number, required: true },
  maxStudents: { type: Number, required: true },
  maxAccountants: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Domain", DomainSchema);
