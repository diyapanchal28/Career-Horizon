const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },

        password: {
            type: String,
            required: true
        },

        role: {
            type: String,
            enum: ["student", "user", "admin"],
            default: "student"
        },

        phone: {
            type: String,
            default: ""
        },

        location: {
            type: String,
            default: ""
        },

        profilePicture: {
            type: String,
            default: ""
        },

        isActive: {
            type: Boolean,
            default: true
        },

        education: {
            level: {
                type: String,
                default: ""
            },
            course: {
                type: String,
                default: ""
            },
            degree: {
                type: String,
                default: ""
            },
            specialization: {
                type: String,
                default: ""
            },
            college: {
                type: String,
                default: ""
            },
            institution: {
                type: String,
                default: ""
            },
            currentYear: {
                type: String,
                default: ""
            },
            expectedGraduation: {
                type: String,
                default: ""
            },
            graduationYear: {
                type: Number
            }
        },

        selectedFields: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Field"
            }
        ],

        selectedSubfields: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Subfield"
            }
        ],

        workInterests: [
            {
                type: String
            }
        ],

        workPreferences: [
            {
                type: String
            }
        ],

        assessmentCompleted: {
            type: Boolean,
            default: false
        },

        assessmentCompletedAt: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);