const express = require("express");

const {
    getFields,
    createField,
    updateField,
    deleteField
} = require("../controllers/fieldController");

const router = express.Router();

// Get all fields
router.get("/", getFields);

// Create field
router.post("/", createField);

// Update field
router.put("/:id", updateField);

// Delete field
router.delete("/:id", deleteField);

module.exports = router;