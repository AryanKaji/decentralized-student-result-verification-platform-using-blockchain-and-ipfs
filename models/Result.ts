import mongoose from "mongoose";

const ResultSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
      index: true,
    },

    version: {
      type: Number,
      required: true,
    },

    subjects: [
      {
        subject: String,
        marks: Number,
      },
    ],

    total: {
      type: Number,
      required: true,
    },

    percentage: {
      type: Number,
      required: true,
    },

    grade: {
      type: String,
      required: true,
    },

    pdfUrl: String,

    ipfsHash: String,
    pdfHash: String,
    txHash: String,

    generatedBy: String,
    contractAddress: String,

    isLatest: {
      type: Boolean,
      default: true,
    },

    reason: {
      type: String,
      default: "Initial Publication",
    },
  },
  { timestamps: true },
);

ResultSchema.index(
  { studentId: 1, version: 1 },
  { unique: true }
);

const Result = mongoose.models.Result || mongoose.model("Result", ResultSchema);

export default Result;
