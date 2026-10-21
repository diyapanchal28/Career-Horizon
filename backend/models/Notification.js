const mongoose = require("mongoose");
const { sendNotificationEmail } = require("../utils/emailService");

const notificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        title: {
            type: String,
            required: true
        },

        message: {
            type: String,
            required: true
        },

        type: {
            type: String,
            enum: [
                "career",
                "roadmap",
                "update",
                "general"
            ],
            default: "general"
        },

        isRead: {
            type: Boolean,
            default: false
        },

        emailSent: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

// Post-save hook: automatically dispatch email notification to user
notificationSchema.post("save", async function (doc) {
    // Only attempt if not already marked as sent
    if (doc.emailSent) return;

    try {
        const userId = doc.user?._id || doc.user;
        let recipientEmail = doc.user?.email;
        let recipientName = doc.user?.name;

        if (!recipientEmail && userId) {
            const User = mongoose.model("User");
            const user = await User.findById(userId).select("name email");
            if (user) {
                recipientEmail = user.email;
                recipientName = user.name;
            }
        }

        if (recipientEmail) {
            const result = await sendNotificationEmail({
                to: recipientEmail,
                name: recipientName || "Student",
                title: doc.title,
                message: doc.message,
                type: doc.type
            });

            if (result && result.success) {
                await mongoose.model("Notification").updateOne(
                    { _id: doc._id },
                    { $set: { emailSent: true } }
                );
            }
        }
    } catch (err) {
        console.error("[Notification] Error dispatching email in post-save hook:", err.message);
    }
});

module.exports = mongoose.model("Notification", notificationSchema);
