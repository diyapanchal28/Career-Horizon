const express = require("express");

const {
    getRoadmaps,
    getRoadmapByCareer,
    createRoadmap,
    updateRoadmap,
    deleteRoadmap
} = require("../controllers/roadmapController");

const router = express.Router();


// Get all roadmaps
router.get("/", getRoadmaps);


// Get roadmap for a specific career
router.get("/career/:careerId", getRoadmapByCareer);


// Create roadmap
router.post("/", createRoadmap);


// Update roadmap
router.put("/:id", updateRoadmap);


// Delete roadmap
router.delete("/:id", deleteRoadmap);


module.exports = router;