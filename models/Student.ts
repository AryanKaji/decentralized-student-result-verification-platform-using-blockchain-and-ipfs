import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    class: {
      type: String,
      required: true,
    },

    roll: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true },
);

// Fast lookup by ID
StudentSchema.index({ studentId: 1 }, { unique: true });

// Prevent duplicate roll in same class
StudentSchema.index({ class: 1, roll: 1 }, { unique: true });

// Faster class filtering
StudentSchema.index({ class: 1 });

const Student =
  mongoose.models.Student || mongoose.model("Student", StudentSchema);

export default Student;
