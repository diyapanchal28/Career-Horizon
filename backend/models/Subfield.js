const mongoose = require("mongoose");

const subfieldSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            default: ""
        },

        field: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Field",
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Subfield", subfieldSchema);