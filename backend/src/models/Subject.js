import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Subject name is required"],
      trim: true,
      maxlength: 100,
    },
    code: {
      type: String,
      trim: true,
      maxlength: 20,
      default: "",
    },
    instructor: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
    },
    color: {
      type: String,
      default: "#3B82F6",
    },
  },
  { timestamps: true }
);

subjectSchema.index({ userId: 1, name: 1 });

const Subject = mongoose.model("Subject", subjectSchema);

export default Subject;
