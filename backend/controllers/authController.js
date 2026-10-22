const User = require("../models/User");
const Notification = require("../models/Notification");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendPasswordResetEmail } = require("../utils/emailService");

const formatUserResponse = (user) => ({
    id: user._id,
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone || "",
    location: user.location || "",
    profilePicture: user.profilePicture || "",
    education: user.education || {},
    selectedFields: user.selectedFields || [],
    selectedSubfields: user.selectedSubfields || [],
    workInterests: user.workInterests || [],
    workPreferences: user.workPreferences || [],
    assessmentCompleted: Boolean(user.assessmentCompleted)
});

// Register User
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        // Create welcome notification
        await Notification.create({
            user: user._id,
            title: "Welcome to Career Horizon",
            message: "Complete your profile and select your interests to see your personalised career matches.",
            type: "general"
        }).catch(() => {});

        // Create JWT token so newly registered user is immediately signed in
        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        res.status(201).json({
            message: "User registered successfully",
            userId: user._id,
            token,
            user: formatUserResponse(user)
        });

    } catch (error) {
        res.status(500).json({
            message: "Registration failed",
            error: error.message
        });
    }
};


// Login User
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email })
            .populate("selectedFields", "name")
            .populate("selectedSubfields", "name");

        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        // Check password
        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        // Create JWT token
        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        res.json({
            message: "Login successful",
            token,
            user: formatUserResponse(user)
        });

    } catch (error) {
        res.status(500).json({
            message: "Login failed",
            error: error.message
        });
    }
};

// Forgot Password - Send 6-digit OTP to user's registered email
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email || !email.trim()) {
            return res.status(400).json({
                message: "Please enter your registered email address"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(404).json({
                message: "No account found with this email address"
            });
        }

        // Generate 6-digit numeric OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        user.resetPasswordOtp = otp;
        user.resetPasswordExpires = expires;
        await user.save();

        // Send OTP email
        const emailResult = await sendPasswordResetEmail({
            to: user.email,
            name: user.name,
            otp,
            expiresMinutes: 15
        });

        res.json({
            message: "A 6-digit password reset code has been sent to your email.",
            email: user.email,
            devOtp: emailResult?.notConfigured ? otp : undefined
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to process forgot password request",
            error: error.message
        });
    }
};

// Reset Password - Verify OTP and update password
const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({
                message: "Email, reset code, and new password are required"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters long"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(404).json({
                message: "Account not found"
            });
        }

        // Check if OTP matches
        if (!user.resetPasswordOtp || user.resetPasswordOtp !== otp.trim()) {
            return res.status(400).json({
                message: "Invalid reset code. Please check and try again."
            });
        }

        // Check if OTP expired
        if (!user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
            return res.status(400).json({
                message: "Reset code has expired. Please request a new one."
            });
        }

        // Hash new password and clear reset fields
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetPasswordOtp = null;
        user.resetPasswordExpires = null;
        await user.save();

        // Send notification
        await Notification.create({
            user: user._id,
            title: "Password Updated",
            message: "Your Career Horizon account password was successfully reset.",
            type: "update"
        }).catch(() => {});

        res.json({
            message: "Password reset successfully. You can now sign in with your new password."
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to reset password",
            error: error.message
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    forgotPassword,
    resetPassword
};
