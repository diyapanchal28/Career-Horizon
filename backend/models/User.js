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
            enum: ["student", "admin"],
            default: "student"
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
            specialization: {
                type: String,
                default: ""
            },
            college: {
                type: String,
                default: ""
            },
            graduationYear: {
                type: Number
            }
        },

        location: {
            type: String,
            default: ""
        },

        profilePicture: {
            type: String,
            default: ""
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
        ]
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);