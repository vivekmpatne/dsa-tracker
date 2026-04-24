const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const progressRoutes = require("./routes/progress");
const weekendRoutes  = require("./routes/weekend");
const contestRoutes  = require("./routes/contest");
const statsRoutes    = require("./routes/stats");

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/progress", progressRoutes);
app.use("/api/weekend",  weekendRoutes);
app.use("/api/contest",  contestRoutes);
app.use("/api/stats",    statsRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ status: "DSA Tracker API running 🚀" });
});

// ── DB + Start ────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ DB connection failed:", err.message);
    process.exit(1);
  });
