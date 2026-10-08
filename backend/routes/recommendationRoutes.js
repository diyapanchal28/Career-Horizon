const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
    getRecommendations,
    getCareerMatch
} = require("../controllers/recommendationController");

const router = express.Router();

// Get personalized recommendations for logged-in user
router.get("/", protect, getRecommendations);

// Get match percentage and reasons for a single career
router.get("/career/:careerId", protect, getCareerMatch);

module.exports = router;
