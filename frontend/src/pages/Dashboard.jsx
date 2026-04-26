import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { statsApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
//import { StatBox, ProgressBar, Badge } from "../components/ui/index";
//import { ActivityChart, TopicPie, TrendChart, StreakDots } from "../components/charts/index";
//import PhaseCard from "../components/charts/PhaseCard";
//import { DashboardSkeleton } from "../components/skeletons/index";
import { calculateETA } from "../utils/helpers";

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    statsApi.dashboard()
      .then(r => setData(r.data.data))
      .catch(() => setError("Failed to load. Check your connection."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;

  if (error || !data) return (
    <div className="empty-state">
      <div className="text-4xl mb-3">⚠️</div>
      <p className="text-ink-2 font-medium mb-1">Could not load dashboard</p>
      <p className="text-xs text-ink-4 mb-4">{error || "No data yet"}</p>
      <Link to="/daily" className="btn btn-primary btn-sm">Log your first day →</Link>
    </div>
  );

  const { overview, phases, weekly, chartData } = data;
  const p1 = phases.phase1;
  const p2 = phases.phase2;
  const ov = phases.overall;
  const currentPhase = overview.currentPhase;

  // Build topic distribution for pie
  const topicData = chartData?.reduce((acc, d) => {
    if (d.topic) {
      const ex = acc.find(a => a.name === d.topic);
      ex ? ex.value++ : acc.push({ name: d.topic, value: 1 });
    }
    return acc;
  }, []);

  // Streak dates set
  const activeDates = new Set(chartData?.map(d => d.date) || []);

  return (
    <div className="space-y-5 animate-fade-in">

      {/* Greeting */}
      <div>
        <h1 className="text-xl font-black text-ink-1">
          Good {getGreeting()}, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-xs text-ink-3 mt-0.5">
          {overview.daysLogged} days logged • {overview.streak || 0} day streak
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatBox
          label="Sessions"
          value={overview.totalSessions}
          sub={`of 720 total`}
          color="#4f8ef7"
          icon="🎥"
        />
        <StatBox
          label="Sheet Qs"
          value={overview.totalQuestions}
          sub={`of 582 total`}
          color="#9b6dff"
          icon="💻"
        />
        <StatBox
          label="Streak"
          value={`${overview.streak || 0}d`}
          sub="current"
          color="#f59e0b"
          icon="🔥"
        />
        <StatBox
          label="Phase"
          value={`P${currentPhase}`}
          sub={currentPhase === 1 ? "Pareto 20%" : "Full 80%"}
          color={currentPhase === 1 ? "#4f8ef7" : "#9b6dff"}
          icon="◎"
        />
      </div>

      {/* Overall progress */}
      <div className="card card-p">
        <p className="card-label">Overall Progress</p>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1.5">
              <span className="text-xs text-ink-3">🎥 Sessions</span>
              <span className="text-xs font-mono font-semibold text-ink-2">
                {ov.sessions.done} / {ov.sessions.total}
                <span className="text-ink-4 ml-1">({ov.sessions.pct.toFixed(1)}%)</span>
              </span>
            </div>
            <ProgressBar
              pct={ov.sessions.pct}
              color="#4f8ef7"
              height={8}
              eta={ov.eta?.sessions}
            />
          </div>
          <div>
            <div className="flex justify-between mb-1.5">
              <span className="text-xs text-ink-3">💻 Sheet Questions</span>
              <span className="text-xs font-mono font-semibold text-ink-2">
                {ov.questions.done} / {ov.questions.total}
                <span className="text-ink-4 ml-1">({ov.questions.pct.toFixed(1)}%)</span>
              </span>
            </div>
            <ProgressBar
              pct={ov.questions.pct}
              color="#9b6dff"
              height={8}
              eta={ov.eta?.questions}
            />
          </div>
        </div>
      </div>

      {/* Phase cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <PhaseCard
          phase={1}
          status={currentPhase === 1 ? "active" : p1.sessions.done >= 348 ? "done" : "locked"}
          sessData={{ done: p1.sessions.done, total: 348, pct: p1.sessions.pct }}
          qData={{ done: p1.questions.done, total: 283, pct: p1.questions.pct }}
          eta={p1.eta}
        />
        <PhaseCard
          phase={2}
          status={currentPhase === 2 ? "active" : currentPhase > 2 ? "done" : "locked"}
          sessData={{ done: p2.sessions.done, total: 372, pct: p2.sessions.pct }}
          qData={{ done: p2.questions.done, total: 299, pct: p2.questions.pct }}
        />
      </div>

      {/* Weekly stats */}
      <div className="card card-p">
        <div className="flex items-center justify-between mb-4">
          <p className="card-label mb-0">This Week</p>
          <Badge variant="blue">{weekly.daysLogged}/5 days</Badge>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { l: "Sessions",  v: weekly.sessions,  c: "#4f8ef7" },
            { l: "Questions", v: weekly.questions, c: "#9b6dff" },
            { l: "Days",      v: weekly.daysLogged, c: "#22c55e" },
          ].map((s, i) => (
            <div key={i} className="bg-surface-2/50 rounded-xl p-3 text-center">
              <p className="text-[10px] text-ink-4 uppercase tracking-widest mb-1">{s.l}</p>
              <p className="text-xl font-black" style={{ color: s.c }}>{s.v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Activity chart */}
      {chartData?.length > 0 && (
        <div className="card card-p">
          <p className="card-label">Last 14 Days — Activity</p>
          <ActivityChart data={chartData} />
        </div>
      )}

      {/* Trend + Pie row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {chartData?.length > 0 && (
          <div className="card card-p">
            <p className="card-label">Sessions Trend</p>
            <TrendChart data={chartData} />
          </div>
        )}
        {topicData?.length > 0 && (
          <div className="card card-p">
            <p className="card-label">Topic Distribution</p>
            <TopicPie data={topicData} />
          </div>
        )}
      </div>

      {/* Streak */}
      {activeDates.size > 0 && (
        <div className="card card-p">
          <div className="flex items-center justify-between mb-3">
            <p className="card-label mb-0">Activity (Last 60 Days)</p>
            <span className="text-xs text-ok font-semibold">{overview.streak || 0} day streak 🔥</span>
          </div>
          <StreakDots dates={activeDates} days={60} />
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link to="/daily" className="card card-p card-hover flex items-center gap-3 no-underline">
          <div className="w-8 h-8 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue text-lg">＋</div>
          <div>
            <p className="text-sm font-semibold text-ink-1">Log Today</p>
            <p className="text-xs text-ink-4">Add daily progress</p>
          </div>
        </Link>
        <Link to="/history" className="card card-p card-hover flex items-center gap-3 no-underline">
          <div className="w-8 h-8 rounded-xl bg-brand-purple/10 flex items-center justify-center text-brand-purple text-lg">≡</div>
          <div>
            <p className="text-sm font-semibold text-ink-1">History</p>
            <p className="text-xs text-ink-4">View all entries</p>
          </div>
        </Link>
      </div>

    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}