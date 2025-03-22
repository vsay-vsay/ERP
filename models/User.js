// const mongoose = require("mongoose");

// const UserSchema = new mongoose.Schema({
//   name: String,
//   email: { type: String, unique: true },
//   password: String,
//   role: { type: String, enum: ["Admin", "Teacher", "Student", "Accountant"], required: true }
// });

// module.exports = mongoose.model("User", UserSchema);

const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ["SuperAdmin", "Admin", "Teacher", "Student", "Accountant"], 
    required: true 
  },
  domainName: { type: String, required: function() { return this.role !== "SuperAdmin"; } } // Required except for SuperAdmin
});

module.exports = mongoose.model("User", UserSchema);


