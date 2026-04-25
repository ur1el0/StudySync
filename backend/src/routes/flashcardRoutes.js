import express from "express";
import {
	deleteFlashcardsByNote,
	generateFlashcardsFromNote,
	getFlashcardsByNote,
} from "../controllers/flashcardController.js";
import { protect } from "../middleware/authMiddleware.js";
import validateObjectId from "../middleware/validateObjectId.js";

const router = express.Router();

router.post("/generate", protect, generateFlashcardsFromNote);
router.get("/note/:noteId", protect, getFlashcardsByNote);
router.delete("/note/:noteId", protect, validateObjectId, deleteFlashcardsByNote);

export default router;
