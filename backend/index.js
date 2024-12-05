const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { google } = require("googleapis");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

// Google Drive setup
const auth = new google.auth.GoogleAuth({
  keyFile: "credentials.json",                            // path/to/your-google-credentials.json
  scopes: ["https://www.googleapis.com/auth/drive.file"],
});

const drive = google.drive({ version: "v3", auth });

// Endpoint to upload file
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file.path;
    console.log("Filepath",filePath)
    const fileMetadata = { name: req.file.originalname };
    const media = {
      mimeType: req.file.mimetype,
      body: fs.createReadStream(filePath),
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id",
    });
    console.log("Google Drive Response:", response.data);            

   // Share with your personal account
   const permission = {
    type: "user",
    role: "reader",
    emailAddress: "your-email@gmail.com", // Replace with your email
  };
  await drive.permissions.create({
    fileId: response.data.id,
    requestBody: permission,
  });


    // Delete the local file after upload
    fs.unlinkSync(filePath);

    res.status(200).send({ fileId: response.data.id });
  } catch (error) {
    console.error(error);
    res.status(500).send("File upload failed.");
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
