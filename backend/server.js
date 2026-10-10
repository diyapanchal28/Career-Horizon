const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const fieldRoutes = require("./routes/fieldRoutes");
const subfieldRoutes = require("./routes/subfieldRoutes");
const careerRoutes = require("./routes/careerRoutes");
const roadmapRoutes = require("./routes/roadmapRoutes");
const savedCareerRoutes = require("./routes/savedCareerRoutes");
const activityRoutes = require("./routes/activityRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const userRoutes = require("./routes/userRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/fields", fieldRoutes);
app.use("/api/subfields", subfieldRoutes);
app.use("/api/careers", careerRoutes);
app.use("/api/roadmaps", roadmapRoutes);
app.use("/api/saved-careers", savedCareerRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/recommendations", recommendationRoutes);
// Test route
app.get("/", (req, res) => {
    res.send("Career Horizon Backend is running!");
});

// MongoDB connection & Default Admin Seeding
const ensureDefaultAdmin = async () => {
    try {
        const User = require("./models/User");
        const bcrypt = require("bcryptjs");
        const hashedPassword = await bcrypt.hash("admin123", 10);

        await User.findOneAndUpdate(
            { email: "admin@careerhorizon.com" },
            {
                $setOnInsert: {
                    name: "Career Horizon Admin",
                    email: "admin@careerhorizon.com",
                    password: hashedPassword,
                    assessmentCompleted: true
                },
                $set: {
                    role: "admin",
                    isActive: true
                }
            },
            { upsert: true, returnDocument: 'after' }
        );
    } catch (err) {
        console.error("Admin seed check error:", err.message);
    }
};

mongoose
    .connect(process.env.MONGO_URI)
    .then(async () => {
        console.log("MongoDB connected successfully");
        await ensureDefaultAdmin();
    })
    .catch((error) => {
        console.log("MongoDB connection failed:", error.message);
    });

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});