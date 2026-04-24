import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchDashboard } from "../utils/api";
import { getBackup, calculateETA } from "../utils/helpers";
import ProgressBar from "../components/ProgressBar";
import PhaseCard from "../components/PhaseCard";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboard()
      .then(r => setData(r.data))
      .catch(() => {
        // Fallback to localStorage backup
        const backup = getBackup();
        if (backup.totalSessions !== undefined) {
          setData(buildFromBackup(backup));
        } else {
          setError("Cannot reach server. Log some data first.");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color: "#475569", textAlign: "center", padding: 40 }}>Loading dashboard...</div>;
  if (error || !data) return (
    <div>
      <div className="alert alert-warn">{error || "No data yet."}</div>
      <p style={{ color: "#64748b", fontSize: 13 }}>
        <Link to="/daily" style={{ color: "#60a5fa" }}>Log your first day →</Link>
      </p>
    </div>
  );

  const { overview, phases, weekly, chartData } = data;
  const phase = overview?.currentPhase || 1;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Dashboard</h1>
        <span className={`badge ${phase === 1 ? "badge-blue" : "badge-purple"}`}>Phase {phase}</span>
      </div>

      {/* Quick stats */}
      <div className="grid-4" style={{ marginBottom: 14 }}>
        <div className="stat-box">
          <div className="stat-label">SESSIONS</div>
          <div className="stat-value" style={{ color: "#3b82f6" }}>{overview.totalSessions}</div>
          <div style={{ fontSize: 10, color: "#475569" }}>of 720</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">SHEET QS</div>
          <div className="stat-value" style={{ color: "#a855f7" }}>{overview.totalQuestions}</div>
          <div style={{ fontSize: 10, color: "#475569" }}>of 582</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">DAYS LOGGED</div>
          <div className="stat-value" style={{ color: "#4ade80" }}>{overview.daysLogged}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">AVG/DAY</div>
          <div className="stat-value" style={{ color: "#f97316" }}>{overview.avgSessions}s</div>
          <div style={{ fontSize: 10, color: "#475569" }}>{overview.avgQuestions}q</div>
        </div>
      </div>

      {/* Overall progress */}
      <div className="card">
        <div className="card-title">OVERALL PROGRESS</div>
        <div style={{ marginBottom: 14 }}>
          <ProgressBar
            label="🎥 Sessions"
            pct={Number(phases.overall.sessions.pct)}
            color="#3b82f6"
            height={10}
            left={phases.overall.sessions.total - phases.overall.sessions.done}
            eta={phases.overall.eta.sessions}
          />
        </div>
        <ProgressBar
          label="💻 Sheet Questions"
          pct={Number(phases.overall.questions.pct)}
          color="#a855f7"
          height={10}
          left={phases.overall.questions.total - phases.overall.questions.done}
          eta={phases.overall.eta.questions}
        />
      </div>

      {/* Phase cards */}
      <PhaseCard
        phase={1}
        color="#3b82f6"
        status={phase === 1 ? "active" : "done"}
        sessData={{
          done: phases.phase1.sessions.done,
          total: 348,
          pct: Number(phases.phase1.sessions.pct),
        }}
        qData={{
          done: phases.phase1.questions.done,
          total: 283,
          pct: Number(phases.phase1.questions.pct),
        }}
        eta={phases.phase1.eta}
      />

      <PhaseCard
        phase={2}
        color="#a855f7"
        status={phase === 2 ? "active" : phase > 2 ? "done" : "locked"}
        sessData={{
          done: phases.phase2.sessions.done,
          total: 372,
          pct: Number(phases.phase2.sessions.pct),
        }}
        qData={{
          done: phases.phase2.questions.done,
          total: 299,
          pct: Number(phases.phase2.questions.pct),
        }}
      />

      {/* Weekly stats */}
      <div className="card">
        <div className="card-title">THIS WEEK</div>
        <div className="grid-3">
          <div className="stat-box">
            <div className="stat-label">SESSIONS</div>
            <div className="stat-value" style={{ color: "#3b82f6" }}>{weekly.sessions}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">QUESTIONS</div>
            <div className="stat-value" style={{ color: "#a855f7" }}>{weekly.questions}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">DAYS ACTIVE</div>
            <div className="stat-value" style={{ color: "#4ade80" }}>{weekly.daysLogged} / 5</div>
          </div>
        </div>
      </div>

      {/* Chart */}
      {chartData && chartData.length > 0 && (
        <div className="card">
          <div className="card-title">LAST 7 DAYS — SESSIONS (target vs actual)</div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#475569" }} tickFormatter={v => v.slice(5)} />
              <YAxis tick={{ fontSize: 9, fill: "#475569" }} />
              <Tooltip
                contentStyle={{ background: "#0d0d1f", border: "1px solid #1e293b", borderRadius: 8, fontSize: 11 }}
                labelStyle={{ color: "#94a3b8" }}
              />
              <ReferenceLine y={2} stroke="#1e293b" strokeDasharray="4 4" />
              <Bar dataKey="target" fill="#1e3a5f" name="Target" radius={[3,3,0,0]} />
              <Bar dataKey="sessions" fill="#3b82f6" name="Done" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Quick nav */}
      <div className="grid-2">
        <Link to="/daily" style={{ textDecoration: "none" }}>
          <div className="card" style={{ borderColor: "#3b82f633", cursor: "pointer", textAlign: "center" }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>➕</div>
            <div style={{ fontSize: 12, color: "#60a5fa", fontWeight: 700 }}>Log Today</div>
          </div>
        </Link>
        <Link to="/contest" style={{ textDecoration: "none" }}>
          <div className="card" style={{ borderColor: "#f9731633", cursor: "pointer", textAlign: "center" }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>🏆</div>
            <div style={{ fontSize: 12, color: "#fb923c", fontWeight: 700 }}>Log Contest</div>
          </div>
        </Link>
      </div>
    </div>
  );
}

// Build minimal dashboard from localStorage backup
function buildFromBackup(backup) {
  const { totalSessions = 0, totalQuestions = 0 } = backup;
  const p1s = Math.min(totalSessions, 348);
  const p1q = Math.min(totalQuestions, 283);
  const avg = 2;
  return {
    overview: { totalSessions, totalQuestions, daysLogged: 0, currentPhase: totalSessions < 348 ? 1 : 2, avgSessions: avg, avgQuestions: avg },
    phases: {
      overall: {
        sessions: { done: totalSessions, total: 720, pct: ((totalSessions / 720) * 100).toFixed(1) },
        questions: { done: totalQuestions, total: 582, pct: ((totalQuestions / 582) * 100).toFixed(1) },
        eta: { sessions: calculateETA(720 - totalSessions, avg), questions: calculateETA(582 - totalQuestions, avg) },
      },
      phase1: {
        sessions: { done: p1s, total: 348, pct: ((p1s / 348) * 100).toFixed(1) },
        questions: { done: p1q, total: 283, pct: ((p1q / 283) * 100).toFixed(1) },
        eta: { sessions: calculateETA(348 - p1s, avg), questions: calculateETA(283 - p1q, avg) },
      },
      phase2: {
        sessions: { done: Math.max(0, totalSessions - 348), total: 372, pct: "0.0" },
        questions: { done: Math.max(0, totalQuestions - 283), total: 299, pct: "0.0" },
      },
    },
    weekly: { sessions: 0, questions: 0, daysLogged: 0 },
    chartData: [],
  };
}
