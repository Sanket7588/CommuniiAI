const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());

// Ensure the upload folder exists
const uploadDir = path.join(__dirname, "upload");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Set up storage for Multer to save inside `upload/`
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // Save inside "upload/" folder
    },
    filename: (req, file, cb) => {
        cb(null, "input"+ path.extname(file.originalname)); // Unique filename
    }
});

const upload = multer({ storage: storage });

// API endpoint to handle file upload
app.post("/upload", upload.single("video"), (req, res) => {
    res.send(`File saved in /upload/ as: ${req.file.filename}`);
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
