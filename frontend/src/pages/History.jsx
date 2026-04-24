import { useState, useEffect } from "react";
import { fetchProgress } from "../utils/api";

const DAY_COLORS = { normal: "#3b82f6", exam: "#f97316", holiday: "#22c55e" };

export default function History() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress()
      .then(r => setEntries(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color: "#475569", padding: 20 }}>Loading history...</div>;
  if (!entries.length) return (
    <div>
      <h1 className="page-title">History</h1>
      <div className="alert alert-warn">No entries yet. Start logging daily!</div>
    </div>
  );

  return (
    <div>
      <h1 className="page-title">History</h1>
      <div style={{ fontSize: 11, color: "#64748b", marginBottom: 16 }}>{entries.length} days logged</div>

      {entries.map((e, i) => {
        const hit = e.sessionsCompleted >= e.targetSessions && e.questionsCompleted >= e.targetQuestions;
        return (
          <div key={i} className="row-item" style={{ borderColor: hit ? "#22c55e22" : "#1e293b" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div>
                <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#f1f5f9" }}>{e.date}</span>
                  {hit && <span style={{ fontSize: 10, color: "#4ade80" }}>✅ Target hit</span>}
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <span className="badge" style={{
                    background: `${DAY_COLORS[e.dayType]}11`,
                    color: DAY_COLORS[e.dayType],
                    border: `1px solid ${DAY_COLORS[e.dayType]}33`,
                  }}>{e.dayType}</span>
                  <span className={`badge ${e.phase === 1 ? "badge-blue" : "badge-purple"}`}>P{e.phase}</span>
                  {e.topic && <span className="badge" style={{ background: "#1e293b", color: "#94a3b8" }}>{e.topic}</span>}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#3b82f6" }}>
                  {e.sessionsCompleted}<span style={{ fontSize: 10, color: "#475569" }}>/{e.targetSessions}s</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#a855f7" }}>
                  {e.questionsCompleted}<span style={{ fontSize: 10, color: "#475569" }}>/{e.targetQuestions}q</span>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {e.notesMade && <span style={{ fontSize: 10, color: "#64748b" }}>📝 Notes</span>}
              {e.revised && <span style={{ fontSize: 10, color: "#64748b" }}>🔁 Revised</span>}
              {e.notes && <span style={{ fontSize: 10, color: "#64748b" }} title={e.notes}>💬 Has note</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
