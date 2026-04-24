const express = require("express");
const router = express.Router();
const DailyProgress = require("../models/DailyProgress");
const Contest = require("../models/Contest");
const WeekendWork = require("../models/WeekendWork");
const { calculateETA, getCurrentPhase } = require("../utils/calculateTarget");

// GET /api/stats/dashboard
router.get("/dashboard", async (req, res) => {
  try {
    const allProgress = await DailyProgress.find().sort({ date: 1 });
    const totalSessions   = allProgress.reduce((s, d) => s + d.sessionsCompleted, 0);
    const totalQuestions  = allProgress.reduce((s, d) => s + d.questionsCompleted, 0);

    // Phase splits
    const p1Sessions  = Math.min(totalSessions, 348);
    const p1Questions = Math.min(totalQuestions, 283);
    const p2Sessions  = Math.max(0, totalSessions - 348);
    const p2Questions = Math.max(0, totalQuestions - 283);

    // Weekly stats (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const weekDate = sevenDaysAgo.toISOString().split("T")[0];
    const weekEntries = allProgress.filter(d => d.date >= weekDate);
    const weeklySessions   = weekEntries.reduce((s, d) => s + d.sessionsCompleted, 0);
    const weeklyQuestions  = weekEntries.reduce((s, d) => s + d.questionsCompleted, 0);
    const weeklyDaysLogged = weekEntries.length;

    // Average per day (based on all logged days)
    const daysLogged = allProgress.length;
    const avgSessions  = daysLogged > 0 ? (totalSessions / daysLogged).toFixed(1) : 2;
    const avgQuestions = daysLogged > 0 ? (totalQuestions / daysLogged).toFixed(1) : 2;

    // ETA
    const sessLeft = Math.max(720 - totalSessions, 0);
    const qLeft    = Math.max(582 - totalQuestions, 0);
    const p1SessLeft = Math.max(348 - p1Sessions, 0);
    const p1QLeft    = Math.max(283 - p1Questions, 0);

    // Contest stats
    const contests = await Contest.find().sort({ date: -1 }).limit(5);
    const contestStats = await Contest.aggregate([
      { $group: { _id: "$platform", count: { $sum: 1 }, latestRating: { $last: "$ratingAfter" } } }
    ]);

    // Last 7 entries for chart
    const chartData = allProgress.slice(-7).map(d => ({
      date: d.date,
      sessions: d.sessionsCompleted,
      questions: d.questionsCompleted,
      target: d.targetSessions,
    }));

    res.json({
      overview: {
        totalSessions, totalQuestions, daysLogged,
        currentPhase: getCurrentPhase(totalSessions),
        avgSessions: Number(avgSessions), avgQuestions: Number(avgQuestions),
      },
      phases: {
        phase1: {
          sessions: { done: p1Sessions, total: 348, pct: ((p1Sessions / 348) * 100).toFixed(1) },
          questions: { done: p1Questions, total: 283, pct: ((p1Questions / 283) * 100).toFixed(1) },
          eta: { sessions: calculateETA(p1SessLeft, Number(avgSessions)), questions: calculateETA(p1QLeft, Number(avgQuestions)) },
        },
        phase2: {
          sessions: { done: p2Sessions, total: 372, pct: ((p2Sessions / 372) * 100).toFixed(1) },
          questions: { done: p2Questions, total: 299, pct: ((p2Questions / 299) * 100).toFixed(1) },
        },
        overall: {
          sessions: { done: totalSessions, total: 720, pct: ((totalSessions / 720) * 100).toFixed(1) },
          questions: { done: totalQuestions, total: 582, pct: ((totalQuestions / 582) * 100).toFixed(1) },
          eta: { sessions: calculateETA(sessLeft, Number(avgSessions)), questions: calculateETA(qLeft, Number(avgQuestions)) },
        },
      },
      weekly: { sessions: weeklySessions, questions: weeklyQuestions, daysLogged: weeklyDaysLogged },
      chartData,
      contestStats,
      recentContests: contests,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
