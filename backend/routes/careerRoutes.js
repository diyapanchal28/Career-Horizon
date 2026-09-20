const express = require("express");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const {
    getCareers,
    getCareerById,
    createCareer,
    updateCareer,
    deleteCareer
} = require("../controllers/careerController");

const router = express.Router();

// Get all careers - Public
router.get("/", getCareers);

// Get one career by ID - Public
router.get("/:id", getCareerById);

// Create career - Admin only
router.post("/", protect, adminOnly, createCareer);

// Update career - Admin only
router.put("/:id", protect, adminOnly, updateCareer);

// Delete career - Admin only
router.delete("/:id", protect, adminOnly, deleteCareer);

module.exports = router;