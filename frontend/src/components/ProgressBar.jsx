import { useEffect, useState } from "react";

export default function ProgressBar({ pct = 0, color = "#3b82f6", height = 8, label, left, eta }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(Math.min(pct, 100)), 100); return () => clearTimeout(t); }, [pct]);

  return (
    <div>
      {(label || left !== undefined) && (
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
          {label && <span style={{ fontSize: 11, color: "#94a3b8" }}>{label}</span>}
          {left !== undefined && <span style={{ fontSize: 11, color, fontWeight: 700 }}>{pct.toFixed(1)}%</span>}
        </div>
      )}
      <div className="bar-wrap" style={{ height }}>
        <div
          className="bar-fill"
          style={{ width: `${w}%`, background: color, height, boxShadow: `0 0 8px ${color}66` }}
        />
      </div>
      {eta && (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          {left !== undefined && <span style={{ fontSize: 10, color: "#475569" }}>{left} remaining</span>}
          {eta && <span style={{ fontSize: 10, color: "#475569" }}>ETA: {eta}</span>}
        </div>
      )}
    </div>
  );
}
