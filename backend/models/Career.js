const mongoose = require("mongoose");

const careerSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        slug: {
            type: String,
            trim: true
        },

        shortDescription: {
            type: String,
            default: ""
        },

        description: {
            type: String,
            default: ""
        },

        suitableFor: [
            {
                type: String
            }
        ],

        fieldId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Field",
            required: true
        },

        subfieldId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subfield",
            required: true
        },

        education: {
            minimumQualification: {
                type: String,
                default: ""
            },

            preferredDegrees: [
                {
                    type: String
                }
            ],

            certifications: [
                {
                    type: String
                }
            ],

            entryLevelNote: {
                type: String,
                default: ""
            }
        },

        technicalSkills: [
            {
                type: String
            }
        ],

        professionalSkills: [
            {
                type: String
            }
        ],

        responsibilities: [
            {
                type: String
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

        salary: {
            bands: [
                {
                    label: {
                        type: String
                    },

                    min: {
                        type: Number
                    },

                    max: {
                        type: Number
                    },

                    currency: {
                        type: String
                    },

                    period: {
                        type: String
                    }
                }
            ],

            note: {
                type: String,
                default: ""
            }
        },

        demand: {
            level: {
                type: String,
                default: ""
            },

            note: {
                type: String,
                default: ""
            }
        },

        careerGrowth: [
            {
                type: String
            }
        ],

        sources: [
            {
                type: String
            }
        ],

        overview: {
            type: String,
            default: ""
        },

        skills: [
            {
                type: String
            }
        ],

        growth: {
            type: String,
            default: ""
        },

        image: {
            type: String,
            default: ""
        },

        viewCount: {
            type: Number,
            default: 0
        },

        isActive: {
            type: Boolean,
            default: true
        },

        lastUpdated: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Career", careerSchema);