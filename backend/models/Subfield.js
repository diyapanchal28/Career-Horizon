const mongoose = require("mongoose");

const subfieldSchema = new mongoose.Schema(
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

        description: {
            type: String,
            default: ""
        },

        field: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Field",
            required: false
        },

        fieldId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Field",
            required: false
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Subfield", subfieldSchema);