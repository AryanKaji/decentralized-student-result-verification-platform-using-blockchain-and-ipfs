import mongoose from "mongoose";

const MarkSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
      index: true,
    },

    subject: {
      type: String,
      required: true,
      index: true,
    },

    teacher: {
      type: String,
      required: true,
      index: true,
    },

    marks: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
  },
  { timestamps: true },
);

// Prevent duplicate marks
MarkSchema.index({ teacher: 1, studentId: 1, subject: 1 }, { unique: true });

const Mark = mongoose.models.Mark || mongoose.model("Mark", MarkSchema);

export default Mark;
