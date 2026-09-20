const User = require("../models/User");

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


// Update logged-in user's profile
const updateProfile = async (req, res) => {
    try {
        const {
            name,
            phone,
            location,
            profilePicture,
            education,
            selectedFields,
            selectedSubfields
        } = req.body;

        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Update basic profile information
        if (name !== undefined) user.name = name;
        if (location !== undefined) user.location = location;
        if (profilePicture !== undefined) {
            user.profilePicture = profilePicture;
        }

        // Update education
        if (education !== undefined) {
            user.education = education;
        }

        // Update selected fields
        if (selectedFields !== undefined) {
            user.selectedFields = selectedFields;
        }

        // Update selected subfields
        if (selectedSubfields !== undefined) {
            user.selectedSubfields = selectedSubfields;
        }

        const updatedUser = await user.save();

        res.json({
            message: "Profile updated successfully",
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                education: updatedUser.education,
                location: updatedUser.location,
                profilePicture: updatedUser.profilePicture,
                selectedFields: updatedUser.selectedFields,
                selectedSubfields: updatedUser.selectedSubfields
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update profile",
            error: error.message
        });
    }
};


module.exports = {
    getProfile,
    updateProfile
};