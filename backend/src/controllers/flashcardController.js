import Flashcard from "../models/Flashcard.js";
import Note from "../models/Note.js";

const splitSentences = (content) => {
	return content
		.split(/[.!?\n]/)
		.map((line) => line.trim())
		.filter((line) => line.length >= 18);
};

export const generateFlashcardsFromNote = async (req, res) => {
	try {
		const { noteId } = req.body;

		if (!noteId) {
			return res.status(400).json({ message: "Note ID is required" });
		}

		const note = await Note.findOne({ _id: noteId, userId: req.user._id });
		if (!note) {
			return res.status(404).json({ message: "Note not found" });
		}

		const sentences = splitSentences(note.content).slice(0, 10);

		if (sentences.length === 0) {
			return res.status(400).json({ message: "Note content is too short for flashcard generation" });
		}

		await Flashcard.deleteMany({ userId: req.user._id, noteId: note._id });

		const generatedCards = await Flashcard.insertMany(
			sentences.map((sentence, index) => ({
				userId: req.user._id,
				noteId: note._id,
				question: `Card ${index + 1}: Explain this concept`,
				answer: sentence,
			}))
		);

		return res.status(201).json(generatedCards);
	} catch (error) {
		return res.status(500).json({ message: "Failed to generate flashcards" });
	}
};

export const getFlashcardsByNote = async (req, res) => {
	try {
		const note = await Note.findOne({ _id: req.params.noteId, userId: req.user._id });
		if (!note) {
			return res.status(404).json({ message: "Note not found" });
		}

		const flashcards = await Flashcard.find({ userId: req.user._id, noteId: req.params.noteId }).sort({ createdAt: -1 });

		return res.json(flashcards);
	} catch (error) {
		return res.status(500).json({ message: "Failed to fetch flashcards" });
	}
};

export const deleteFlashcardsByNote = async (req, res) => {
	try {
		const note = await Note.findOne({ _id: req.params.noteId, userId: req.user._id });
		if (!note) {
			return res.status(404).json({ message: "Note not found" });
		}

		await Flashcard.deleteMany({ userId: req.user._id, noteId: req.params.noteId });
		return res.json({ message: "Flashcards deleted successfully" });
	} catch (error) {
		return res.status(500).json({ message: "Failed to delete flashcards" });
	}
};
