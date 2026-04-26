const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");

dotenv.config();
connectDB();

const app = express();

// ✅ Allowed origins
const allowedOrigins = [
  "http://localhost:5173",
  "https://vivek-dsa-tracker.vercel.app"
];

// ✅ Better CORS (handles undefined origin safely)
app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like Postman, mobile apps)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("CORS not allowed"));
      }
    },
    credentials: true,
  })
);

// Body parser
app.use(express.json());

// ── Routes ───────────────────────────────────────────
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/progress", require("./routes/progressRoutes"));
app.use("/api/stats", require("./routes/statsRoutes"));

// ── Health Check ─────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── 404 Handler ──────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ── Global Error Handler ─────────────────────────────
app.use((err, req, res, next) => {
  console.error("ERROR:", err.message);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ── Start Server ─────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV}]`);
});