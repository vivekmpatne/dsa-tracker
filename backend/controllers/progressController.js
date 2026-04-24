const DailyProgress = require("../models/DailyProgress");
const { calculateDailyTarget, getCurrentPhase } = require("../utils/calculateTarget");

// POST /api/progress  — create or update today's entry
const upsertProgress = async (req, res) => {
  try {
    const {
      date, dayType, sessionsCompleted, questionsCompleted,
      topic, notesMade, revised, notes,
    } = req.body;

    if (!date) return res.status(400).json({ error: "date is required" });

    const { sessionsTarget, questionsTarget } = calculateDailyTarget(dayType);

    // Calculate running totals to determine phase
    const allPrev = await DailyProgress.find({ date: { $lt: date } });
    const totalSoFar = allPrev.reduce((s, d) => s + d.sessionsCompleted, 0);
    const phase = getCurrentPhase(totalSoFar);

    const entry = await DailyProgress.findOneAndUpdate(
      { date },
      {
        dayType, sessionsCompleted, questionsCompleted,
        topic, notesMade, revised, notes,
        targetSessions: sessionsTarget,
        targetQuestions: questionsTarget,
        phase,
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/progress  — all entries
const getAllProgress = async (req, res) => {
  try {
    const { limit = 30, page = 1 } = req.query;
    const entries = await DailyProgress.find()
      .sort({ date: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/progress/today
const getTodayProgress = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const entry = await DailyProgress.findOne({ date: today });
    res.json(entry || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/progress/summary  — aggregate totals
const getSummary = async (req, res) => {
  try {
    const all = await DailyProgress.find();

    const totalSessions   = all.reduce((s, d) => s + d.sessionsCompleted, 0);
    const totalQuestions  = all.reduce((s, d) => s + d.questionsCompleted, 0);
    const daysLogged      = all.length;
    const phase1Sessions  = all.filter(d => d.phase === 1).reduce((s, d) => s + d.sessionsCompleted, 0);
    const phase1Questions = all.filter(d => d.phase === 1).reduce((s, d) => s + d.questionsCompleted, 0);
    const phase2Sessions  = all.filter(d => d.phase === 2).reduce((s, d) => s + d.sessionsCompleted, 0);
    const phase2Questions = all.filter(d => d.phase === 2).reduce((s, d) => s + d.questionsCompleted, 0);

    res.json({
      totalSessions, totalQuestions, daysLogged,
      phase1: { sessions: phase1Sessions, questions: phase1Questions },
      phase2: { sessions: phase2Sessions, questions: phase2Questions },
      currentPhase: getCurrentPhase(totalSessions),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { upsertProgress, getAllProgress, getTodayProgress, getSummary };
