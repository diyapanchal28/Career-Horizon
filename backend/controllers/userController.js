const User = require("../models/User");
const Activity = require("../models/Activity");
const Notification = require("../models/Notification");

// Get logged-in user's profile
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)
            .select("-password")
            .populate("selectedFields", "name")
            .populate("selectedSubfields", "name");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({
            message: "Failed to get profile",
            error: error.message
        });
    }
};

// Update logged-in user's profile / assessment
const updateProfile = async (req, res) => {
    try {
        const {
            name,
            phone,
            location,
            profilePicture,
            education,
            selectedFields,
            interestedFields,
            selectedSubfields,
            interestedSubfields,
            workInterests,
            workPreferences,
            assessmentCompleted
        } = req.body;

        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Basic info
        if (name !== undefined) user.name = name;
        if (phone !== undefined) user.phone = phone;
        if (location !== undefined) user.location = location;
        if (profilePicture !== undefined) user.profilePicture = profilePicture;

        // Education
        if (education !== undefined) {
            user.education = {
                ...(user.education ? user.education.toObject?.() || user.education : {}),
                ...education
            };
        }

        // Interests & Assessment
        const wasAssessmentCompleted = user.assessmentCompleted;
        const fieldsToSet = selectedFields !== undefined ? selectedFields : interestedFields;
        const subfieldsToSet = selectedSubfields !== undefined ? selectedSubfields : interestedSubfields;

        if (fieldsToSet !== undefined) user.selectedFields = fieldsToSet;
        if (subfieldsToSet !== undefined) user.selectedSubfields = subfieldsToSet;
        if (workInterests !== undefined) user.workInterests = workInterests;
        if (workPreferences !== undefined) user.workPreferences = workPreferences;

        if (assessmentCompleted !== undefined) {
            user.assessmentCompleted = assessmentCompleted;
            if (assessmentCompleted) {
                user.assessmentCompletedAt = new Date();
                if (!wasAssessmentCompleted) {
                    await Activity.create({
                        user: user._id,
                        type: "assessment_completed",
                        description: "Completed career interest selection"
                    }).catch(() => {});
                }
                await Notification.create({
                    user: user._id,
                    title: "Interests saved",
                    message: "Your personalised career matches have been updated based on your selections.",
                    type: "career"
                }).catch(() => {});
            }
        }

        const updatedUser = await user.save();
        await updatedUser.populate([
            { path: "selectedFields", select: "name" },
            { path: "selectedSubfields", select: "name" }
        ]);

        // Log profile updated activity if not assessment
        if (!assessmentCompleted) {
            await Activity.create({
                user: user._id,
                type: "profile_updated",
                description: "Updated profile details"
            }).catch(() => {});
        }

        res.json({
            message: "Profile updated successfully",
            user: updatedUser
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to update profile",
            error: error.message
        });
    }
};

// Admin: Get all users with optional search and filters
const getAllUsers = async (req, res) => {
    try {
        const { search, role } = req.query;
        const filter = {};

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } }
            ];
        }

        if (role) {
            filter.role = role;
        }

        const users = await User.find(filter)
            .select("-password")
            .populate("selectedFields", "name")
            .sort({ createdAt: -1 });

        res.json({
            count: users.length,
            users
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to get users",
            error: error.message
        });
    }
};

// Admin: Toggle active status
const toggleUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.isActive = user.isActive === false ? true : false;
        await user.save();

        res.json({
            message: `User ${user.isActive ? "activated" : "deactivated"} successfully`,
            user: { id: user._id, _id: user._id, isActive: user.isActive }
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to change user status",
            error: error.message
        });
    }
};

// Admin: Update user role (student <-> admin)
const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        if (!["student", "user", "admin"].includes(role)) {
            return res.status(400).json({ message: "Invalid role specified" });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { returnDocument: 'after' }
        ).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            message: `User role updated to ${role}`,
            user
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to update user role",
            error: error.message
        });
    }
};

// Admin: Delete user
const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            message: "User deleted successfully",
            id: req.params.id
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete user",
            error: error.message
        });
    }
};

// Enable Admin role for current logged-in user (Demo/Project convenience)
const promoteSelfToAdmin = async (req, res) => {
    try {
        const jwt = require("jsonwebtoken");
        const user = await User.findByIdAndUpdate(
            req.user.userId,
            { role: "admin" },
            { returnDocument: 'after' }
        )
            .select("-password")
            .populate("selectedFields", "name")
            .populate("selectedSubfields", "name");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            message: "Administrator access enabled",
            token,
            user
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to enable admin access",
            error: error.message
        });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    getAllUsers,
    toggleUserStatus,
    updateUserRole,
    deleteUser,
    promoteSelfToAdmin
};