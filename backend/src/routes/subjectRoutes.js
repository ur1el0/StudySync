import express from "express";
import {
	createSubject,
	deleteSubject,
	getSubjects,
	updateSubject,
} from "../controllers/subjectController.js";
import { protect } from "../middleware/authMiddleware.js";
import validateObjectId from "../middleware/validateObjectId.js";

const router = express.Router();

router.route("/").post(protect, createSubject).get(protect, getSubjects);

router
	.route("/:id")
	.put(protect, validateObjectId, updateSubject)
	.delete(protect, validateObjectId, deleteSubject);

export default router;
