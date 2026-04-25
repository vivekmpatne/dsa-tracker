/**
 * Phase Tracking Logic
 *
 * Phase 1: 348 sessions, 283 questions
 * Phase 2: 372 sessions, 299 questions
 *
 * Given cumulative completed sessions & questions, returns:
 *  - currentPhase
 *  - % completion (sessions & questions separately, and combined)
 *  - remaining (sessions & questions)
 *  - ETA (estimated completion date based on daily averages)
 */

const PHASES = {
  1: { sessions: 348, questions: 283 },
  2: { sessions: 372, questions: 299 },
};

// Combined totals (Phase 1 + Phase 2)
const TOTAL_SESSIONS = PHASES[1].sessions + PHASES[2].sessions; // 720
const TOTAL_QUESTIONS = PHASES[1].questions + PHASES[2].questions; // 582

/**
 * Determine which phase the user is currently in based on cumulative totals.
 * @param {number} totalSessions
 * @param {number} totalQuestions
 * @returns {number} 1 or 2
 */
const getCurrentPhase = (totalSessions, totalQuestions) => {
  // User is in Phase 2 if they've completed Phase 1's targets for BOTH
  if (totalSessions >= PHASES[1].sessions && totalQuestions >= PHASES[1].questions) {
    return 2;
  }
  return 1;
};

/**
 * Round to 2 decimal places
 */
const round2 = (n) => Math.round(n * 100) / 100;

/**
 * calculateETA
 * Estimates completion date for the current phase using daily averages.
 *
 * @param {number} remaining  - units left (sessions or questions)
 * @param {number} dailyAvg   - average units completed per day
 * @returns {string|null}     - ISO date string or null if avg is 0
 */
const calculateETA = (remaining, dailyAvg) => {
  if (dailyAvg <= 0 || remaining <= 0) return null;
  const daysNeeded = Math.ceil(remaining / dailyAvg);
  const eta = new Date();
  eta.setDate(eta.getDate() + daysNeeded);
  return eta.toISOString().split("T")[0]; // YYYY-MM-DD
};

/**
 * getPhaseStats
 * Core function that returns full phase tracking data.
 *
 * @param {number} totalSessions   - cumulative sessions completed by user
 * @param {number} totalQuestions  - cumulative questions completed by user
 * @param {number} activeDays      - number of days the user has logged progress
 * @returns {object}
 */
const getPhaseStats = (totalSessions, totalQuestions, activeDays = 1) => {
  const currentPhase = getCurrentPhase(totalSessions, totalQuestions);
  const phaseTarget = PHASES[currentPhase];

  // Sessions already counted in previous phases
  const prevPhaseSessions = currentPhase === 2 ? PHASES[1].sessions : 0;
  const prevPhaseQuestions = currentPhase === 2 ? PHASES[1].questions : 0;

  // Progress within current phase
  const sessionsInPhase = Math.max(0, totalSessions - prevPhaseSessions);
  const questionsInPhase = Math.max(0, totalQuestions - prevPhaseQuestions);

  // Remaining within current phase
  const remainingSessions = Math.max(0, phaseTarget.sessions - sessionsInPhase);
  const remainingQuestions = Math.max(0, phaseTarget.questions - questionsInPhase);

  // % completion within current phase
  const sessionsPct = round2((sessionsInPhase / phaseTarget.sessions) * 100);
  const questionsPct = round2((questionsInPhase / phaseTarget.questions) * 100);
  const overallPhasePct = round2((sessionsPct + questionsPct) / 2);

  // Overall program % (across both phases)
  const overallSessionsPct = round2((totalSessions / TOTAL_SESSIONS) * 100);
  const overallQuestionsPct = round2((totalQuestions / TOTAL_QUESTIONS) * 100);
  const overallProgramPct = round2((overallSessionsPct + overallQuestionsPct) / 2);

  // Daily averages (guard division by zero)
  const safeDays = Math.max(activeDays, 1);
  const avgSessionsPerDay = round2(totalSessions / safeDays);
  const avgQuestionsPerDay = round2(totalQuestions / safeDays);

  // ETAs
  const sessionETA = calculateETA(remainingSessions, avgSessionsPerDay);
  const questionETA = calculateETA(remainingQuestions, avgQuestionsPerDay);

  // Phase ETA = the later of the two (both must be done to finish the phase)
  let phaseETA = null;
  if (sessionETA && questionETA) {
    phaseETA = sessionETA > questionETA ? sessionETA : questionETA;
  } else {
    phaseETA = sessionETA || questionETA;
  }

  return {
    currentPhase,
    phaseTarget,
    progress: {
      sessionsInPhase,
      questionsInPhase,
    },
    remaining: {
      sessions: remainingSessions,
      questions: remainingQuestions,
    },
    completion: {
      phaseSessionsPct: Math.min(sessionsPct, 100),
      phaseQuestionsPct: Math.min(questionsPct, 100),
      overallPhasePct: Math.min(overallPhasePct, 100),
      overallProgramPct: Math.min(overallProgramPct, 100),
    },
    averages: {
      sessionsPerDay: avgSessionsPerDay,
      questionsPerDay: avgQuestionsPerDay,
      basedOnDays: safeDays,
    },
    eta: {
      sessionsETA: sessionETA,
      questionsETA: questionETA,
      phaseETA,
    },
    totals: {
      programSessions: TOTAL_SESSIONS,
      programQuestions: TOTAL_QUESTIONS,
    },
  };
};

module.exports = { getPhaseStats, getCurrentPhase, PHASES, TOTAL_SESSIONS, TOTAL_QUESTIONS };
