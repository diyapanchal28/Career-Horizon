const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
    saveCareer,
    getSavedCareers,
    removeSavedCareer
} = require("../controllers/savedCareerController");

const router = express.Router();


// Save a career
router.post("/", protect, saveCareer);


// Get saved careers for logged-in user
router.get("/", protect, getSavedCareers);


// Remove a saved career
router.delete("/:careerId", protect, removeSavedCareer);


module.exports = router;