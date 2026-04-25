const express = require("express");
const router = express.Router();
const { signup, login, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// Public
router.post("/signup", signup);
router.post("/login", login);

// Private
router.get("/me", protect, getMe);

module.exports = router;
