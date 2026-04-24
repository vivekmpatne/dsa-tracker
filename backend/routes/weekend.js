// routes/weekend.js
const express = require("express");
const router = express.Router();
const { upsertWeekend, getAllWeekend } = require("../controllers/weekendController");

router.post("/", upsertWeekend);
router.get("/", getAllWeekend);

module.exports = router;
