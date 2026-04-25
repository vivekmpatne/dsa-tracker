const DailyProgress = require("../models/DailyProgress");
const { evaluateProgress } = require("../utils/targetLogic");

/**
 * @desc    Create a daily progress entry
 * @route   POST /api/progress
 * @access  Private
 */
const createProgress = async (req, res) => {
  try {
    const { sessions, questions, topic, notesDone, revisionDone, dayType, date } = req.body;

    // Normalize date to start-of-day UTC (if provided)
    let normalizedDate;
    if (date) {
      normalizedDate = new Date(date);
      normalizedDate.setUTCHours(0, 0, 0, 0);
    } else {
      normalizedDate = new Date();
      normalizedDate.setUTCHours(0, 0, 0, 0);
    }

    // Check for duplicate entry (same user + same day)
    const existing = await DailyProgress.findOne({
      userId: req.user._id,
      date: normalizedDate,
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "A progress entry for this date already exists. Use PUT to update it.",
        existingId: existing._id,
      });
    }

    const progress = await DailyProgress.create({
      userId: req.user._id,
      sessions,
      questions,
      topic,
      notesDone,
      revisionDone,
      dayType,
      date: normalizedDate,
    });

    const evaluation = evaluateProgress(progress.dayType, progress.sessions, progress.questions);

    res.status(201).json({
      success: true,
      message: "Progress entry created.",
      data: progress,
      evaluation,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(". ") });
    }
    // Duplicate key from MongoDB index
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A progress entry for this date already exists.",
      });
    }
    console.error("createProgress error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * @desc    Get all progress entries for the logged-in user
 * @route   GET /api/progress
 * @access  Private
 * @query   page, limit, dayType, startDate, endDate, sortBy (date|-date)
 */
const getProgress = async (req, res) => {
  try {
    const { page = 1, limit = 20, dayType, startDate, endDate, sortBy = "-date" } = req.query;

    const filter = { userId: req.user._id };

    if (dayType) filter.dayType = dayType;

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setUTCHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await DailyProgress.countDocuments(filter);

    const entries = await DailyProgress.find(filter)
      .sort(sortBy)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Attach evaluation to each entry
    const enriched = entries.map((entry) => ({
      ...entry,
      evaluation: evaluateProgress(entry.dayType, entry.sessions, entry.questions),
    }));

    res.status(200).json({
      success: true,
      count: enriched.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: enriched,
    });
  } catch (error) {
    console.error("getProgress error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * @desc    Update a progress entry
 * @route   PUT /api/progress/:id
 * @access  Private
 */
const updateProgress = async (req, res) => {
  try {
    const entry = await DailyProgress.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: "Progress entry not found or unauthorized.",
      });
    }

    const allowedFields = ["sessions", "questions", "topic", "notesDone", "revisionDone", "dayType"];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        entry[field] = req.body[field];
      }
    });

    const updated = await entry.save();
    const evaluation = evaluateProgress(updated.dayType, updated.sessions, updated.questions);

    res.status(200).json({
      success: true,
      message: "Progress entry updated.",
      data: updated,
      evaluation,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(". ") });
    }
    console.error("updateProgress error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * @desc    Delete a progress entry
 * @route   DELETE /api/progress/:id
 * @access  Private
 */
const deleteProgress = async (req, res) => {
  try {
    const entry = await DailyProgress.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: "Progress entry not found or unauthorized.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Progress entry deleted.",
      deletedId: entry._id,
    });
  } catch (error) {
    console.error("deleteProgress error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = { createProgress, getProgress, updateProgress, deleteProgress };
