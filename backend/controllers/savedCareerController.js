const SavedCareer = require("../models/SavedCareer");
const Activity = require("../models/Activity");
const Career = require("../models/Career");


// Save a career
const saveCareer = async (req, res) => {
    try {
        const user = req.user.userId;
        const { career } = req.body;

        // Check if career is already saved
        const existingSave = await SavedCareer.findOne({
            $or: [
                { user, career },
                { user, careerId: career },
                { userId: user, career },
                { userId: user, careerId: career }
            ]
        });

        if (existingSave) {
            return res.status(400).json({
                message: "Career is already saved"
            });
        }

        const savedCareer = await SavedCareer.create({
            user,
            career
        });

        const populatedSavedCareer = await savedCareer.populate({
            path: "career",
            select: "name shortDescription description fieldId subfieldId demand salary growth technicalSkills skills education",
            populate: [
                { path: "fieldId", select: "name" },
                { path: "subfieldId", select: "name" }
            ]
        });

        // Log activity (e.g., "Saved Business Analyst" as in PDF Page 8)
        const careerName = populatedSavedCareer?.career?.name || "Career";
        await Activity.create({
            user,
            type: "career_saved",
            career,
            description: `Saved ${careerName}`
        }).catch(() => {});

        res.status(201).json(populatedSavedCareer);

    } catch (error) {
        res.status(500).json({
            message: "Failed to save career",
            error: error.message
        });
    }
};


// Get all saved careers for logged-in user
const getSavedCareers = async (req, res) => {
    try {
        const user = req.user.userId;

        const savedCareers = await SavedCareer.find({
            $or: [{ user }, { userId: user }]
        })
            .populate({
                path: "career",
                select: "name shortDescription description fieldId subfieldId demand salary growth technicalSkills skills education",
                populate: [
                    { path: "fieldId", select: "name" },
                    { path: "subfieldId", select: "name" }
                ]
            })
            .sort({ createdAt: -1 });

        res.json(savedCareers);

    } catch (error) {
        res.status(500).json({
            message: "Failed to get saved careers",
            error: error.message
        });
    }
};


// Remove a saved career
const removeSavedCareer = async (req, res) => {
    try {
        const user = req.user.userId;
        const { careerId } = req.params;

        const savedCareer = await SavedCareer.findOneAndDelete({
            $or: [
                { user, career: careerId },
                { user, careerId: careerId },
                { userId: user, career: careerId },
                { userId: user, careerId: careerId }
            ]
        });

        if (!savedCareer) {
            return res.status(404).json({
                message: "Saved career not found"
            });
        }

        const careerDoc = await Career.findById(careerId).select("name").catch(() => null);
        await Activity.create({
            user,
            type: "career_removed",
            career: careerId,
            description: `Removed ${careerDoc?.name || "career"} from saved`
        }).catch(() => {});

        res.json({
            message: "Career removed from saved careers"
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to remove saved career",
            error: error.message
        });
    }
};


module.exports = {
    saveCareer,
    getSavedCareers,
    removeSavedCareer
};