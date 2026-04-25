const DailyProgress = require("../models/DailyProgress");
const { getPhaseStats } = require("../utils/phaseLogic");
const { evaluateProgress, TARGET_MAP } = require("../utils/targetLogic");

/**
 * @desc    Get full dashboard stats for the logged-in user
 * @route   GET /api/stats/dashboard
 * @access  Private
 */
const getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch all entries for the user (lean for performance)
    const allEntries = await DailyProgress.find({ userId }).sort({ date: 1 }).lean();

    if (allEntries.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No progress logged yet.",
        data: {
          summary: { totalSessions: 0, totalQuestions: 0, totalDays: 0 },
          streaks: { current: 0, longest: 0 },
          phaseStats: getPhaseStats(0, 0, 0),
          dayTypeBreakdown: {},
          completionRate: { overall: 0, byDayType: {} },
          recentEntries: [],
        },
      });
    }

    // --- Aggregate totals ---
    let totalSessions = 0;
    let totalQuestions = 0;
    let notesDoneCount = 0;
    let revisionDoneCount = 0;

    const dayTypeBreakdown = { normal: 0, exam: 0, holiday: 0 };
    const completedByType = { normal: 0, exam: 0, holiday: 0 };
    const countByType = { normal: 0, exam: 0, holiday: 0 };

    allEntries.forEach((entry) => {
      totalSessions += entry.sessions;
      totalQuestions += entry.questions;
      if (entry.notesDone) notesDoneCount++;
      if (entry.revisionDone) revisionDoneCount++;

      dayTypeBreakdown[entry.dayType] = (dayTypeBreakdown[entry.dayType] || 0) + 1;
      countByType[entry.dayType]++;

      const ev = evaluateProgress(entry.dayType, entry.sessions, entry.questions);
      if (ev.status.overall === "completed") {
        completedByType[entry.dayType]++;
      }
    });

    const totalDays = allEntries.length;

    // --- Completion rates ---
    let totalCompleted = 0;
    allEntries.forEach((entry) => {
      const ev = evaluateProgress(entry.dayType, entry.sessions, entry.questions);
      if (ev.status.overall === "completed") totalCompleted++;
    });

    const overallCompletionRate = Math.round((totalCompleted / totalDays) * 100);

    const completionRateByType = {};
    ["normal", "exam", "holiday"].forEach((type) => {
      if (countByType[type] > 0) {
        completionRateByType[type] = Math.round((completedByType[type] / countByType[type]) * 100);
      }
    });

    // --- Streak calculation ---
    const { currentStreak, longestStreak } = calculateStreaks(allEntries);

    // --- Phase stats ---
    const phaseStats = getPhaseStats(totalSessions, totalQuestions, totalDays);

    // --- Recent entries (last 7) ---
    const recentEntries = allEntries
      .slice(-7)
      .reverse()
      .map((entry) => ({
        ...entry,
        evaluation: evaluateProgress(entry.dayType, entry.sessions, entry.questions),
      }));

    // --- Weekly averages (last 7 days) ---
    const last7 = allEntries.slice(-7);
    const weeklyAvgSessions =
      last7.length > 0
        ? Math.round((last7.reduce((s, e) => s + e.sessions, 0) / last7.length) * 10) / 10
        : 0;
    const weeklyAvgQuestions =
      last7.length > 0
        ? Math.round((last7.reduce((s, e) => s + e.questions, 0) / last7.length) * 10) / 10
        : 0;

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalSessions,
          totalQuestions,
          totalDays,
          notesDoneCount,
          revisionDoneCount,
          notesDonePct: Math.round((notesDoneCount / totalDays) * 100),
          revisionDonePct: Math.round((revisionDoneCount / totalDays) * 100),
        },
        streaks: {
          current: currentStreak,
          longest: longestStreak,
        },
        weeklyAverages: {
          sessions: weeklyAvgSessions,
          questions: weeklyAvgQuestions,
          basedOnDays: last7.length,
        },
        phaseStats,
        dayTypeBreakdown,
        completionRate: {
          overall: overallCompletionRate,
          byDayType: completionRateByType,
        },
        recentEntries,
      },
    });
  } catch (error) {
    console.error("getDashboard error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * calculateStreaks
 * Computes current and longest consecutive-day streaks from sorted entries.
 * A "completed" day counts toward the streak.
 *
 * @param {Array} entries - sorted ascending by date
 * @returns {{ currentStreak: number, longestStreak: number }}
 */
const calculateStreaks = (entries) => {
  if (!entries.length) return { currentStreak: 0, longestStreak: 0 };

  const ONE_DAY_MS = 86400000;
  let longestStreak = 1;
  let streak = 1;

  for (let i = 1; i < entries.length; i++) {
    const prev = new Date(entries[i - 1].date).getTime();
    const curr = new Date(entries[i].date).getTime();
    const diff = curr - prev;

    if (diff === ONE_DAY_MS) {
      streak++;
      if (streak > longestStreak) longestStreak = streak;
    } else if (diff > ONE_DAY_MS) {
      streak = 1;
    }
  }

  // Check if current streak reaches today or yesterday
  const lastEntryDate = new Date(entries[entries.length - 1].date).getTime();
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const diffFromToday = today.getTime() - lastEntryDate;
  const currentStreak = diffFromToday <= ONE_DAY_MS ? streak : 0;

  return { currentStreak, longestStreak };
};

module.exports = { getDashboard };
