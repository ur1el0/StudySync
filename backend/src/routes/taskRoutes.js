import express from "express";
import { createTask, deleteTask, getTasks, updateTask } from "../controllers/taskController.js";
import { protect } from "../middleware/authMiddleware.js";
import validateObjectId from "../middleware/validateObjectId.js";

const router = express.Router();

router.route("/").post(protect, createTask).get(protect, getTasks);

router
	.route("/:id")
	.put(protect, validateObjectId, updateTask)
	.delete(protect, validateObjectId, deleteTask);

export default router;
