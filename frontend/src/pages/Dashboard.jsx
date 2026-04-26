// frontend/src/pages/Dashboard.jsx
//
// ✅ No external UI libraries
// ✅ No missing component imports
// ✅ Uses useApi hook + api.js correctly
// ✅ Fetches dashboard stats on mount
// ✅ Add Progress form → POST /api/progress
// ✅ Refreshes stats after every successful submission

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useApi from "../hooks/useApi";
import { statsApi, progressApi } from "../services/api";

// ─── tiny inline styles (no library needed) ───────────────────────────────────
const styles = {
  page:        { maxWidth: 760, margin: "0 auto", padding: "24px 16px", fontFamily: "sans-serif" },
  heading:     { fontSize: 24, fontWeight: 700, marginBottom: 4 },
  sub:         { color: "#666", marginBottom: 24 },
  grid:        { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px,1fr))", gap: 12, marginBottom: 32 },
  card:        { background: "#f0f4ff", borderRadius: 8, padding: "16px 20px" },
  cardLabel:   { fontSize: 13, color: "#555", marginBottom: 4 },
  cardValue:   { fontSize: 28, fontWeight: 700, color: "#1a1a2e" },
  section:     { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 20, marginBottom: 24 },
  sectionHead: { fontSize: 16, fontWeight: 600, marginBottom: 16 },
  formRow:     { display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 12 },
  label:       { display: "flex", flexDirection: "column", gap: 4, fontSize: 13, color: "#444", flex: "1 1 140px" },
  input:       { padding: "8px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 14 },
  select:      { padding: "8px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 14, background: "#fff" },
  textarea:    { padding: "8px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 14, resize: "vertical" },
  btn:         { padding: "10px 20px", borderRadius: 6, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 14 },
  btnPrimary:  { background: "#4f46e5", color: "#fff" },
  btnSecondary:{ background: "#e2e8f0", color: "#333" },
  errorBox:    { background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 6, padding: "10px 14px", color: "#b91c1c", marginBottom: 16, fontSize: 14 },
  successBox:  { background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 6, padding: "10px 14px", color: "#15803d", marginBottom: 16, fontSize: 14 },
  spinner:     { textAlign: "center", padding: 40, color: "#666" },
  bar:         { height: 10, borderRadius: 6, background: "#e2e8f0", overflow: "hidden", marginTop: 4 },
  barFill:     (pct, color) => ({ height: "100%", width: `${Math.min(pct, 100)}%`, background: color || "#4f46e5", transition: "width 0.4s" }),
  navRow:      { display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" },
  navBtn:      { padding: "8px 16px", borderRadius: 6, border: "1px solid #4f46e5", cursor: "pointer", fontSize: 13, background: "#fff", color: "#4f46e5", fontWeight: 600 },
};

// ─── EMPTY form state ──────────────────────────────────────────────────────────
const EMPTY_FORM = {
  date: new Date().toISOString().slice(0, 10),  // "YYYY-MM-DD"
  sessions: "",
  questions: "",
  topic: "",
  notes: "",
  dayType: "normal",                             // normal | exam | holiday
};

// ─── StatCard helper component ─────────────────────────────────────────────────
function StatCard({ label, value, sub }) {
  return (
    <div style={styles.card}>
      <div style={styles.cardLabel}>{label}</div>
      <div style={styles.cardValue}>{value ?? "—"}</div>
      {sub && <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

// ─── ProgressBar helper ────────────────────────────────────────────────────────
function Bar({ label, value, max, color }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#555" }}>
        <span>{label}</span>
        <span>{value} / {max} ({pct}%)</span>
      </div>
      <div style={styles.bar}>
        <div style={styles.barFill(pct, color)} />
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();

  // ── API hooks ──
  const { data: stats, loading: statsLoading, error: statsError, execute: fetchStats } = useApi(statsApi.getDashboard);
  const { loading: submitting, execute: createProgress } = useApi(progressApi.create);

  // ── local form state ──
  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);

  // ── fetch stats on mount ──
  useEffect(() => {
    fetchStats();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── logout ──
  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  // ── form change ──
  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  // ── form submit ──
  async function handleSubmit(e) {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    // basic validation
    if (!form.sessions || !form.questions) {
      setFormError("Sessions and Questions are required.");
      return;
    }

    const payload = {
      ...form,
      sessions: Number(form.sessions),
      questions: Number(form.questions),
    };

    // 🔥 Prevent duplicate date entry
    const alreadyExists = (entries || []).some(
    (item) => item.date === payload.date
    );

    if (alreadyExists) {
    toast.error("Entry already exists for this date");
     return;
    }

    const result = await createProgress(payload);
    await fetchStats(); // new line added to refresh stats after submission


    if (result) {
      setFormSuccess("✅ Progress entry saved!");
      setForm(EMPTY_FORM);
      setShowForm(false);
      fetchStats(); // refresh dashboard numbers
    } else {
      setFormError("Failed to save. Please try again.");
    }
  }

  // ─── RENDER ───────────────────────────────────────────────────────────────

  return (
    <div style={styles.page}>
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
        <div>
          <div style={styles.heading}>⚡ DSA Grind Tracker</div>
          <div style={styles.sub}>720 sessions · 582 questions · Phase 1 → Offer</div>
        </div>
        <button style={{ ...styles.btn, ...styles.btnSecondary }} onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Quick nav */}
      <div style={styles.navRow}>
        <button style={styles.navBtn} onClick={() => navigate("/daily-log")}>Daily Log</button>
        <button style={styles.navBtn} onClick={() => navigate("/history")}>History</button>
      </div>

      {/* ── Stats section ── */}
      {statsLoading && <div style={styles.spinner}>Loading dashboard…</div>}

      {statsError && (
        <div style={styles.errorBox}>
          ⚠️ Could not load stats: {statsError}
          <button style={{ marginLeft: 12, ...styles.btn, ...styles.btnSecondary, padding: "4px 10px" }} onClick={fetchStats}>
            Retry
          </button>
        </div>
      )}

      {stats && (
        <>
          {/* Stat cards */}
          <div style={styles.grid}>
            <StatCard label="Total Sessions"   value={stats.totalSessions}   sub={`/ 720 goal`} />
            <StatCard label="Total Questions"  value={stats.totalQuestions}  sub={`/ 582 goal`} />
            <StatCard label="Current Streak"   value={stats.currentStreak}   sub="days" />
            <StatCard label="Today Sessions"   value={stats.todaySessions}   sub={`target: ${stats.dailyTarget?.sessionsTarget ?? "?"}`} />
            <StatCard label="Today Questions"  value={stats.todayQuestions}  sub={`target: ${stats.dailyTarget?.questionsTarget ?? "?"}`} />
            <StatCard label="Phase"            value={stats.phase ?? "1"}    sub={stats.phaseLabel} />
            <StatCard label="ETA"              value={stats.eta}             sub="est. completion" />
            <StatCard label="Avg / Day"        value={stats.avgSessionsPerDay != null ? stats.avgSessionsPerDay.toFixed(1) : "—"} sub="sessions" />
          </div>

          {/* Progress bars */}
          <div style={styles.section}>
            <div style={styles.sectionHead}>Progress to Goal</div>
            <Bar label="Sessions"  value={stats.totalSessions  ?? 0} max={720} color="#4f46e5" />
            <Bar label="Questions" value={stats.totalQuestions ?? 0} max={582} color="#10b981" />
          </div>
        </>
      )}

      {/* ── Add Progress form ── */}
      <div style={styles.section}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={styles.sectionHead}>Log Today's Progress</div>
          <button
            style={{ ...styles.btn, ...(showForm ? styles.btnSecondary : styles.btnPrimary) }}
            onClick={() => { setShowForm((v) => !v); setFormError(null); setFormSuccess(null); }}
          >
            {showForm ? "Cancel" : "+ Add Entry"}
          </button>
        </div>

        {formSuccess && <div style={styles.successBox}>{formSuccess}</div>}

        {showForm && (
          <form onSubmit={handleSubmit}>
            {formError && <div style={styles.errorBox}>{formError}</div>}

            <div style={styles.formRow}>
              {/* Date */}
              <label style={styles.label}>
                Date
                <input style={styles.input} type="date" name="date" value={form.date} onChange={handleChange} required />
              </label>

              {/* Day type */}
              <label style={styles.label}>
                Day Type
                <select style={styles.select} name="dayType" value={form.dayType} onChange={handleChange}>
                  <option value="normal">Normal</option>
                  <option value="exam">Exam</option>
                  <option value="holiday">Holiday</option>
                </select>
              </label>
            </div>

            <div style={styles.formRow}>
              {/* Sessions */}
              <label style={styles.label}>
                Sessions *
                <input
                  style={styles.input}
                  type="number"
                  name="sessions"
                  value={form.sessions}
                  onChange={handleChange}
                  min={0}
                  placeholder="e.g. 2"
                  required
                />
              </label>

              {/* Questions */}
              <label style={styles.label}>
                Questions *
                <input
                  style={styles.input}
                  type="number"
                  name="questions"
                  value={form.questions}
                  onChange={handleChange}
                  min={0}
                  placeholder="e.g. 4"
                  required
                />
              </label>

              {/* Topic */}
              <label style={styles.label}>
                Topic
                <input
                  style={styles.input}
                  type="text"
                  name="topic"
                  value={form.topic}
                  onChange={handleChange}
                  placeholder="e.g. Arrays, Trees"
                />
              </label>
            </div>

            {/* Notes */}
            <div style={styles.formRow}>
              <label style={{ ...styles.label, flex: "1 1 100%" }}>
                Notes (optional)
                <textarea
                  style={{ ...styles.textarea, minHeight: 72 }}
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="What did you study today?"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{ ...styles.btn, ...styles.btnPrimary, opacity: submitting ? 0.7 : 1 }}
            >
              {submitting ? "Saving…" : "Save Entry"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}