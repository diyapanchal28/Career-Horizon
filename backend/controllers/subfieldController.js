const Subfield = require("../models/Subfield");

// Get all subfields
const getSubfields = async (req, res) => {
    try {
        const subfields = await Subfield.find()
            .populate("field", "name")
            .populate("fieldId", "name")
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
        const { name, description, field, fieldId } = req.body;
        const resolvedField = field || fieldId;

        const subfield = await Subfield.create({
            name,
            description,
            field: resolvedField,
            fieldId: resolvedField
        });

        await subfield.populate("field", "name");
        await subfield.populate("fieldId", "name");

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
        const updatePayload = { ...req.body };
        if (updatePayload.field && !updatePayload.fieldId) {
            updatePayload.fieldId = updatePayload.field;
        } else if (updatePayload.fieldId && !updatePayload.field) {
            updatePayload.field = updatePayload.fieldId;
        }

        const subfield = await Subfield.findByIdAndUpdate(
            req.params.id,
            updatePayload,
            { returnDocument: 'after', runValidators: true }
        )
            .populate("field", "name")
            .populate("fieldId", "name");

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