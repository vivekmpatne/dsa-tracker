/**
 * Smart Target Logic
 * Determines daily session/question targets based on dayType,
 * and evaluates whether actual progress meets those targets.
 */

/**
 * Target ranges per dayType
 * Each range has a min and max (for questions/sessions) to allow flexibility.
 */
const TARGET_MAP = {
  normal: {
    sessions: { min: 2, max: 2 },
    questions: { min: 2, max: 3 },
  },
  exam: {
    sessions: { min: 1, max: 1 },
    questions: { min: 1, max: 1 },
  },
  holiday: {
    sessions: { min: 3, max: 4 },
    questions: { min: 4, max: 5 },
  },
};

/**
 * getTargetForDay
 * @param {string} dayType - "normal" | "exam" | "holiday"
 * @returns {{ sessions: { min, max }, questions: { min, max } }}
 */
const getTargetForDay = (dayType) => {
  const target = TARGET_MAP[dayType];
  if (!target) {
    throw new Error(`Invalid dayType: "${dayType}". Must be normal, exam, or holiday.`);
  }
  return target;
};

/**
 * evaluateProgress
 * Compares actual sessions/questions against the target for a given dayType.
 *
 * @param {string} dayType
 * @param {number} actualSessions
 * @param {number} actualQuestions
 * @returns {{
 *   dayType: string,
 *   target: { sessions: {min, max}, questions: {min, max} },
 *   actual: { sessions: number, questions: number },
 *   status: {
 *     sessions: "completed" | "not_completed",
 *     questions: "completed" | "not_completed",
 *     overall: "completed" | "not_completed"
 *   }
 * }}
 */
const evaluateProgress = (dayType, actualSessions, actualQuestions) => {
  const target = getTargetForDay(dayType);

  const sessionsCompleted = actualSessions >= target.sessions.min;
  const questionsCompleted = actualQuestions >= target.questions.min;

  return {
    dayType,
    target,
    actual: {
      sessions: actualSessions,
      questions: actualQuestions,
    },
    status: {
      sessions: sessionsCompleted ? "completed" : "not_completed",
      questions: questionsCompleted ? "completed" : "not_completed",
      overall: sessionsCompleted && questionsCompleted ? "completed" : "not_completed",
    },
  };
};

module.exports = { getTargetForDay, evaluateProgress, TARGET_MAP };
