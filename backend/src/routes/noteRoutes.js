import express from "express";
import { createNote, deleteNote, getNotes, updateNote } from "../controllers/noteController.js";
import { protect } from "../middleware/authMiddleware.js";
import validateObjectId from "../middleware/validateObjectId.js";

const router = express.Router();

router.route("/").post(protect, createNote).get(protect, getNotes);

router
	.route("/:id")
	.put(protect, validateObjectId, updateNote)
	.delete(protect, validateObjectId, deleteNote);

export default router;
