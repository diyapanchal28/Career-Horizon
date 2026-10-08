const express = require("express");

const {
    getProfile,
    updateProfile,
    getAllUsers,
    toggleUserStatus
} = require("../controllers/userController");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();

// User profile routes
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

// Admin user management routes
router.get("/", protect, adminOnly, getAllUsers);
router.put("/:id/status", protect, adminOnly, toggleUserStatus);

module.exports = router;