const Career = require("../models/Career");

// Get all careers with search, filter, and sort support
const getCareers = async (req, res) => {
    try {
        const { search, fieldId, subfieldId, demand, education, sort } = req.query;
        const filter = { isActive: true };

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { shortDescription: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
                { technicalSkills: { $regex: search, $options: "i" } },
                { professionalSkills: { $regex: search, $options: "i" } }
            ];
        }

        if (fieldId && fieldId !== "all") {
            filter.fieldId = fieldId;
        }

        if (subfieldId && subfieldId !== "all") {
            filter.subfieldId = subfieldId;
        }

        if (demand && demand !== "all" && demand !== "Any") {
            filter["demand.level"] = { $regex: demand, $options: "i" };
        }

        if (education && education !== "all" && education !== "Any") {
            filter["education.minimumQualification"] = { $regex: education, $options: "i" };
        }

        let sortOption = { name: 1 };
        if (sort === "newest") {
            sortOption = { createdAt: -1 };
        } else if (sort === "popular") {
            sortOption = { viewCount: -1 };
        }

        const careers = await Career.find(filter)
            .populate("fieldId", "name")
            .populate("subfieldId", "name")
            .sort(sortOption);

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

        // Increment view count in background
        Career.findByIdAndUpdate(career._id, { $inc: { viewCount: 1 } }).exec();

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

        await career.populate([
            { path: "fieldId", select: "name" },
            { path: "subfieldId", select: "name" }
        ]);

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
            { returnDocument: 'after', runValidators: true }
        )
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