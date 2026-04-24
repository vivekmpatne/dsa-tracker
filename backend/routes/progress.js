// routes/progress.js
const express = require("express");
const router = express.Router();
const { upsertProgress, getAllProgress, getTodayProgress, getSummary } = require("../controllers/progressController");

router.post("/", upsertProgress);
router.get("/", getAllProgress);
router.get("/today", getTodayProgress);
router.get("/summary", getSummary);

module.exports = router;
