const mongoose = require("mongoose");

const dailyProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: {
      type: Date,
      default: () => {
        // Normalize to start of day (UTC) so one entry per day is enforceable
        const d = new Date();
        d.setUTCHours(0, 0, 0, 0);
        return d;
      },
    },
    sessions: {
      type: Number,
      required: [true, "Sessions count is required"],
      min: [0, "Sessions cannot be negative"],
      default: 0,
    },
    questions: {
      type: Number,
      required: [true, "Questions count is required"],
      min: [0, "Questions cannot be negative"],
      default: 0,
    },
    topic: {
      type: String,
      trim: true,
      maxlength: [100, "Topic cannot exceed 100 characters"],
      default: "",
    },
    notesDone: {
      type: Boolean,
      default: false,
    },
    revisionDone: {
      type: Boolean,
      default: false,
    },
    dayType: {
      type: String,
      enum: {
        values: ["normal", "exam", "holiday"],
        message: "dayType must be one of: normal, exam, holiday",
      },
      required: [true, "dayType is required"],
      default: "normal",
    },
  },
  { timestamps: true }
);

// Compound index: one entry per user per day
dailyProgressSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("DailyProgress", dailyProgressSchema);
