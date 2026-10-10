const express = require("express");

const {
    getProfile,
    updateProfile,
    getAllUsers,
    toggleUserStatus,
    updateUserRole,
    deleteUser,
    promoteSelfToAdmin
} = require("../controllers/userController");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();

// User profile routes
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.post("/make-admin", protect, promoteSelfToAdmin);

// Admin user management routes
router.get("/", protect, adminOnly, getAllUsers);
router.put("/:id/status", protect, adminOnly, toggleUserStatus);
router.put("/:id/role", protect, adminOnly, updateUserRole);
router.delete("/:id", protect, adminOnly, deleteUser);

module.exports = router;