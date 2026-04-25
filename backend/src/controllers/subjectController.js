import Subject from "../models/Subject.js";

export const createSubject = async (req, res) => {
	try {
		const { name, code, instructor, color } = req.body;

		if (!name?.trim()) {
			return res.status(400).json({ message: "Subject name is required" });
		}

		const subject = await Subject.create({
			userId: req.user._id,
			name: name.trim(),
			code: code?.trim() || "",
			instructor: instructor?.trim() || "",
			color: color || "#3B82F6",
		});

		return res.status(201).json(subject);
	} catch (error) {
		return res.status(500).json({ message: "Failed to create subject" });
	}
};

export const getSubjects = async (req, res) => {
	try {
		const subjects = await Subject.find({ userId: req.user._id }).sort({ createdAt: -1 });
		return res.json(subjects);
	} catch (error) {
		return res.status(500).json({ message: "Failed to fetch subjects" });
	}
};

export const updateSubject = async (req, res) => {
	try {
		const subject = await Subject.findOne({ _id: req.params.id, userId: req.user._id });

		if (!subject) {
			return res.status(404).json({ message: "Subject not found" });
		}

		if (req.body.name !== undefined) {
			if (!req.body.name?.trim()) {
				return res.status(400).json({ message: "Subject name cannot be empty" });
			}
			subject.name = req.body.name.trim();
		}

		if (req.body.code !== undefined) subject.code = req.body.code?.trim() || "";
		if (req.body.instructor !== undefined) subject.instructor = req.body.instructor?.trim() || "";
		if (req.body.color !== undefined) subject.color = req.body.color || "#3B82F6";

		const updated = await subject.save();
		return res.json(updated);
	} catch (error) {
		return res.status(500).json({ message: "Failed to update subject" });
	}
};

export const deleteSubject = async (req, res) => {
	try {
		const subject = await Subject.findOne({ _id: req.params.id, userId: req.user._id });

		if (!subject) {
			return res.status(404).json({ message: "Subject not found" });
		}

		await subject.deleteOne();
		return res.json({ message: "Subject deleted successfully" });
	} catch (error) {
		return res.status(500).json({ message: "Failed to delete subject" });
	}
};
