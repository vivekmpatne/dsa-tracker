import { useEffect, useState } from "react";
import { logProgress, fetchToday } from "../utils/api";
import { today, calculateDailyTarget, saveBackup } from "../utils/helpers";
import ProgressBar from "../components/ProgressBar";

const TOPICS = [
  "Hashing", "Binary Search", "Two Pointers", "Sliding Window",
  "Greedy", "Bit Manipulation", "Maths", "DP", "Graph",
  "Trees", "Linked List", "Stack/Queue", "Recursion", "String", "Heap", "Trie", "Other"
];

export default function DailyLog() {
  const dateStr = today();
  const [dayType, setDayType] = useState("normal");
  const [form, setForm] = useState({
    sessionsCompleted: "",
    questionsCompleted: "",
    topic: "",
    notesMade: false,
    revised: false,
    notes: "",
  });
  const [status, setStatus] = useState(null); // "saving" | "saved" | "error"
  const [existing, setExisting] = useState(null);

  const targets = calculateDailyTarget(dayType);

  // Load today's existing entry
  useEffect(() => {
    fetchToday()
      .then(r => {
        if (r.data) {
          setExisting(r.data);
          setDayType(r.data.dayType || "normal");
          setForm({
            sessionsCompleted: r.data.sessionsCompleted,
            questionsCompleted: r.data.questionsCompleted,
            topic: r.data.topic || "",
            notesMade: r.data.notesMade || false,
            revised: r.data.revised || false,
            notes: r.data.notes || "",
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async () => {
    setStatus("saving");
    try {
      const payload = {
        date: dateStr,
        dayType,
        sessionsCompleted: Number(form.sessionsCompleted) || 0,
        questionsCompleted: Number(form.questionsCompleted) || 0,
        topic: form.topic,
        notesMade: form.notesMade,
        revised: form.revised,
        notes: form.notes,
      };
      await logProgress(payload);
      saveBackup({ lastLogged: dateStr, dayType });
      setStatus("saved");
      setTimeout(() => setStatus(null), 2500);
    } catch (e) {
      setStatus("error");
      setTimeout(() => setStatus(null), 3000);
    }
  };

  const sessDone = Number(form.sessionsCompleted) || 0;
  const qDone = Number(form.questionsCompleted) || 0;
  const sessHit = sessDone >= targets.sessionsTarget;
  const qHit = qDone >= targets.questionsTarget;

  return (
    <div>
      <h1 className="page-title">Daily Log</h1>
      <div style={{ fontSize: 11, color: "#64748b", marginBottom: 16 }}>📅 {dateStr}</div>

      {/* Day type selector */}
      <div className="card">
        <div className="card-title">WHAT KIND OF DAY IS TODAY?</div>
        <div className="toggle-group">
          {["normal", "exam", "holiday"].map(t => (
            <button
              key={t}
              onClick={() => setDayType(t)}
              className={`toggle-btn ${dayType === t ? `active-${t}` : ""}`}
            >
              {t === "normal" ? "📚 Normal" : t === "exam" ? "📝 Exam" : "☀️ Holiday"}
            </button>
          ))}
        </div>
      </div>

      {/* Auto targets */}
      <div className="card" style={{ borderColor: "#3b82f633" }}>
        <div className="card-title">TODAY'S AUTO TARGET</div>
        <div className="grid-2">
          <div className="stat-box" style={{ borderColor: sessHit ? "#22c55e33" : "#3b82f633", textAlign: "center" }}>
            <div className="stat-label">SESSIONS</div>
            <div className="target-big" style={{ color: sessHit ? "#4ade80" : "#3b82f6" }}>
              {sessDone}<span style={{ fontSize: 16, color: "#475569" }}>/{targets.sessionsTarget}</span>
            </div>
            <ProgressBar pct={(sessDone / targets.sessionsTarget) * 100} color={sessHit ? "#22c55e" : "#3b82f6"} height={5} />
          </div>
          <div className="stat-box" style={{ borderColor: qHit ? "#22c55e33" : "#a855f733", textAlign: "center" }}>
            <div className="stat-label">QUESTIONS</div>
            <div className="target-big" style={{ color: qHit ? "#4ade80" : "#a855f7" }}>
              {qDone}<span style={{ fontSize: 16, color: "#475569" }}>/{targets.questionsTarget}</span>
            </div>
            <ProgressBar pct={(qDone / targets.questionsTarget) * 100} color={qHit ? "#22c55e" : "#a855f7"} height={5} />
          </div>
        </div>
        {sessHit && qHit && (
          <div style={{ textAlign: "center", marginTop: 12, fontSize: 13, color: "#4ade80", fontWeight: 700 }}>
            ✅ Target hit! Great work today.
          </div>
        )}
      </div>

      {/* Entry form */}
      <div className="card">
        <div className="card-title">FILL IN TODAY'S ACTUAL PROGRESS</div>

        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Sessions completed</label>
            <input
              type="number" min="0" max="10"
              className="form-input"
              placeholder="e.g. 2"
              value={form.sessionsCompleted}
              onChange={e => setForm(p => ({ ...p, sessionsCompleted: e.target.value }))}
            />
            {/* Quick pick */}
            <div style={{ display: "flex", gap: 5, marginTop: 6 }}>
              {[1, 2, 3, 4].map(n => (
                <button key={n} onClick={() => setForm(p => ({ ...p, sessionsCompleted: n }))}
                  style={{
                    flex: 1, padding: "4px", borderRadius: 6,
                    border: form.sessionsCompleted === n ? "1px solid #3b82f6" : "1px solid #1e293b",
                    background: form.sessionsCompleted === n ? "#1e3a5f" : "#080810",
                    color: form.sessionsCompleted === n ? "#60a5fa" : "#64748b",
                    cursor: "pointer", fontSize: 12, fontFamily: "inherit",
                  }}>{n}</button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Questions solved</label>
            <input
              type="number" min="0" max="20"
              className="form-input"
              placeholder="e.g. 3"
              value={form.questionsCompleted}
              onChange={e => setForm(p => ({ ...p, questionsCompleted: e.target.value }))}
            />
            <div style={{ display: "flex", gap: 5, marginTop: 6 }}>
              {[1, 2, 3, 4].map(n => (
                <button key={n} onClick={() => setForm(p => ({ ...p, questionsCompleted: n }))}
                  style={{
                    flex: 1, padding: "4px", borderRadius: 6,
                    border: form.questionsCompleted === n ? "1px solid #a855f7" : "1px solid #1e293b",
                    background: form.questionsCompleted === n ? "#2e1065aa" : "#080810",
                    color: form.questionsCompleted === n ? "#c4b5fd" : "#64748b",
                    cursor: "pointer", fontSize: 12, fontFamily: "inherit",
                  }}>{n}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Topic covered today</label>
          <select
            className="form-input form-select"
            value={form.topic}
            onChange={e => setForm(p => ({ ...p, topic: e.target.value }))}
          >
            <option value="">— Select topic —</option>
            {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Notes / What I learned</label>
          <textarea
            className="form-input form-textarea"
            placeholder="Key intuition, patterns, mistakes..."
            value={form.notes}
            onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
          />
        </div>

        <div>
          <label className="checkbox-row">
            <input type="checkbox" checked={form.notesMade}
              onChange={e => setForm(p => ({ ...p, notesMade: e.target.checked }))} />
            <label>📝 Made Google Doc / handwritten notes today</label>
          </label>
          <label className="checkbox-row">
            <input type="checkbox" checked={form.revised}
              onChange={e => setForm(p => ({ ...p, revised: e.target.checked }))} />
            <label>🔁 Revised previous notes today</label>
          </label>
        </div>
      </div>

      <button
        className={`btn btn-block ${status === "saved" ? "btn-success" : "btn-primary"}`}
        onClick={handleSubmit}
        disabled={status === "saving"}
        style={{ marginBottom: 16 }}
      >
        {status === "saving" ? "Saving..." : status === "saved" ? "✅ Saved!" : status === "error" ? "❌ Error — retry" : existing ? "Update Today's Log" : "Save Today's Log"}
      </button>

      {existing && (
        <div className="alert alert-info">
          ℹ️ You already have an entry for today. Submitting will update it.
        </div>
      )}
    </div>
  );
}
