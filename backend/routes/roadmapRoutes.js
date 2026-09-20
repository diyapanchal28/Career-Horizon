const express = require("express");

const {
    getRoadmaps,
    getRoadmapByCareer,
    createRoadmap,
    updateRoadmap,
    deleteRoadmap
} = require("../controllers/roadmapController");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();


// Get all roadmaps
router.get("/", getRoadmaps);


// Get roadmap for a specific career
router.get("/career/:careerId", getRoadmapByCareer);


// Create roadmap - Admin only
router.post("/", protect, adminOnly, createRoadmap);


// Update roadmap - Admin only
router.put("/:id", protect, adminOnly, updateRoadmap);


// Delete roadmap - Admin only
router.delete("/:id", protect, adminOnly, deleteRoadmap);


module.exports = router;