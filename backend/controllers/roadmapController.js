const Roadmap = require("../models/Roadmap");
const RoadmapProgress = require("../models/RoadmapProgress");
const Career = require("../models/Career");
const Activity = require("../models/Activity");
const Notification = require("../models/Notification");

// Get all roadmaps
const getRoadmaps = async (req, res) => {
    try {
        const roadmaps = await Roadmap.find()
            .populate("career", "name")
            .populate("careerId", "name")
            .sort({ createdAt: -1 });

        res.json(roadmaps);
    } catch (error) {
        res.status(500).json({
            message: "Failed to get roadmaps",
            error: error.message
        });
    }
};

// Get roadmap for one career (supporting career or careerId fields)
const getRoadmapByCareer = async (req, res) => {
    try {
        const { careerId } = req.params;

        const roadmap = await Roadmap.findOne({
            $or: [{ career: careerId }, { careerId: careerId }]
        })
            .populate("career", "name")
            .populate("careerId", "name");

        if (!roadmap) {
            // Also check if career exists to return helpful info
            const career = await Career.findById(careerId);
            return res.status(404).json({
                message: "Roadmap not found for this career",
                careerName: career ? career.name : ""
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

// Get progress for a specific career for the logged-in user
const getCareerRoadmapProgress = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { careerId } = req.params;

        const roadmap = await Roadmap.findOne({
            $or: [{ career: careerId }, { careerId: careerId }]
        });

        if (!roadmap) {
            return res.json({
                started: false,
                progressPercentage: 0,
                completedStepIds: [],
                totalSteps: 0
            });
        }

        const progress = await RoadmapProgress.findOne({
            $or: [
                { userId, careerId },
                { userId, roadmapId: roadmap._id }
            ]
        });

        const completedStepIds = progress ? (progress.completedStepIds || []).map(String) : [];
        const totalSteps = (roadmap.steps || []).length;
        const progressPercentage = totalSteps > 0
            ? Math.round((completedStepIds.length / totalSteps) * 100)
            : 0;

        res.json({
            started: Boolean(progress),
            progressPercentage,
            completedStepIds,
            totalSteps,
            roadmapId: roadmap._id
        });
    } catch (error) {
        console.error("Progress fetch error:", error);
        res.status(500).json({
            message: "Failed to get roadmap progress",
            error: error.message
        });
    }
};

// Toggle completion of a roadmap step
const toggleRoadmapStep = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { careerId } = req.params;
        const stepId = req.body.stepId || req.params.stepId;

        const roadmap = await Roadmap.findOne({
            $or: [{ career: careerId }, { careerId: careerId }]
        });

        if (!roadmap) {
            return res.status(404).json({ message: "Roadmap not found" });
        }

        let progress = await RoadmapProgress.findOne({
            $or: [
                { userId, careerId },
                { userId, roadmapId: roadmap._id }
            ]
        });

        if (!progress) {
            progress = await RoadmapProgress.create({
                userId,
                careerId,
                roadmapId: roadmap._id,
                completedStepIds: [],
                startedAt: new Date(),
                lastActivityAt: new Date()
            });

            // Log activity: started roadmap
            const career = await Career.findById(careerId);
            await Activity.create({
                user: userId,
                type: "roadmap_started",
                career: careerId,
                description: `Started roadmap for ${career?.name || "Career"}`
            }).catch(() => {});
        }

        const stepIdStr = String(stepId);
        let completedIds = (progress.completedStepIds || []).map(String);
        let completed = false;

        if (completedIds.includes(stepIdStr)) {
            // Undo completion
            completedIds = completedIds.filter((id) => id !== stepIdStr);
            completed = false;
        } else {
            // Mark complete
            completedIds.push(stepIdStr);
            completed = true;

            // Find step details for activity description
            const steps = roadmap.steps || [];
            const stepObj = steps.find(
                (s) => String(s._id) === stepIdStr || String(s.stepNumber) === stepIdStr
            );
            const career = await Career.findById(careerId);

            await Activity.create({
                user: userId,
                type: "roadmap_completed",
                career: careerId,
                description: `Completed "${stepObj?.title || "Step"}"`
            }).catch(() => {});

            // Find next incomplete step for notification
            const completedSet = new Set(completedIds);
            const nextStep = steps.find(
                (s) => !completedSet.has(String(s._id)) && !completedSet.has(String(s.stepNumber))
            );

            await Notification.create({
                user: userId,
                title: nextStep ? "Next step unlocked" : "Roadmap completed!",
                message: nextStep
                    ? `You finished "${stepObj?.title || "a step"}" in ${career?.name || "your roadmap"}. Next up: ${nextStep.title}.`
                    : `Congratulations! You completed all steps in the ${career?.name || "career"} roadmap.`,
                type: "roadmap"
            }).catch(() => {});
        }

        progress.completedStepIds = completedIds;
        progress.lastActivityAt = new Date();
        await progress.save();

        const totalSteps = (roadmap.steps || []).length;
        const progressPercentage = totalSteps > 0
            ? Math.round((completedIds.length / totalSteps) * 100)
            : 0;

        res.json({
            message: completed ? "Step marked as complete" : "Step marked as incomplete",
            completed,
            completedStepIds: completedIds,
            progressPercentage,
            totalSteps
        });
    } catch (error) {
        console.error("Toggle step error:", error);
        res.status(500).json({
            message: "Failed to update roadmap step progress",
            error: error.message
        });
    }
};

// Get all active roadmaps for logged-in user (Dashboard widget)
const getUserActiveRoadmaps = async (req, res) => {
    try {
        const userId = req.user.userId;

        const progressList = await RoadmapProgress.find({ userId })
            .populate({
                path: "careerId",
                select: "name fieldId subfieldId shortDescription"
            })
            .populate("roadmapId")
            .sort({ lastActivityAt: -1 });

        const activeRoadmaps = [];

        for (const prog of progressList) {
            const roadmap = prog.roadmapId;
            const career = prog.careerId;
            if (!roadmap || !career) continue;

            const steps = roadmap.steps || [];
            const completedCount = (prog.completedStepIds || []).length;
            const totalSteps = steps.length;
            const percentage = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

            // Find next incomplete step
            const completedSet = new Set((prog.completedStepIds || []).map(String));
            const nextStep = steps.find((s) => !completedSet.has(String(s._id)));

            activeRoadmaps.push({
                progressId: prog._id,
                careerId: career._id,
                careerName: career.name,
                completedSteps: completedCount,
                totalSteps,
                progressPercentage: percentage,
                nextStepTitle: nextStep ? nextStep.title : "All steps completed!",
                lastActivityAt: prog.lastActivityAt
            });
        }

        res.json(activeRoadmaps);
    } catch (error) {
        console.error("Active roadmaps error:", error);
        res.status(500).json({
            message: "Failed to get active roadmaps",
            error: error.message
        });
    }
};

// Create a roadmap (Admin)
const createRoadmap = async (req, res) => {
    try {
        const { career, careerId, title, steps } = req.body;
        const targetCareerId = career || careerId;

        const roadmap = await Roadmap.create({
            career: targetCareerId,
            careerId: targetCareerId,
            title,
            steps
        });

        res.status(201).json(roadmap);
    } catch (error) {
        res.status(500).json({
            message: "Failed to create roadmap",
            error: error.message
        });
    }
};

// Update a roadmap (Admin)
const updateRoadmap = async (req, res) => {
    try {
        const roadmap = await Roadmap.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!roadmap) {
            return res.status(404).json({ message: "Roadmap not found" });
        }

        res.json(roadmap);
    } catch (error) {
        res.status(500).json({
            message: "Failed to update roadmap",
            error: error.message
        });
    }
};

// Delete a roadmap (Admin)
const deleteRoadmap = async (req, res) => {
    try {
        const roadmap = await Roadmap.findByIdAndDelete(req.params.id);

        if (!roadmap) {
            return res.status(404).json({ message: "Roadmap not found" });
        }

        res.json({ message: "Roadmap deleted successfully" });
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
    getCareerRoadmapProgress,
    toggleRoadmapStep,
    getUserActiveRoadmaps,
    createRoadmap,
    updateRoadmap,
    deleteRoadmap
};