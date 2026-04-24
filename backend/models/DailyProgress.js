const mongoose = require("mongoose");

const DailyProgressSchema = new mongoose.Schema(
  {
    date: {
      type: String, // "YYYY-MM-DD"
      required: true,
      unique: true,
    },
    dayType: {
      type: String,
      enum: ["normal", "exam", "holiday"],
      default: "normal",
    },
    // Targets (auto-calculated)
    targetSessions:  { type: Number, default: 2 },
    targetQuestions: { type: Number, default: 2 },

    // Actuals (user fills)
    sessionsCompleted:  { type: Number, default: 0 },
    questionsCompleted: { type: Number, default: 0 },

    topic:      { type: String, default: "" },
    notesMade:  { type: Boolean, default: false },
    revised:    { type: Boolean, default: false },
    notes:      { type: String, default: "" },

    // Which phase this day belongs to
    phase: { type: Number, enum: [1, 2], default: 1 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DailyProgress", DailyProgressSchema);
