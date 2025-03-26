require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Import Routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const teacherRoutes = require("./routes/teachers");
const dashboardRoutes = require("./routes/dashboard");
const superAdminRoutes = require("./routes/superAdmin");
const { createSuperAdmin } = require("./controllers/superAdminController");
const eventRoutes = require("./routes/events");
const classRoutes = require("./routes/classes");
// const adminRoutes = require("./routes/admin");
// const studentRoutes = require("./routes/students");
// const paymentRoutes = require("./routes/payments");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/super-admin", superAdminRoutes);
app.use("/api/events", eventRoutes); 
app.use("/api/classes", classRoutes);
// app.use("/api/admin", adminRoutes);
// app.use("/api/student", studentRoutes);
// app.use("/api/payments", paymentRoutes);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    createSuperAdmin();
    app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));
  })
  .catch((err) => console.error(err));
