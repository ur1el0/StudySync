import Note from "../models/Note.js";
import Subject from "../models/Subject.js";

const normalizeTags = (tags) => {
	if (!Array.isArray(tags)) return [];
	return tags
		.map((tag) => String(tag).trim())
		.filter((tag) => tag.length > 0)
		.slice(0, 30);
};

export const createNote = async (req, res) => {
	try {
		const { subjectId, title, content, tags } = req.body;

		if (!subjectId || !title?.trim() || !content?.trim()) {
			return res.status(400).json({ message: "Subject, title, and content are required" });
		}

		const subject = await Subject.findOne({ _id: subjectId, userId: req.user._id });
		if (!subject) {
			return res.status(404).json({ message: "Subject not found" });
		}

		const note = await Note.create({
			userId: req.user._id,
			subjectId,
			title: title.trim(),
			content: content.trim(),
			tags: normalizeTags(tags),
		});

		const populated = await note.populate("subjectId", "name code color");
		return res.status(201).json(populated);
	} catch (error) {
		return res.status(500).json({ message: "Failed to create note" });
	}
};

export const getNotes = async (req, res) => {
	try {
		const notes = await Note.find({ userId: req.user._id })
			.populate("subjectId", "name code color")
			.sort({ updatedAt: -1 });

		return res.json(notes);
	} catch (error) {
		return res.status(500).json({ message: "Failed to fetch notes" });
	}
};

export const updateNote = async (req, res) => {
	try {
		const note = await Note.findOne({ _id: req.params.id, userId: req.user._id });

		if (!note) {
			return res.status(404).json({ message: "Note not found" });
		}

		if (req.body.subjectId !== undefined) {
			const subject = await Subject.findOne({ _id: req.body.subjectId, userId: req.user._id });
			if (!subject) {
				return res.status(404).json({ message: "Subject not found" });
			}
			note.subjectId = req.body.subjectId;
		}

		if (req.body.title !== undefined) {
			if (!req.body.title?.trim()) {
				return res.status(400).json({ message: "Note title cannot be empty" });
			}
			note.title = req.body.title.trim();
		}

		if (req.body.content !== undefined) {
			if (!req.body.content?.trim()) {
				return res.status(400).json({ message: "Note content cannot be empty" });
			}
			note.content = req.body.content.trim();
		}

		if (req.body.tags !== undefined) {
			note.tags = normalizeTags(req.body.tags);
		}

		const updated = await note.save();
		const populated = await updated.populate("subjectId", "name code color");
		return res.json(populated);
	} catch (error) {
		return res.status(500).json({ message: "Failed to update note" });
	}
};

export const deleteNote = async (req, res) => {
	try {
		const note = await Note.findOne({ _id: req.params.id, userId: req.user._id });

		if (!note) {
			return res.status(404).json({ message: "Note not found" });
		}

		await note.deleteOne();
		return res.json({ message: "Note deleted successfully" });
	} catch (error) {
		return res.status(500).json({ message: "Failed to delete note" });
	}
};
