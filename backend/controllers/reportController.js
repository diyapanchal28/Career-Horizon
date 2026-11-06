const reportService = require("../services/reportService");
const reportExportService = require("../services/reportExportService");

// Supported report registry
const REPORT_TYPES = [
    {
        id: "user_registration",
        name: "User Registration Report",
        description: "Monitor user registrations, platform growth, and active account status.",
        category: "Users & Accounts"
    },
    {
        id: "career_assessment",
        name: "Career Assessment Report",
        description: "Analyze student participation, completion rates, and completion trends.",
        category: "Assessments"
    },
    {
        id: "career_recommendation",
        name: "Career Recommendation Report",
        description: "Identify commonly recommended careers, frequencies, and match percentages.",
        category: "Guidance & Matching"
    },
    {
        id: "career_interest",
        name: "Career Interest Analysis Report",
        description: "Understand student preferences across fields, subfields, and work styles.",
        category: "Student Insights"
    },
    {
        id: "roadmap_progress",
        name: "Career Roadmap Progress Report",
        description: "Track student completion of step-by-step career milestone roadmaps.",
        category: "Roadmaps & Learning"
    },
    {
        id: "chatbot_usage",
        name: "AI Chatbot Usage Report",
        description: "Review conversation volume, messages, and student engagement trends.",
        category: "AI Guidance Assistant"
    },
    {
        id: "overall_platform",
        name: "Overall Platform Activity Report",
        description: "Comprehensive executive overview of Career Horizon platform health.",
        category: "Executive Summary"
    }
];

/**
 * Validate date filter query parameters
 */
function validateDateParams(req) {
    const { filter, startDate, endDate } = req.query;
    if (filter === "custom") {
        if (!startDate || !endDate) {
            return {
                isValid: false,
                error: "Start date and End date are required for custom date range."
            };
        }
        const s = new Date(startDate);
        const e = new Date(endDate);
        if (isNaN(s.getTime()) || isNaN(e.getTime())) {
            return {
                isValid: false,
                error: "Invalid date format. Please provide YYYY-MM-DD."
            };
        }
        if (s > e) {
            return {
                isValid: false,
                error: "Start date cannot be later than end date."
            };
        }
    }
    return { isValid: true };
}

/**
 * Helper to fetch report data by report ID and query filters
 */
async function fetchReportDataById(reportId, query) {
    const { filter, startDate, endDate } = query;
    const params = { filter, startDate, endDate };

    switch (reportId) {
        case "user_registration":
            return await reportService.getUserRegistrationReport(params);
        case "career_assessment":
            return await reportService.getCareerAssessmentReport(params);
        case "career_recommendation":
            return await reportService.getCareerRecommendationReport(params);
        case "career_interest":
            return await reportService.getCareerInterestAnalysisReport(params);
        case "roadmap_progress":
            return await reportService.getRoadmapProgressReport(params);
        case "chatbot_usage":
            return await reportService.getChatbotUsageReport(params);
        case "overall_platform":
        default:
            return await reportService.getOverallPlatformReport(params);
    }
}

// GET /api/admin/reports/types
const getReportTypes = (req, res) => {
    res.json({
        success: true,
        count: REPORT_TYPES.length,
        reportTypes: REPORT_TYPES
    });
};

// GET /api/admin/reports/users
const getUserRegistrationReport = async (req, res) => {
    try {
        const check = validateDateParams(req);
        if (!check.isValid) {
            return res.status(400).json({ message: check.error });
        }
        const data = await reportService.getUserRegistrationReport(req.query);
        res.json({ success: true, ...data });
    } catch (error) {
        console.error("User registration report error:", error);
        res.status(500).json({
            message: "Failed to generate user registration report",
            error: error.message
        });
    }
};

// GET /api/admin/reports/assessments
const getCareerAssessmentReport = async (req, res) => {
    try {
        const check = validateDateParams(req);
        if (!check.isValid) {
            return res.status(400).json({ message: check.error });
        }
        const data = await reportService.getCareerAssessmentReport(req.query);
        res.json({ success: true, ...data });
    } catch (error) {
        console.error("Career assessment report error:", error);
        res.status(500).json({
            message: "Failed to generate career assessment report",
            error: error.message
        });
    }
};

// GET /api/admin/reports/recommendations
const getCareerRecommendationReport = async (req, res) => {
    try {
        const check = validateDateParams(req);
        if (!check.isValid) {
            return res.status(400).json({ message: check.error });
        }
        const data = await reportService.getCareerRecommendationReport(req.query);
        res.json({ success: true, ...data });
    } catch (error) {
        console.error("Career recommendation report error:", error);
        res.status(500).json({
            message: "Failed to generate career recommendation report",
            error: error.message
        });
    }
};

// GET /api/admin/reports/interests
const getCareerInterestAnalysisReport = async (req, res) => {
    try {
        const check = validateDateParams(req);
        if (!check.isValid) {
            return res.status(400).json({ message: check.error });
        }
        const data = await reportService.getCareerInterestAnalysisReport(req.query);
        res.json({ success: true, ...data });
    } catch (error) {
        console.error("Career interest analysis report error:", error);
        res.status(500).json({
            message: "Failed to generate career interest report",
            error: error.message
        });
    }
};

// GET /api/admin/reports/roadmaps
const getRoadmapProgressReport = async (req, res) => {
    try {
        const check = validateDateParams(req);
        if (!check.isValid) {
            return res.status(400).json({ message: check.error });
        }
        const data = await reportService.getRoadmapProgressReport(req.query);
        res.json({ success: true, ...data });
    } catch (error) {
        console.error("Roadmap progress report error:", error);
        res.status(500).json({
            message: "Failed to generate roadmap progress report",
            error: error.message
        });
    }
};

// GET /api/admin/reports/chatbot
const getChatbotUsageReport = async (req, res) => {
    try {
        const check = validateDateParams(req);
        if (!check.isValid) {
            return res.status(400).json({ message: check.error });
        }
        const data = await reportService.getChatbotUsageReport(req.query);
        res.json({ success: true, ...data });
    } catch (error) {
        console.error("Chatbot usage report error:", error);
        res.status(500).json({
            message: "Failed to generate chatbot usage report",
            error: error.message
        });
    }
};

// GET /api/admin/reports/overview
const getOverallPlatformReport = async (req, res) => {
    try {
        const check = validateDateParams(req);
        if (!check.isValid) {
            return res.status(400).json({ message: check.error });
        }
        const data = await reportService.getOverallPlatformReport(req.query);
        res.json({ success: true, ...data });
    } catch (error) {
        console.error("Overall platform report error:", error);
        res.status(500).json({
            message: "Failed to generate overall platform activity report",
            error: error.message
        });
    }
};

// GET /api/admin/reports/export/excel
const exportExcelReport = async (req, res) => {
    try {
        const check = validateDateParams(req);
        if (!check.isValid) {
            return res.status(400).json({ message: check.error });
        }

        const reportId = req.query.type || "overall_platform";
        const reportData = await fetchReportDataById(reportId, req.query);

        const dateStamp = new Date().toISOString().split("T")[0];
        const cleanName = reportData.reportName.replace(/[^a-zA-Z0-9]/g, "");
        const filename = `CareerHorizon_${cleanName}_${dateStamp}.xlsx`;

        const excelBuffer = await reportExportService.generateExcelReport(reportData);

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${filename}"`
        );
        res.setHeader("Content-Length", excelBuffer.length);

        return res.send(excelBuffer);
    } catch (error) {
        console.error("Excel export error:", error);
        res.status(500).json({
            message: "Failed to export Excel report",
            error: error.message
        });
    }
};

// GET /api/admin/reports/export/pdf
const exportPdfReport = async (req, res) => {
    try {
        const check = validateDateParams(req);
        if (!check.isValid) {
            return res.status(400).json({ message: check.error });
        }

        const reportId = req.query.type || "overall_platform";
        const reportData = await fetchReportDataById(reportId, req.query);

        const dateStamp = new Date().toISOString().split("T")[0];
        const cleanName = reportData.reportName.replace(/[^a-zA-Z0-9]/g, "");
        const filename = `CareerHorizon_${cleanName}_${dateStamp}.pdf`;

        const pdfBuffer = await reportExportService.generatePdfReportBuffer(reportData);

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${filename}"`
        );
        res.setHeader("Content-Length", pdfBuffer.length);

        return res.send(pdfBuffer);
    } catch (error) {
        console.error("PDF export error:", error);
        res.status(500).json({
            message: "Failed to export PDF report",
            error: error.message
        });
    }
};

module.exports = {
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
};
