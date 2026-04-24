const Contest = require("../models/Contest");

const addContest = async (req, res) => {
  try {
    const entry = await Contest.create(req.body);
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAllContests = async (req, res) => {
  try {
    const entries = await Contest.find().sort({ date: -1 }).limit(50);
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getContestStats = async (req, res) => {
  try {
    const all = await Contest.find();
    const total = all.length;
    const participated = all.filter(c => c.participated).length;
    const upsolved = all.filter(c => c.upsolved).length;
    const lcContests = all.filter(c => c.platform === "LC").length;
    const cfContests = all.filter(c => c.platform === "CF").length;

    // Latest ratings
    const lcEntries = all.filter(c => c.platform === "LC" && c.ratingAfter > 0).sort((a, b) => b.date.localeCompare(a.date));
    const cfEntries = all.filter(c => c.platform === "CF" && c.ratingAfter > 0).sort((a, b) => b.date.localeCompare(a.date));

    res.json({
      total, participated, upsolved, lcContests, cfContests,
      latestLC: lcEntries[0]?.ratingAfter || 0,
      latestCF: cfEntries[0]?.ratingAfter || 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { addContest, getAllContests, getContestStats };
