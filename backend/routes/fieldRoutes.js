const express = require("express");

const {
    getFields,
    createField,
    updateField,
    deleteField
} = require("../controllers/fieldController");

const router = express.Router();
const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

// Get all fields
router.get("/", getFields);

// Create field
router.post("/", protect, adminOnly, createField);

// Update field
router.put("/:id", protect, adminOnly, updateField);

// Delete field
router.delete("/:id", protect, adminOnly, deleteField);

module.exports = router;