/**
 * calculateDailyTarget(dayType)
 * Returns { sessionsTarget, questionsTarget }
 */
function calculateDailyTarget(dayType = "normal") {
  const targets = {
    normal:  { sessionsTarget: 2, questionsTarget: 2 },
    exam:    { sessionsTarget: 1, questionsTarget: 1 },
    holiday: { sessionsTarget: 4, questionsTarget: 4 },
  };
  return targets[dayType] || targets.normal;
}

/**
 * calculateETA(remaining, perDay)
 * Returns estimated completion date string
 */
function calculateETA(remaining, perDay) {
  if (!perDay || perDay <= 0 || remaining <= 0) return "—";
  const days = Math.ceil(remaining / perDay);
  const d = new Date();
  d.setDate(d.getDate() + days);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * getCurrentPhase(totalSessionsDone)
 */
function getCurrentPhase(totalSessionsDone) {
  return totalSessionsDone < 348 ? 1 : 2;
}

module.exports = { calculateDailyTarget, calculateETA, getCurrentPhase };
