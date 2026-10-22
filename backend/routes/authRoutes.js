const express = require("express");

const {
    registerUser,
    loginUser,
    forgotPassword,
    resetPassword
} = require("../controllers/authController");

const router = express.Router();

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Forgot Password (sends OTP to user's email)
router.post("/forgot-password", forgotPassword);

// Reset Password (verifies OTP and sets new password)
router.post("/reset-password", resetPassword);

module.exports = router;
