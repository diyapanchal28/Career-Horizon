const Field = require("../models/Field");

// Get all fields
const getFields = async (req, res) => {
    try {
        const fields = await Field.find().sort({ name: 1 });

        res.json(fields);
    } catch (error) {
        res.status(500).json({
            message: "Failed to get fields",
            error: error.message
        });
    }
};

// Create a field
const createField = async (req, res) => {
    try {
        const { name, description, icon } = req.body;

        const field = await Field.create({
            name,
            description,
            icon
        });

        res.status(201).json(field);
    } catch (error) {
        res.status(500).json({
            message: "Failed to create field",
            error: error.message
        });
    }
};

// Update a field
const updateField = async (req, res) => {
    try {
        const field = await Field.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!field) {
            return res.status(404).json({
                message: "Field not found"
            });
        }

        res.json(field);
    } catch (error) {
        res.status(500).json({
            message: "Failed to update field",
            error: error.message
        });
    }
};


// Delete a field
const deleteField = async (req, res) => {
    try {
        const field = await Field.findByIdAndDelete(req.params.id);

        if (!field) {
            return res.status(404).json({
                message: "Field not found"
            });
        }

        res.json({
            message: "Field deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete field",
            error: error.message
        });
    }
};

module.exports = {
    getFields,
    createField,
    updateField,
    deleteField
};