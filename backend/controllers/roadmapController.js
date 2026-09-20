const Roadmap = require("../models/Roadmap");


// Get all roadmaps
const getRoadmaps = async (req, res) => {
    try {
        const roadmaps = await Roadmap.find()
            .populate("career", "name")
            .sort({ createdAt: -1 });

        res.json(roadmaps);
    } catch (error) {
        res.status(500).json({
            message: "Failed to get roadmaps",
            error: error.message
        });
    }
};


// Get roadmap for one career
const getRoadmapByCareer = async (req, res) => {
    try {
        const roadmap = await Roadmap.findOne({
            career: req.params.careerId
        }).populate("career", "name");

        if (!roadmap) {
            return res.status(404).json({
                message: "Roadmap not found"
            });
        }

        res.json(roadmap);
    } catch (error) {
        res.status(500).json({
            message: "Failed to get roadmap",
            error: error.message
        });
    }
};


// Create a roadmap
const createRoadmap = async (req, res) => {
    try {
        const { career, steps } = req.body;

        const roadmap = await Roadmap.create({
            career,
            steps
        });

        const populatedRoadmap = await roadmap.populate(
            "career",
            "name"
        );

        res.status(201).json(populatedRoadmap);
    } catch (error) {
        res.status(500).json({
            message: "Failed to create roadmap",
            error: error.message
        });
    }
};


// Update a roadmap
const updateRoadmap = async (req, res) => {
    try {
        const roadmap = await Roadmap.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        ).populate("career", "name");

        if (!roadmap) {
            return res.status(404).json({
                message: "Roadmap not found"
            });
        }

        res.json(roadmap);
    } catch (error) {
        res.status(500).json({
            message: "Failed to update roadmap",
            error: error.message
        });
    }
};


// Delete a roadmap
const deleteRoadmap = async (req, res) => {
    try {
        const roadmap = await Roadmap.findByIdAndDelete(
            req.params.id
        );

        if (!roadmap) {
            return res.status(404).json({
                message: "Roadmap not found"
            });
        }

        res.json({
            message: "Roadmap deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete roadmap",
            error: error.message
        });
    }
};


module.exports = {
    getRoadmaps,
    getRoadmapByCareer,
    createRoadmap,
    updateRoadmap,
    deleteRoadmap
};