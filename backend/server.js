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
const chatbotRoutes = require("./routes/chatbotRoutes");

const app = express();

// Allowed origins for CORS (Local development + Production Vercel domain)
const allowedOrigins = [
    process.env.CLIENT_URL,
    process.env.FRONTEND_URL,
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173"
].filter(Boolean);

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow server-to-server, curl, mobile, or requests without origin
            if (!origin) return callback(null, true);

            // Allow matched origins in allowedOrigins list
            const isExplicitlyAllowed = allowedOrigins.some(
                (allowed) => origin === allowed || origin.startsWith(allowed)
            );

            // Also automatically allow any Vercel preview or production deployments
            const isVercelDomain = origin.endsWith(".vercel.app");

            if (isExplicitlyAllowed || isVercelDomain) {
                return callback(null, true);
            }

            // Fallback for non-matching origins (in development or custom domains)
            return callback(null, true);
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"]
    })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Lightweight health check endpoint for monitoring & Render keep-alive
app.get("/api/health", (req, res) => {
    res.status(200).json({
        status: "success",
        message: "Career Horizon backend is running"
    });
});

// Root test route
app.get("/", (req, res) => {
    res.send("Career Horizon Backend is running!");
});

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
app.use("/api/chatbot", chatbotRoutes);

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

// Start server (Render provides the PORT environment variable)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
