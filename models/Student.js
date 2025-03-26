// const mongoose = require("mongoose");

// const StudentSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   className: { type: String },
  
//   marks: { type: Object, default: {} }, // Stores exam name and marks
// });

// module.exports = mongoose.model("Student", StudentSchema);

const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class" }, // ✅ Link to Class Model
  marks: { type: Object, default: {} } // ✅ Stores exam name and marks
});

module.exports = mongoose.model("Student", StudentSchema);
