import { useState, useEffect } from "react";
import { logContest, fetchContests, fetchContestStats } from "../utils/api";
import { today } from "../utils/helpers";

export default function ContestLog() {
  const [form, setForm] = useState({
    date: today(),
    platform: "LC",
    contestName: "",
    participated: true,
    problemsSolved: "",
    totalProblems: "",
    upsolved: false,
    upsolvedCount: "",
    ratingBefore: "",
    ratingAfter: "",
    notes: "",
  });
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    fetchContests().then(r => setHistory(r.data || [])).catch(() => {});
    fetchContestStats().then(r => setStats(r.data)).catch(() => {});
  }, []);

  const handleSubmit = async () => {
    setStatus("saving");
    try {
      await logContest({
        ...form,
        problemsSolved: Number(form.problemsSolved) || 0,
        totalProblems: Number(form.totalProblems) || 0,
        upsolvedCount: Number(form.upsolvedCount) || 0,
        ratingBefore: Number(form.ratingBefore) || 0,
        ratingAfter: Number(form.ratingAfter) || 0,
      });
      setStatus("saved");
      fetchContests().then(r => setHistory(r.data || [])).catch(() => {});
      fetchContestStats().then(r => setStats(r.data)).catch(() => {});
      setTimeout(() => setStatus(null), 2500);
    } catch (e) {
      setStatus("error");
      setTimeout(() => setStatus(null), 3000);
    }
  };

  const ratingDelta = (Number(form.ratingAfter) || 0) - (Number(form.ratingBefore) || 0);

  return (
    <div>
      <h1 className="page-title">Contest Log</h1>
      <div className="alert alert-info" style={{ marginBottom: 16 }}>
        ⚡ Contests unlock after Phase 1 completion (348 sessions)
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid-4" style={{ marginBottom: 14 }}>
          <div className="stat-box">
            <div className="stat-label">TOTAL</div>
            <div className="stat-value" style={{ color: "#f97316" }}>{stats.total}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">LC RATING</div>
            <div className="stat-value" style={{ color: "#f97316" }}>{stats.latestLC || "—"}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">CF RATING</div>
            <div className="stat-value" style={{ color: "#3b82f6" }}>{stats.latestCF || "—"}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">UPSOLVED</div>
            <div className="stat-value" style={{ color: "#4ade80" }}>{stats.upsolved}</div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-title">LOG CONTEST</div>

        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Date</label>
            <input type="date" className="form-input" value={form.date}
              onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Platform</label>
            <select className="form-input form-select" value={form.platform}
              onChange={e => setForm(p => ({ ...p, platform: e.target.value }))}>
              <option value="LC">LeetCode</option>
              <option value="CF">Codeforces</option>
              <option value="CC">CodeChef</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Contest name</label>
          <input type="text" className="form-input" placeholder="e.g. LC Weekly Contest 395"
            value={form.contestName} onChange={e => setForm(p => ({ ...p, contestName: e.target.value }))} />
        </div>

        <label className="checkbox-row" style={{ marginBottom: 12 }}>
          <input type="checkbox" checked={form.participated}
            onChange={e => setForm(p => ({ ...p, participated: e.target.checked }))} />
          <label>✅ Participated in this contest</label>
        </label>

        {form.participated && (
          <>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Problems solved</label>
                <input type="number" min="0" className="form-input" placeholder="e.g. 2"
                  value={form.problemsSolved} onChange={e => setForm(p => ({ ...p, problemsSolved: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Total problems</label>
                <input type="number" min="0" className="form-input" placeholder="e.g. 4"
                  value={form.totalProblems} onChange={e => setForm(p => ({ ...p, totalProblems: e.target.value }))} />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Rating before</label>
                <input type="number" className="form-input" placeholder="e.g. 1491"
                  value={form.ratingBefore} onChange={e => setForm(p => ({ ...p, ratingBefore: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Rating after</label>
                <input type="number" className="form-input" placeholder="e.g. 1520"
                  value={form.ratingAfter} onChange={e => setForm(p => ({ ...p, ratingAfter: e.target.value }))} />
              </div>
            </div>

            {form.ratingBefore && form.ratingAfter && (
              <div style={{ padding: "8px 12px", background: ratingDelta >= 0 ? "#14532d" : "#1a0a0a", borderRadius: 8, marginBottom: 12, border: `1px solid ${ratingDelta >= 0 ? "#22c55e44" : "#f8717144"}` }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: ratingDelta >= 0 ? "#4ade80" : "#f87171" }}>
                  {ratingDelta >= 0 ? "▲" : "▼"} {Math.abs(ratingDelta)} rating change
                </span>
              </div>
            )}
          </>
        )}

        <label className="checkbox-row" style={{ marginBottom: 10 }}>
          <input type="checkbox" checked={form.upsolved}
            onChange={e => setForm(p => ({ ...p, upsolved: e.target.checked }))} />
          <label>📖 Upsolved problems after contest</label>
        </label>

        {form.upsolved && (
          <div className="form-group">
            <label className="form-label">How many upsolved?</label>
            <input type="number" min="0" className="form-input" placeholder="e.g. 1"
              value={form.upsolvedCount} onChange={e => setForm(p => ({ ...p, upsolvedCount: e.target.value }))} />
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Notes / Key takeaway</label>
          <textarea className="form-input form-textarea" placeholder="What did you learn from this contest?"
            value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
        </div>

        <button className={`btn btn-block ${status === "saved" ? "btn-success" : "btn-primary"}`}
          onClick={handleSubmit} disabled={status === "saving"}>
          {status === "saving" ? "Saving..." : status === "saved" ? "✅ Saved!" : "Save Contest Log"}
        </button>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="card">
          <div className="card-title">CONTEST HISTORY</div>
          {history.slice(0, 8).map((c, i) => {
            const delta = c.ratingAfter - c.ratingBefore;
            return (
              <div key={i} className="row-item">
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <span className={`badge ${c.platform === "LC" ? "badge-orange" : "badge-blue"}`}>{c.platform}</span>
                    <span style={{ fontSize: 12, color: "#f1f5f9" }}>{c.contestName || "Contest"}</span>
                  </div>
                  <span style={{ fontSize: 11, color: "#64748b" }}>{c.date}</span>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>{c.problemsSolved}/{c.totalProblems} solved</span>
                  {c.ratingAfter > 0 && (
                    <span style={{ fontSize: 11, fontWeight: 700, color: delta >= 0 ? "#4ade80" : "#f87171" }}>
                      {delta >= 0 ? "▲" : "▼"}{Math.abs(delta)} → {c.ratingAfter}
                    </span>
                  )}
                  {c.upsolved && <span className="badge badge-green">📖 Upsolved</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
