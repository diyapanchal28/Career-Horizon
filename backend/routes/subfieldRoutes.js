const express = require("express");

const {
    getSubfields,
    createSubfield,
    updateSubfield,
    deleteSubfield
} = require("../controllers/subfieldController");

const router = express.Router();
const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

// Get all subfields
router.get("/", getSubfields);

// Create subfield
router.post("/", protect, adminOnly, createSubfield);

// Update subfield
router.put("/:id", protect, adminOnly, updateSubfield);

// Delete subfield
router.delete("/:id", protect, adminOnly, deleteSubfield);

module.exports = router;