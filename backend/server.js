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

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

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
// Test route
app.get("/", (req, res) => {
    res.send("Career Horizon Backend is running!");
});

// MongoDB connection
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully");
    })
    .catch((error) => {
        console.log("MongoDB connection failed:", error.message);
    });

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});