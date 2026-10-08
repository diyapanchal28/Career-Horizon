const User = require("../models/User");
const Notification = require("../models/Notification");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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

module.exports = {
    registerUser,
    loginUser
};