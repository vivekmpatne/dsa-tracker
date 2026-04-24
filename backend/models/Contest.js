const mongoose = require("mongoose");

const ContestSchema = new mongoose.Schema(
  {
    date:           { type: String, required: true },
    platform:       { type: String, enum: ["LC", "CF", "CC"], required: true },
    contestName:    { type: String, default: "" },
    participated:   { type: Boolean, default: false },
    problemsSolved: { type: Number, default: 0 },
    totalProblems:  { type: Number, default: 0 },
    upsolved:       { type: Boolean, default: false },
    upsolvedCount:  { type: Number, default: 0 },
    ratingBefore:   { type: Number, default: 0 },
    ratingAfter:    { type: Number, default: 0 },
    notes:          { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Contest", ContestSchema);
