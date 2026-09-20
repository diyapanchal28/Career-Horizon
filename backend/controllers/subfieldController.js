const Subfield = require("../models/Subfield");

// Get all subfields
const getSubfields = async (req, res) => {
    try {
        const subfields = await Subfield.find()
            .populate("field", "name")
            .sort({ name: 1 });

        res.json(subfields);
    } catch (error) {
        res.status(500).json({
            message: "Failed to get subfields",
            error: error.message
        });
    }
};


// Create a subfield
const createSubfield = async (req, res) => {
    try {
        const { name, description, field } = req.body;

        const subfield = await Subfield.create({
            name,
            description,
            field
        });

        res.status(201).json(subfield);
    } catch (error) {
        res.status(500).json({
            message: "Failed to create subfield",
            error: error.message
        });
    }
};

// Update a subfield
const updateSubfield = async (req, res) => {
    try {
        const subfield = await Subfield.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!subfield) {
            return res.status(404).json({
                message: "Subfield not found"
            });
        }

        res.json(subfield);
    } catch (error) {
        res.status(500).json({
            message: "Failed to update subfield",
            error: error.message
        });
    }
};


// Delete a subfield
const deleteSubfield = async (req, res) => {
    try {
        const subfield = await Subfield.findByIdAndDelete(
            req.params.id
        );

        if (!subfield) {
            return res.status(404).json({
                message: "Subfield not found"
            });
        }

        res.json({
            message: "Subfield deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete subfield",
            error: error.message
        });
    }
};

module.exports = {
    getSubfields,
    createSubfield,
    updateSubfield,
    deleteSubfield
};