const express = require("express");
const router = express.Router();

const {
    getOverview,
    getBadges,
    getWeeklyGoals,
    setWeeklyGoals,
    logActivity,
    getActivityHistory
} = require("../controllers/gamificationController");

const protect = require("../middleware/authMiddleware");

// All gamification routes are protected for authenticated users
router.get("/overview", protect, getOverview);
router.get("/badges", protect, getBadges);
router.get("/goals", protect, getWeeklyGoals);
router.post("/goals/select", protect, setWeeklyGoals);
router.post("/activity", protect, logActivity);
router.get("/history", protect, getActivityHistory);

module.exports = router;
