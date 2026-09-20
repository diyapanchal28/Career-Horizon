const SavedCareer = require("../models/SavedCareer");


// Save a career
const saveCareer = async (req, res) => {
    try {
        const user = req.user.userId;
        const { career } = req.body;

        // Check if career is already saved
        const existingSave = await SavedCareer.findOne({
            user,
            career
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

        const populatedSavedCareer = await savedCareer.populate(
            "career",
            "name shortDescription"
        );

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
            user
        })
            .populate(
                "career",
                "name shortDescription fieldId subfieldId"
            )
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
            user,
            career: careerId
        });

        if (!savedCareer) {
            return res.status(404).json({
                message: "Saved career not found"
            });
        }

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