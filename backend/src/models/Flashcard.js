import mongoose from "mongoose";

const flashcardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    noteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Note",
      required: true,
      index: true,
    },
    question: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    answer: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1200,
    },
  },
  { timestamps: true }
);

flashcardSchema.index({ userId: 1, noteId: 1, createdAt: -1 });

const Flashcard = mongoose.model("Flashcard", flashcardSchema);

export default Flashcard;
