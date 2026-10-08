const express = require("express");

const {
    getRoadmaps,
    getRoadmapByCareer,
    getCareerRoadmapProgress,
    toggleRoadmapStep,
    getUserActiveRoadmaps,
    createRoadmap,
    updateRoadmap,
    deleteRoadmap
} = require("../controllers/roadmapController");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();

// Public routes
router.get("/", getRoadmaps);
router.get("/career/:careerId", getRoadmapByCareer);

// User Progress routes (Protected)
router.get("/user/active", protect, getUserActiveRoadmaps);
router.get("/career/:careerId/progress", protect, getCareerRoadmapProgress);
router.get("/:careerId/progress", protect, getCareerRoadmapProgress);
router.post("/career/:careerId/toggle-step", protect, toggleRoadmapStep);
router.post("/:careerId/steps/:stepId/toggle", protect, toggleRoadmapStep);

// Admin-only CRUD routes
router.post("/", protect, adminOnly, createRoadmap);
router.put("/:id", protect, adminOnly, updateRoadmap);
router.delete("/:id", protect, adminOnly, deleteRoadmap);

module.exports = router;