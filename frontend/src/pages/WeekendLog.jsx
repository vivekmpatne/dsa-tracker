import { useState, useEffect } from "react";
import { logWeekend, fetchWeekends } from "../utils/api";
import { today } from "../utils/helpers";
import ProgressBar from "../components/ProgressBar";

export default function WeekendLog() {
  const dateStr = today();
  const [form, setForm] = useState({
    date: dateStr,
    projectName: "",
    webDevHours: "",
    progressPct: "",
    dsaRevision: false,
    revisionTopics: "",
    notes: "",
  });
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    fetchWeekends().then(r => setHistory(r.data || [])).catch(() => {});
  }, []);

  const handleSubmit = async () => {
    setStatus("saving");
    try {
      await logWeekend({ ...form, webDevHours: Number(form.webDevHours) || 0, progressPct: Number(form.progressPct) || 0 });
      setStatus("saved");
      fetchWeekends().then(r => setHistory(r.data || [])).catch(() => {});
      setTimeout(() => setStatus(null), 2500);
    } catch (e) {
      setStatus("error");
      setTimeout(() => setStatus(null), 3000);
    }
  };

  return (
    <div>
      <h1 className="page-title">Weekend Log</h1>
      <div style={{ fontSize: 11, color: "#64748b", marginBottom: 16 }}>Track your MERN + Web Dev progress 🌐</div>

      <div className="card">
        <div className="card-title">LOG WEEKEND WORK</div>

        <div className="form-group">
          <label className="form-label">Date</label>
          <input type="date" className="form-input" value={form.date}
            onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
        </div>

        <div className="form-group">
          <label className="form-label">Project name</label>
          <input type="text" className="form-input" placeholder="e.g. MERN Todo App"
            value={form.projectName} onChange={e => setForm(p => ({ ...p, projectName: e.target.value }))} />
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Web Dev hours spent</label>
            <input type="number" min="0" max="12" className="form-input" placeholder="e.g. 5"
              value={form.webDevHours} onChange={e => setForm(p => ({ ...p, webDevHours: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Project progress %</label>
            <input type="number" min="0" max="100" className="form-input" placeholder="e.g. 30"
              value={form.progressPct} onChange={e => setForm(p => ({ ...p, progressPct: e.target.value }))} />
          </div>
        </div>

        {form.progressPct > 0 && (
          <div style={{ marginBottom: 14 }}>
            <ProgressBar pct={Number(form.progressPct)} color="#22c55e" height={8}
              label={`${form.projectName || "Project"} progress`} />
          </div>
        )}

        <label className="checkbox-row" style={{ marginBottom: 10 }}>
          <input type="checkbox" checked={form.dsaRevision}
            onChange={e => setForm(p => ({ ...p, dsaRevision: e.target.checked }))} />
          <label>🔁 Did DSA revision this weekend</label>
        </label>

        {form.dsaRevision && (
          <div className="form-group">
            <label className="form-label">Topics revised</label>
            <input type="text" className="form-input" placeholder="e.g. Hashing, Binary Search"
              value={form.revisionTopics} onChange={e => setForm(p => ({ ...p, revisionTopics: e.target.value }))} />
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Notes</label>
          <textarea className="form-input form-textarea" placeholder="What did you build? Any blockers?"
            value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
        </div>

        <button className={`btn btn-block ${status === "saved" ? "btn-success" : "btn-primary"}`}
          onClick={handleSubmit} disabled={status === "saving"}>
          {status === "saving" ? "Saving..." : status === "saved" ? "✅ Saved!" : "Save Weekend Log"}
        </button>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="card">
          <div className="card-title">WEEKEND HISTORY</div>
          {history.slice(0, 5).map((w, i) => (
            <div key={i} className="row-item">
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>{w.projectName || "—"}</span>
                <span style={{ fontSize: 11, color: "#64748b" }}>{w.date}</span>
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: w.progressPct > 0 ? 8 : 0, flexWrap: "wrap" }}>
                <span className="badge badge-blue">{w.webDevHours}h Web Dev</span>
                {w.dsaRevision && <span className="badge badge-green">🔁 Revised</span>}
              </div>
              {w.progressPct > 0 && (
                <ProgressBar pct={w.progressPct} color="#22c55e" height={5} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
