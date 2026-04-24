const express = require("express");
const router = express.Router();
const { addContest, getAllContests, getContestStats } = require("../controllers/contestController");

router.post("/", addContest);
router.get("/", getAllContests);
router.get("/stats", getContestStats);

module.exports = router;
