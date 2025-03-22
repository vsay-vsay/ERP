const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Domain = require("../models/Domain");

// Create default Super Admin on startup
exports.createSuperAdmin = async () => {
  try {
    const existingSuperAdmin = await User.findOne({ role: "SuperAdmin" });
    if (existingSuperAdmin) return;

    const hashedPassword = await bcrypt.hash("Vsay@123", 10);
    const superAdmin = new User({ name: "Super Admin", email: "admin", password: hashedPassword, role: "SuperAdmin" });

    await superAdmin.save();
    console.log("✅ Super Admin created successfully.");
  } catch (error) {
    console.error("❌ Error creating Super Admin:", error);
  }
};

// Super Admin creates a new Domain and an Admin inside it
exports.createDomain = async (req, res) => {
    try {
      if (req.user.role !== "SuperAdmin") {
        return res.status(403).json({ error: "Unauthorized" });
      }
  
      const { domainName, adminName, adminEmail, adminPassword, maxAdmins, maxTeachers, maxStudents, maxAccountants } = req.body;
  
      // ✅ Validate Request Body to Prevent `null` Values
      if (!domainName || !adminName || !adminEmail || !adminPassword ||
          maxAdmins === undefined || maxTeachers === undefined || 
          maxStudents === undefined || maxAccountants === undefined) {
        return res.status(400).json({ error: "All fields are required: domainName, adminName, adminEmail, adminPassword, maxAdmins, maxTeachers, maxStudents, maxAccountants" });
      }
  
      // ✅ Check if Domain Already Exists
      const existingDomain = await Domain.findOne({ domainName });
      if (existingDomain) return res.status(400).json({ error: "Domain already exists" });
  
      // ✅ Create Domain with Valid Data
      const domain = new Domain({
        domainName, // Now, `domainName` cannot be null
        maxAdmins,
        maxTeachers,
        maxStudents,
        maxAccountants
      });
      await domain.save();
  
      // ✅ Check if Admin Email Already Exists
      let existingAdmin = await User.findOne({ email: adminEmail });
      if (existingAdmin) return res.status(400).json({ error: "Admin email already exists" });
  
      // ✅ Hash Admin Password
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
  
      // ✅ Create Admin for This Domain
      const admin = new User({
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: "Admin",
        domainName: domain.domainName // Store `domainName` instead of `_id`
      });
      await admin.save();
  
      res.status(201).json({
        message: "Domain and Admin created successfully",
        domain,
        admin
      });
    } catch (error) {
      console.error("Error in createDomain:", error);
      res.status(500).json({ error: "Server Error" });
    }
  };

  exports.checkDomainExists = async (req, res) => {
    try {
      const { domainName } = req.body;
  
      // Validate request
      if (!domainName) {
        return res.status(400).json({ error: "Domain name is required" });
      }
  
      // Check if domain exists
      const domain = await Domain.findOne({ domainName });
      
      if (!domain) {
        return res.status(404).json({ error: "Domain does not exist" });
      }
  
      // Return the domain name if it exists
      res.status(200).json({ message: "Domain exists", domainName: domain.domainName });
    } catch (error) {
      console.error("Error in checkDomainExists:", error);
      res.status(500).json({ error: "Server Error" });
    }
  };