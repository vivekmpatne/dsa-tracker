import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({ baseURL: BASE });

// ── Progress ──────────────────────────────────────────────────────────────────
export const logProgress    = (data)   => api.post("/progress", data);
export const fetchProgress  = ()       => api.get("/progress");
export const fetchToday     = ()       => api.get("/progress/today");
export const fetchSummary   = ()       => api.get("/progress/summary");

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const fetchDashboard = ()       => api.get("/stats/dashboard");

// ── Weekend ───────────────────────────────────────────────────────────────────
export const logWeekend     = (data)   => api.post("/weekend", data);
export const fetchWeekends  = ()       => api.get("/weekend");

// ── Contest ───────────────────────────────────────────────────────────────────
export const logContest     = (data)   => api.post("/contest", data);
export const fetchContests  = ()       => api.get("/contest");
export const fetchContestStats = ()    => api.get("/contest/stats");

export default api;
