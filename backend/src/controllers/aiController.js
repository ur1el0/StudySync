import multer from "multer";
import { extractTextFromFile } from "../utils/aiService.js";

const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
}).single("file");

export const uploadFile = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ message: "File too large. Maximum supported size is 10MB." });
      }
      return res.status(400).json({ message: err.message || "File upload failed" });
    }

    if (!req.file) return res.status(400).json({ message: "No file provided" });

    try {
      const extractedText = await extractTextFromFile(req.file.buffer, req.file.mimetype);
      if (!extractedText) {
        return res.status(422).json({ message: "Uploaded file contains no extractable text" });
      }

      res.json({ text: extractedText });
    } catch (error) {
      console.error("Upload process error:", error);
      const message = error?.message || "Failed to process file";
      const isConfigIssue = message.toLowerCase().includes("not configured");
      res.status(isConfigIssue ? 400 : 500).json({ message });
    }
  });
};
