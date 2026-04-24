import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import DailyLog from "./pages/DailyLog";
import WeekendLog from "./pages/WeekendLog";
import ContestLog from "./pages/ContestLog";
import History from "./pages/History";
import "./styles.css";

const NAV = [
  { to: "/",        label: "📊 Dashboard" },
  { to: "/daily",   label: "➕ Daily Log" },
  { to: "/weekend", label: "🌐 Weekend" },
  { to: "/contest", label: "🏆 Contest" },
  { to: "/history", label: "📋 History" },
];

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        {/* Top Nav */}
        <nav className="navbar">
          <div className="nav-brand">⚡ DSA Tracker</div>
          <div className="nav-links">
            {NAV.map(n => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === "/"}
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
              >
                {n.label}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Page Content */}
        <main className="main-content">
          <Routes>
            <Route path="/"        element={<Dashboard />} />
            <Route path="/daily"   element={<DailyLog />} />
            <Route path="/weekend" element={<WeekendLog />} />
            <Route path="/contest" element={<ContestLog />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
