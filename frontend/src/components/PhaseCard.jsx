import ProgressBar from "./ProgressBar";

export default function PhaseCard({ phase, sessData, qData, color, status, eta }) {
  return (
    <div className="card" style={{ borderColor: `${color}33` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span className="badge" style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}>
            Phase {phase}
          </span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>
            {phase === 1 ? "Pareto 20%" : "Remaining 80%"}
          </span>
        </div>
        <span style={{ fontSize: 11, color: status === "active" ? "#4ade80" : "#475569", fontWeight: 700 }}>
          {status === "active" ? "🔥 Current" : status === "done" ? "✅ Done" : "🔒 Locked"}
        </span>
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
          <span style={{ fontSize: 11, color: "#94a3b8" }}>🎥 Sessions</span>
          <span style={{ fontSize: 11, fontWeight: 700, color }}>
            {sessData.done} / {sessData.total}
          </span>
        </div>
        <ProgressBar pct={sessData.pct} color={color} height={8} left={sessData.total - sessData.done} eta={eta?.sessions} />
      </div>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
          <span style={{ fontSize: 11, color: "#94a3b8" }}>💻 Sheet Questions</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#a855f7" }}>
            {qData.done} / {qData.total}
          </span>
        </div>
        <ProgressBar pct={qData.pct} color="#a855f7" height={8} left={qData.total - qData.done} eta={eta?.questions} />
      </div>
    </div>
  );
}
