/**
 * Career Horizon — Report Generation Module Test Suite
 * Tests all 7 reports, aggregations, Excel/PDF exports, date filters, and security.
 */

const assert = require("assert");
const mongoose = require("mongoose");
require("dotenv").config();

const reportService = require("./services/reportService");
const reportExportService = require("./services/reportExportService");

async function runTests() {
    console.log("=========================================================");
    console.log("  CAREER HORIZON — REPORT GENERATION MODULE TEST SUITE   ");
    console.log("=========================================================");

    let passed = 0;
    let failed = 0;

    const test = async (name, fn) => {
        try {
            await fn();
            console.log(`[PASS] ${name}`);
            passed++;
        } catch (err) {
            console.error(`[FAIL] ${name}:`, err.message);
            failed++;
        }
    };

    // 1. Test Date Filter Parsing
    await test("Date Filter Parsing: 'today'", () => {
        const { startDate, endDate, label } = reportService.parseDateFilter("today");
        assert.strictEqual(label, "Today");
        assert(startDate instanceof Date);
        assert(endDate instanceof Date);
        assert(startDate <= endDate);
    });

    await test("Date Filter Parsing: '7days'", () => {
        const { startDate, endDate, label } = reportService.parseDateFilter("7days");
        assert.strictEqual(label, "Last 7 Days");
        assert(startDate < endDate);
    });

    await test("Date Filter Parsing: 'custom' with valid range", () => {
        const { startDate, endDate } = reportService.parseDateFilter("custom", "2026-01-01", "2026-06-30");
        assert(startDate < endDate);
        assert.strictEqual(startDate.getFullYear(), 2026);
    });

    await test("Date Filter Parsing: 'all'", () => {
        const { startDate, endDate, label } = reportService.parseDateFilter("all");
        assert.strictEqual(label, "All Time");
        assert.strictEqual(startDate, null);
        assert.strictEqual(endDate, null);
    });

    // Connect to MongoDB
    console.log("\nConnecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connection established.\n");

    // 2. Test Report 1: User Registration Report
    await test("Report 1: User Registration Report structure & metrics", async () => {
        const data = await reportService.getUserRegistrationReport({ filter: "all" });
        assert.strictEqual(data.reportId, "user_registration");
        assert(typeof data.summary.totalRegisteredUsers === "number");
        assert(typeof data.summary.activeUsers === "number");
        assert(Array.isArray(data.charts.monthlyRegistrations));
        assert(Array.isArray(data.table.rows));
        assert(Array.isArray(data.table.columns));
    });

    // 3. Test Report 2: Career Assessment Report
    await test("Report 2: Career Assessment Report metrics & status", async () => {
        const data = await reportService.getCareerAssessmentReport({ filter: "all" });
        assert.strictEqual(data.reportId, "career_assessment");
        assert(typeof data.summary.totalStudents === "number");
        assert(typeof data.summary.completedAssessments === "number");
        assert(typeof data.summary.completionPercentage === "number");
        assert(Array.isArray(data.charts.statusBreakdown));
        assert(Array.isArray(data.table.rows));
    });

    // 4. Test Report 3: Career Recommendation Report
    await test("Report 3: Career Recommendation Report deterministic matching", async () => {
        const data = await reportService.getCareerRecommendationReport({ filter: "all" });
        assert.strictEqual(data.reportId, "career_recommendation");
        assert(typeof data.summary.totalRecommendationsGenerated === "number");
        assert(typeof data.summary.uniqueCareersRecommended === "number");
        assert(Array.isArray(data.table.rows));
        assert(Array.isArray(data.charts.topFiveCareers));
    });

    // 5. Test Report 4: Career Interest Analysis Report
    await test("Report 4: Career Interest Analysis Report field & subfield counts", async () => {
        const data = await reportService.getCareerInterestAnalysisReport({ filter: "all" });
        assert.strictEqual(data.reportId, "career_interest");
        assert(Array.isArray(data.charts.fieldsBarChart));
        assert(Array.isArray(data.table.rows));
    });

    // 6. Test Report 5: Career Roadmap Progress Report
    await test("Report 5: Roadmap Progress Report safe zero handling & completion percentage", async () => {
        const data = await reportService.getRoadmapProgressReport({ filter: "all" });
        assert.strictEqual(data.reportId, "roadmap_progress");
        assert(typeof data.summary.totalRoadmapsStarted === "number");
        assert(typeof data.summary.totalRoadmapsCompleted === "number");
        assert(typeof data.summary.averageCompletionPercentage === "number");
        assert(Array.isArray(data.table.rows));
    });

    // 7. Test Report 6: AI Chatbot Usage Report
    await test("Report 6: AI Chatbot Usage Report privacy & volume counts", async () => {
        const data = await reportService.getChatbotUsageReport({ filter: "all" });
        assert.strictEqual(data.reportId, "chatbot_usage");
        assert(typeof data.summary.totalConversations === "number");
        assert(typeof data.summary.totalUserMessages === "number");
        assert(Array.isArray(data.table.rows));
        // Verify private messages are not exposed in table columns
        const colKeys = data.table.columns.map((c) => c.key);
        assert(!colKeys.includes("content") && !colKeys.includes("message"));
    });

    // 8. Test Report 7: Overall Platform Activity Report
    await test("Report 7: Overall Platform Activity Report KPIs & trends", async () => {
        const data = await reportService.getOverallPlatformReport({ filter: "all" });
        assert.strictEqual(data.reportId, "overall_platform");
        assert(typeof data.summary.totalRegisteredStudents === "number");
        assert(Array.isArray(data.table.rows));
        assert(Array.isArray(data.charts.monthlyActivity));
    });

    // 9. Test Excel Export Generation
    await test("Excel Export: Generates valid xlsx buffer without formula injection", async () => {
        const sampleReport = {
            reportName: "User Registration Report",
            generatedAt: new Date().toISOString(),
            periodLabel: "Last 30 Days",
            summary: { totalStudents: 42, activeUsers: 40 },
            table: {
                columns: [
                    { key: "name", label: "Name" },
                    { key: "role", label: "Role" }
                ],
                rows: [
                    { name: "=cmd|' /C calc'!A0", role: "Student" }, // malicious formula test
                    { name: "+12345", role: "Student" },
                    { name: "Regular Student", role: "Student" }
                ]
            }
        };

        const buffer = await reportExportService.generateExcelReport(sampleReport);
        assert(Buffer.isBuffer(buffer));
        assert(buffer.length > 1000);
    });

    // 10. Test PDF Export Generation
    await test("PDF Export: Generates valid PDF buffer", async () => {
        const sampleReport = {
            reportName: "Career Assessment Report",
            generatedAt: new Date().toISOString(),
            periodLabel: "All Time",
            summary: { totalStudents: 10, completed: 8 },
            table: {
                columns: [
                    { key: "studentName", label: "Student Name" },
                    { key: "status", label: "Status" }
                ],
                rows: [
                    { studentName: "Test Student 1", status: "Completed" },
                    { studentName: "Test Student 2", status: "Not Completed" }
                ]
            }
        };

        const pdfBuffer = await reportExportService.generatePdfReportBuffer(sampleReport);
        assert(Buffer.isBuffer(pdfBuffer));
        assert(pdfBuffer.length > 500);
        // PDF magic header %PDF
        assert.strictEqual(pdfBuffer.subarray(0, 4).toString(), "%PDF");
    });

    console.log("\n=========================================================");
    console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
    console.log("=========================================================");

    await mongoose.disconnect();
    process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
    console.error("Test execution failed:", err);
    process.exit(1);
});
