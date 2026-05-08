import Flashcard from "../models/Flashcard.js";
import Note from "../models/Note.js";
import { generateFlashcards } from "../utils/aiService.js";

const MAX_QUESTION_LENGTH = 300;
const MAX_ANSWER_LENGTH = 1200;

const normalizeText = (value, maxLength) => {
	if (typeof value !== "string") return "";
	const clean = value.replace(/\s+/g, " ").trim();
	if (!clean) return "";
	if (clean.length <= maxLength) return clean;
	return `${clean.slice(0, maxLength - 3).trim()}...`;
};

const sanitizeCards = (cards) => {
	if (!Array.isArray(cards)) return [];

	return cards
		.map((card) => ({
			question: normalizeText(card?.question, MAX_QUESTION_LENGTH),
			answer: normalizeText(card?.answer, MAX_ANSWER_LENGTH),
		}))
		.filter((card) => card.question && card.answer)
		.slice(0, 10);
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

		if (!note.content || note.content.length < 20) {
			return res.status(400).json({ message: "Note content is too short for AI generation" });
		}

		// Use AI service to generate cards
		const aiCards = await generateFlashcards(note.content);
		const preparedCards = sanitizeCards(aiCards);

		if (!preparedCards.length) {
			return res.status(422).json({ message: "Could not generate valid flashcards from this note" });
		}

		await Flashcard.deleteMany({ userId: req.user._id, noteId: note._id });

		const generatedCards = await Flashcard.insertMany(
			preparedCards.map((card) => ({
				userId: req.user._id,
				noteId: note._id,
				question: card.question,
				answer: card.answer,
			}))
		);

		return res.status(201).json(generatedCards);
	} catch (error) {
		console.error("Flashcard Gen Error:", error?.message);
		
		// Handle rate limiting
		if (error?.message?.includes("rate limiting")) {
			return res.status(429).json({ message: error.message });
		}
		
		// Handle validation errors
		if (error?.name === "ValidationError") {
			return res.status(422).json({ message: "Generated flashcards failed validation. Please try a shorter note." });
		}
		
		return res.status(500).json({ message: error?.message || "Failed to generate flashcards" });
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
