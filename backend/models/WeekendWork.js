const mongoose = require("mongoose");

const WeekendWorkSchema = new mongoose.Schema(
  {
    date:         { type: String, required: true, unique: true },
    projectName:  { type: String, default: "" },
    webDevHours:  { type: Number, default: 0 },
    progressPct:  { type: Number, default: 0, min: 0, max: 100 },
    dsaRevision:  { type: Boolean, default: false },
    revisionTopics: { type: String, default: "" },
    notes:        { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WeekendWork", WeekendWorkSchema);
