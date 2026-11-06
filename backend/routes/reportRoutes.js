const express = require("express");
const {
    getReportTypes,
    getUserRegistrationReport,
    getCareerAssessmentReport,
    getCareerRecommendationReport,
    getCareerInterestAnalysisReport,
    getRoadmapProgressReport,
    getChatbotUsageReport,
    getOverallPlatformReport,
    exportExcelReport,
    exportPdfReport
} = require("../controllers/reportController");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();

// Enforce authentication & admin authorization on all report routes
router.use(protect);
router.use(adminOnly);

// Report metadata & types
router.get("/types", getReportTypes);

// Individual Reports
router.get("/users", getUserRegistrationReport);
router.get("/assessments", getCareerAssessmentReport);
router.get("/recommendations", getCareerRecommendationReport);
router.get("/interests", getCareerInterestAnalysisReport);
router.get("/roadmaps", getRoadmapProgressReport);
router.get("/chatbot", getChatbotUsageReport);
router.get("/overview", getOverallPlatformReport);

// Exports
router.get("/export/excel", exportExcelReport);
router.get("/export/pdf", exportPdfReport);

module.exports = router;
