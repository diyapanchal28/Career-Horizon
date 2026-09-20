const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
    getCareers,
    getCareerById,
    createCareer,
    updateCareer,
    deleteCareer
} = require("../controllers/careerController");

const router = express.Router();

// Get all careers
router.get("/", protect, getCareers);

// Get one career by ID
router.get("/:id", getCareerById);

// Create career
router.post("/", protect, createCareer);

// Update career
router.put("/:id", protect, updateCareer);

// Delete career
router.delete("/:id", protect, deleteCareer);

module.exports = router;