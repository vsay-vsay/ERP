const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadFolder = path.join(__dirname, "../uploads");

// Ensure the uploads folder exists
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadFolder),
  filename: (req, file, cb) => {
    cb(null, `upload-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const isExcel = file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  if (isExcel) {
    cb(null, true);
  } else {
    cb(new Error("Only Excel (.xlsx) files are allowed"), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
