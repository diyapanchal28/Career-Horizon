const express = require("express");

const {
    getSubfields,
    createSubfield,
    updateSubfield,
    deleteSubfield
} = require("../controllers/subfieldController");

const router = express.Router();

// Get all subfields
router.get("/", getSubfields);

// Create subfield
router.post("/", createSubfield);

// Update subfield
router.put("/:id", updateSubfield);

// Delete subfield
router.delete("/:id", deleteSubfield);

module.exports = router;