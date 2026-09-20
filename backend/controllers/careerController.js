const Career = require("../models/Career");

// Get all careers
const getCareers = async (req, res) => {
    try {
        const careers = await Career.find()
            .populate("fieldId", "name")
            .populate("subfieldId", "name")
            .sort({ name: 1 });

        res.json(careers);
    } catch (error) {
        res.status(500).json({
            message: "Failed to get careers",
            error: error.message
        });
    }
};


// Get one career by ID
const getCareerById = async (req, res) => {
    try {
        const career = await Career.findById(req.params.id)
            .populate("fieldId", "name")
            .populate("subfieldId", "name");

        if (!career) {
            return res.status(404).json({
                message: "Career not found"
            });
        }

        res.json(career);
    } catch (error) {
        res.status(500).json({
            message: "Failed to get career",
            error: error.message
        });
    }
};


// Create a career
const createCareer = async (req, res) => {
    try {
        const {
            name,
            slug,
            shortDescription,
            description,
            suitableFor,
            fieldId,
            subfieldId,
            education,
            technicalSkills,
            professionalSkills,
            responsibilities,
            workInterests,
            workPreferences,
            salary,
            demand,
            careerGrowth,
            sources,
            overview,
            skills,
            growth,
            image
        } = req.body;

        const career = await Career.create({
            name,
            slug,
            shortDescription,
            description,
            suitableFor,
            fieldId,
            subfieldId,
            education,
            technicalSkills,
            professionalSkills,
            responsibilities,
            workInterests,
            workPreferences,
            salary,
            demand,
            careerGrowth,
            sources,
            overview,
            skills,
            growth,
            image
        });

        res.status(201).json(career);
    } catch (error) {
        res.status(500).json({
            message: "Failed to create career",
            error: error.message
        });
    }
};

// Update a career
const updateCareer = async (req, res) => {
    try {
        const career = await Career.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!career) {
            return res.status(404).json({
                message: "Career not found"
            });
        }

        res.json(career);
    } catch (error) {
        res.status(500).json({
            message: "Failed to update career",
            error: error.message
        });
    }
};


// Delete a career
const deleteCareer = async (req, res) => {
    try {
        const career = await Career.findByIdAndDelete(
            req.params.id
        );

        if (!career) {
            return res.status(404).json({
                message: "Career not found"
            });
        }

        res.json({
            message: "Career deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete career",
            error: error.message
        });
    }
};

module.exports = {
    getCareers,
    getCareerById,
    createCareer,
    updateCareer,
    deleteCareer
};