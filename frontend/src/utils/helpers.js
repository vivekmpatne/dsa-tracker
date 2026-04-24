// LocalStorage backup — syncs key data so app works offline too

const KEY = "dsa_tracker_backup";

export function saveBackup(data) {
  try {
    const existing = getBackup();
    localStorage.setItem(KEY, JSON.stringify({ ...existing, ...data, updatedAt: new Date().toISOString() }));
  } catch (e) {}
}

export function getBackup() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch (e) {
    return {};
  }
}

export function clearBackup() {
  localStorage.removeItem(KEY);
}

// Calculate daily target locally (mirror of backend logic)
export function calculateDailyTarget(dayType = "normal") {
  const targets = {
    normal:  { sessionsTarget: 2, questionsTarget: 2 },
    exam:    { sessionsTarget: 1, questionsTarget: 1 },
    holiday: { sessionsTarget: 4, questionsTarget: 4 },
  };
  return targets[dayType] || targets.normal;
}

// ETA calculation
export function calculateETA(remaining, perDay) {
  if (!perDay || remaining <= 0) return "—";
  const days = Math.ceil(remaining / perDay);
  const d = new Date();
  d.setDate(d.getDate() + days);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[d.getMonth()]} ${d.getFullYear()}`;
}

// Today string
export function today() {
  return new Date().toISOString().split("T")[0];
}

// Phase from total sessions
export function getPhase(totalSessions) {
  return totalSessions < 348 ? 1 : 2;
}
