const WeekendWork = require("../models/WeekendWork");

const upsertWeekend = async (req, res) => {
  try {
    const { date, projectName, webDevHours, progressPct, dsaRevision, revisionTopics, notes } = req.body;
    if (!date) return res.status(400).json({ error: "date is required" });

    const entry = await WeekendWork.findOneAndUpdate(
      { date },
      { projectName, webDevHours, progressPct, dsaRevision, revisionTopics, notes },
      { new: true, upsert: true, runValidators: true }
    );
    res.status(200).json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAllWeekend = async (req, res) => {
  try {
    const entries = await WeekendWork.find().sort({ date: -1 }).limit(20);
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { upsertWeekend, getAllWeekend };
