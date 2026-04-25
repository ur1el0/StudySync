import Subject from "../models/Subject.js";
import Task from "../models/Task.js";

const isValidPriority = (value) => ["Low", "Medium", "High"].includes(value);
const isValidStatus = (value) => ["Pending", "In Progress", "Completed"].includes(value);

export const createTask = async (req, res) => {
	try {
		const { subjectId, title, description, dueDate, priority, status } = req.body;

		if (!subjectId || !title?.trim() || !dueDate) {
			return res.status(400).json({ message: "Subject, title, and due date are required" });
		}

		const subject = await Subject.findOne({ _id: subjectId, userId: req.user._id });
		if (!subject) {
			return res.status(404).json({ message: "Subject not found" });
		}

		if (priority && !isValidPriority(priority)) {
			return res.status(400).json({ message: "Invalid priority value" });
		}

		if (status && !isValidStatus(status)) {
			return res.status(400).json({ message: "Invalid status value" });
		}

		const task = await Task.create({
			userId: req.user._id,
			subjectId,
			title: title.trim(),
			description: description?.trim() || "",
			dueDate,
			priority: priority || "Medium",
			status: status || "Pending",
		});

		const populated = await task.populate("subjectId", "name code color");
		return res.status(201).json(populated);
	} catch (error) {
		return res.status(500).json({ message: "Failed to create task" });
	}
};

export const getTasks = async (req, res) => {
	try {
		const tasks = await Task.find({ userId: req.user._id })
			.populate("subjectId", "name code color")
			.sort({ dueDate: 1, createdAt: -1 });

		return res.json(tasks);
	} catch (error) {
		return res.status(500).json({ message: "Failed to fetch tasks" });
	}
};

export const updateTask = async (req, res) => {
	try {
		const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });

		if (!task) {
			return res.status(404).json({ message: "Task not found" });
		}

		if (req.body.subjectId !== undefined) {
			const subject = await Subject.findOne({ _id: req.body.subjectId, userId: req.user._id });
			if (!subject) {
				return res.status(404).json({ message: "Subject not found" });
			}
			task.subjectId = req.body.subjectId;
		}

		if (req.body.title !== undefined) {
			if (!req.body.title?.trim()) {
				return res.status(400).json({ message: "Task title cannot be empty" });
			}
			task.title = req.body.title.trim();
		}

		if (req.body.description !== undefined) {
			task.description = req.body.description?.trim() || "";
		}

		if (req.body.dueDate !== undefined) {
			task.dueDate = req.body.dueDate;
		}

		if (req.body.priority !== undefined) {
			if (!isValidPriority(req.body.priority)) {
				return res.status(400).json({ message: "Invalid priority value" });
			}
			task.priority = req.body.priority;
		}

		if (req.body.status !== undefined) {
			if (!isValidStatus(req.body.status)) {
				return res.status(400).json({ message: "Invalid status value" });
			}
			task.status = req.body.status;
		}

		const updatedTask = await task.save();
		const populated = await updatedTask.populate("subjectId", "name code color");
		return res.json(populated);
	} catch (error) {
		return res.status(500).json({ message: "Failed to update task" });
	}
};

export const deleteTask = async (req, res) => {
	try {
		const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });

		if (!task) {
			return res.status(404).json({ message: "Task not found" });
		}

		await task.deleteOne();
		return res.json({ message: "Task deleted successfully" });
	} catch (error) {
		return res.status(500).json({ message: "Failed to delete task" });
	}
};
