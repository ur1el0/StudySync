import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Note title is required"],
      trim: true,
      maxlength: 150,
    },
    content: {
      type: String,
      required: [true, "Note content is required"],
      trim: true,
      maxlength: 10000,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

noteSchema.index({ userId: 1, title: 1 });

const Note = mongoose.model("Note", noteSchema);

export default Note;
