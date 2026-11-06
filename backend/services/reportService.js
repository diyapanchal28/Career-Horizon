const mongoose = require("mongoose");
const User = require("../models/User");
const Career = require("../models/Career");
const Field = require("../models/Field");
const Subfield = require("../models/Subfield");
const Roadmap = require("../models/Roadmap");
const RoadmapProgress = require("../models/RoadmapProgress");
const ChatConversation = require("../models/ChatConversation");
const ChatMessage = require("../models/ChatMessage");
const Activity = require("../models/Activity");
const { rankCareersForUser } = require("../utils/recommendationEngine");

/**
 * Standard date range builder
 * Returns { startDate: Date|null, endDate: Date|null, label: string }
 */
function parseDateFilter(filter, customStart, customEnd) {
    const now = new Date();
    let startDate = null;
    let endDate = new Date(now);

    switch (filter) {
        case "today": {
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
            endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
            return { startDate, endDate, label: "Today" };
        }
        case "7days": {
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return { startDate, endDate, label: "Last 7 Days" };
        }
        case "30days": {
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return { startDate, endDate, label: "Last 30 Days" };
        }
        case "this_month": {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
            return { startDate, endDate, label: "This Month" };
        }
        case "last_month": {
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
            endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
            return { startDate, endDate, label: "Last Month" };
        }
        case "custom": {
            if (customStart) {
                const s = new Date(customStart);
                s.setHours(0, 0, 0, 0);
                startDate = s;
            }
            if (customEnd) {
                const e = new Date(customEnd);
                e.setHours(23, 59, 59, 999);
                endDate = e;
            }
            const label = `${customStart || "Beginning"} to ${customEnd || "Now"}`;
            return { startDate, endDate, label };
        }
        case "all":
        default: {
            return { startDate: null, endDate: null, label: "All Time" };
        }
    }
}

/**
 * Helper to build a date query filter for a specific field name
 */
function buildDateQuery(fieldName, startDate, endDate) {
    const query = {};
    if (startDate && endDate) {
        query[fieldName] = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
        query[fieldName] = { $gte: startDate };
    } else if (endDate) {
        query[fieldName] = { $lte: endDate };
    }
    return query;
}

// =========================================================================
// REPORT 1: USER REGISTRATION REPORT
// =========================================================================
async function getUserRegistrationReport({ filter, startDate: sDate, endDate: eDate }) {
    const { startDate, endDate, label } = parseDateFilter(filter, sDate, eDate);

    // Filter students only (exclude admin accounts)
    const baseStudentFilter = { role: { $in: ["student", "user"] } };
    const dateQuery = buildDateQuery("createdAt", startDate, endDate);
    const periodStudentFilter = { ...baseStudentFilter, ...dateQuery };

    // 1. Total registered users (all time)
    const totalRegisteredAllTime = await User.countDocuments(baseStudentFilter);

    // 2. New registrations during the selected period
    const newRegistrationsPeriod = await User.countDocuments(periodStudentFilter);

    // 3. Active and inactive users in period
    const activeUsersCount = await User.countDocuments({
        ...periodStudentFilter,
        isActive: { $ne: false }
    });
    const inactiveUsersCount = await User.countDocuments({
        ...periodStudentFilter,
        isActive: false
    });

    // 4. Monthly registration trends (all students or in period)
    const trendMatch = startDate || endDate ? periodStudentFilter : baseStudentFilter;
    const monthlyTrends = await User.aggregate([
        { $match: trendMatch },
        {
            $group: {
                _id: {
                    $dateToString: { format: "%Y-%m", date: "$createdAt" }
                },
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } },
        {
            $project: {
                _id: 0,
                month: "$_id",
                count: 1
            }
        }
    ]);

    // 5. User registration table (limit 500 for safety)
    const users = await User.find(periodStudentFilter)
        .select("_id name email createdAt isActive role education")
        .sort({ createdAt: -1 })
        .limit(500)
        .lean();

    const tableRows = users.map((u) => ({
        userId: String(u._id),
        name: u.name || "N/A",
        email: u.email || "N/A",
        registrationDate: u.createdAt ? u.createdAt.toISOString() : "N/A",
        accountStatus: u.isActive !== false ? "Active" : "Inactive"
    }));

    return {
        reportId: "user_registration",
        reportName: "User Registration Report",
        periodLabel: label,
        startDate: startDate ? startDate.toISOString() : null,
        endDate: endDate ? endDate.toISOString() : null,
        generatedAt: new Date().toISOString(),
        summary: {
            totalRegisteredUsers: totalRegisteredAllTime,
            newRegistrations: newRegistrationsPeriod,
            activeUsers: activeUsersCount,
            inactiveUsers: inactiveUsersCount,
            activePercentage:
                newRegistrationsPeriod > 0
                    ? Math.round((activeUsersCount / newRegistrationsPeriod) * 100)
                    : 100
        },
        charts: {
            monthlyRegistrations: monthlyTrends
        },
        table: {
            columns: [
                { key: "userId", label: "User ID" },
                { key: "name", label: "Name" },
                { key: "email", label: "Email" },
                { key: "registrationDate", label: "Registration Date" },
                { key: "accountStatus", label: "Account Status" }
            ],
            rows: tableRows,
            totalRows: tableRows.length
        }
    };
}

// =========================================================================
// REPORT 2: CAREER ASSESSMENT REPORT
// =========================================================================
async function getCareerAssessmentReport({ filter, startDate: sDate, endDate: eDate }) {
    const { startDate, endDate, label } = parseDateFilter(filter, sDate, eDate);

    const baseStudentFilter = { role: { $in: ["student", "user"] } };
    const dateQuery = buildDateQuery("createdAt", startDate, endDate);
    const periodStudentFilter = { ...baseStudentFilter, ...dateQuery };

    // Total students
    const totalStudents = await User.countDocuments(periodStudentFilter);

    // Completed assessments
    const completedStudents = await User.countDocuments({
        ...periodStudentFilter,
        assessmentCompleted: true
    });

    // Incomplete assessments
    const incompleteStudents = Math.max(0, totalStudents - completedStudents);

    // Completion percentage
    const completionPercentage =
        totalStudents > 0 ? Math.round((completedStudents / totalStudents) * 100) : 0;

    // Monthly assessment completion trends
    const completionDateQuery = buildDateQuery(
        "assessmentCompletedAt",
        startDate,
        endDate
    );
    const monthlyCompletions = await User.aggregate([
        {
            $match: {
                role: { $in: ["student", "user"] },
                assessmentCompleted: true,
                ...(startDate || endDate ? completionDateQuery : {})
            }
        },
        {
            $project: {
                effectiveDate: {
                    $ifNull: ["$assessmentCompletedAt", "$updatedAt"]
                }
            }
        },
        {
            $group: {
                _id: {
                    $dateToString: { format: "%Y-%m", date: "$effectiveDate" }
                },
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } },
        {
            $project: {
                _id: 0,
                month: "$_id",
                count: 1
            }
        }
    ]);

    // Table rows
    const students = await User.find(periodStudentFilter)
        .select("_id name email assessmentCompleted assessmentCompletedAt updatedAt")
        .sort({ assessmentCompleted: -1, assessmentCompletedAt: -1, createdAt: -1 })
        .limit(500)
        .lean();

    const tableRows = students.map((s) => ({
        studentId: String(s._id),
        studentName: s.name || "N/A",
        assessmentStatus: s.assessmentCompleted ? "Completed" : "Not Completed",
        completionDate: s.assessmentCompleted
            ? (s.assessmentCompletedAt || s.updatedAt || new Date()).toISOString()
            : "N/A"
    }));

    return {
        reportId: "career_assessment",
        reportName: "Career Assessment Report",
        periodLabel: label,
        startDate: startDate ? startDate.toISOString() : null,
        endDate: endDate ? endDate.toISOString() : null,
        generatedAt: new Date().toISOString(),
        summary: {
            totalStudents,
            completedAssessments: completedStudents,
            notCompletedAssessments: incompleteStudents,
            completionPercentage
        },
        charts: {
            statusBreakdown: [
                { name: "Completed", value: completedStudents },
                { name: "Not Completed", value: incompleteStudents }
            ],
            monthlyTrends: monthlyCompletions
        },
        table: {
            columns: [
                { key: "studentId", label: "Student ID" },
                { key: "studentName", label: "Student Name" },
                { key: "assessmentStatus", label: "Assessment Status" },
                { key: "completionDate", label: "Completion Date" }
            ],
            rows: tableRows,
            totalRows: tableRows.length
        }
    };
}

// =========================================================================
// REPORT 3: CAREER RECOMMENDATION REPORT
// =========================================================================
async function getCareerRecommendationReport({ filter, startDate: sDate, endDate: eDate }) {
    const { startDate, endDate, label } = parseDateFilter(filter, sDate, eDate);

    const baseFilter = {
        role: { $in: ["student", "user"] },
        assessmentCompleted: true
    };
    const dateQuery = buildDateQuery("createdAt", startDate, endDate);
    const studentFilter = { ...baseFilter, ...dateQuery };

    // Fetch assessed students in period
    const assessedStudents = await User.find(studentFilter)
        .populate("selectedFields", "name")
        .populate("selectedSubfields", "name")
        .lean();

    // Fetch active careers
    const careers = await Career.find({ isActive: { $ne: false } })
        .populate("fieldId", "name")
        .populate("subfieldId", "name")
        .lean();

    // Tally career recommendations based on deterministic engine
    const careerTally = new Map();

    let totalRecommendations = 0;
    let totalScoreSum = 0;

    for (const student of assessedStudents) {
        // Get ranked recommendations for this student
        const ranked = rankCareersForUser(student, careers);
        // Take top 3 recommendations per assessed student
        const topMatches = ranked.slice(0, 3);

        for (const item of topMatches) {
            const cId = String(item.career._id);
            const cName = item.career.name || "Unknown Career";
            const score = item.matchPercentage || 0;

            if (!careerTally.has(cId)) {
                careerTally.set(cId, {
                    careerId: cId,
                    careerName: cName,
                    fieldName: item.career.fieldId?.name || "General",
                    count: 0,
                    totalScore: 0
                });
            }

            const stat = careerTally.get(cId);
            stat.count += 1;
            stat.totalScore += score;
            totalRecommendations += 1;
            totalScoreSum += score;
        }
    }

    const aggregatedCareers = Array.from(careerTally.values()).map((c) => ({
        careerId: c.careerId,
        careerName: c.careerName,
        fieldName: c.fieldName,
        recommendationCount: c.count,
        averageMatchPercentage: c.count > 0 ? Math.round(c.totalScore / c.count) : 0
    }));

    // Sort by recommendation count descending, then match percentage
    aggregatedCareers.sort((a, b) => {
        if (b.recommendationCount !== a.recommendationCount) {
            return b.recommendationCount - a.recommendationCount;
        }
        return b.averageMatchPercentage - a.averageMatchPercentage;
    });

    const topFiveCareers = aggregatedCareers.slice(0, 5);
    const overallAvgMatch =
        totalRecommendations > 0 ? Math.round(totalScoreSum / totalRecommendations) : 0;

    return {
        reportId: "career_recommendation",
        reportName: "Career Recommendation Report",
        periodLabel: label,
        startDate: startDate ? startDate.toISOString() : null,
        endDate: endDate ? endDate.toISOString() : null,
        generatedAt: new Date().toISOString(),
        summary: {
            totalRecommendationsGenerated: totalRecommendations,
            uniqueCareersRecommended: aggregatedCareers.length,
            averageMatchPercentage: overallAvgMatch,
            mostRecommendedCareer: aggregatedCareers[0]?.careerName || "N/A"
        },
        charts: {
            topFiveCareers: topFiveCareers.map((c) => ({
                name: c.careerName,
                count: c.recommendationCount,
                avgScore: c.averageMatchPercentage
            })),
            distribution: aggregatedCareers.slice(0, 10).map((c) => ({
                name: c.careerName,
                value: c.recommendationCount
            }))
        },
        table: {
            columns: [
                { key: "careerName", label: "Career Name" },
                { key: "recommendationCount", label: "Recommendation Count" },
                { key: "averageMatchPercentage", label: "Average Match Percentage" }
            ],
            rows: aggregatedCareers.map((c) => ({
                careerName: c.careerName,
                recommendationCount: c.recommendationCount,
                averageMatchPercentage: `${c.averageMatchPercentage}%`
            })),
            totalRows: aggregatedCareers.length
        }
    };
}

// =========================================================================
// REPORT 4: CAREER INTEREST ANALYSIS REPORT
// =========================================================================
async function getCareerInterestAnalysisReport({ filter, startDate: sDate, endDate: eDate }) {
    const { startDate, endDate, label } = parseDateFilter(filter, sDate, eDate);

    const baseFilter = {
        role: { $in: ["student", "user"] },
        assessmentCompleted: true
    };
    const dateQuery = buildDateQuery("createdAt", startDate, endDate);
    const studentFilter = { ...baseFilter, ...dateQuery };

    const totalAssessedStudents = await User.countDocuments(studentFilter);

    // 1. Field selection frequency
    const fieldCounts = await User.aggregate([
        { $match: studentFilter },
        { $unwind: "$selectedFields" },
        {
            $group: {
                _id: "$selectedFields",
                count: { $sum: 1 }
            }
        },
        {
            $lookup: {
                from: "fields",
                localField: "_id",
                foreignField: "_id",
                as: "fieldInfo"
            }
        },
        { $unwind: "$fieldInfo" },
        {
            $project: {
                _id: 1,
                fieldName: "$fieldInfo.name",
                count: 1
            }
        },
        { $sort: { count: -1 } }
    ]);

    // 2. Subfield selection frequency
    const subfieldCounts = await User.aggregate([
        { $match: studentFilter },
        { $unwind: "$selectedSubfields" },
        {
            $group: {
                _id: "$selectedSubfields",
                count: { $sum: 1 }
            }
        },
        {
            $lookup: {
                from: "subfields",
                localField: "_id",
                foreignField: "_id",
                as: "subfieldInfo"
            }
        },
        { $unwind: "$subfieldInfo" },
        {
            $lookup: {
                from: "fields",
                localField: "subfieldInfo.field",
                foreignField: "_id",
                as: "parentField"
            }
        },
        {
            $project: {
                _id: 1,
                subfieldName: "$subfieldInfo.name",
                fieldName: {
                    $ifNull: [{ $arrayElemAt: ["$parentField.name", 0] }, "General"]
                },
                count: 1
            }
        },
        { $sort: { count: -1 } }
    ]);

    // 3. Work interests frequency
    const workInterestCounts = await User.aggregate([
        { $match: studentFilter },
        { $unwind: "$workInterests" },
        {
            $group: {
                _id: "$workInterests",
                count: { $sum: 1 }
            }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
    ]);

    // 4. Work preference distribution
    const workPrefCounts = await User.aggregate([
        { $match: studentFilter },
        { $unwind: "$workPreferences" },
        {
            $group: {
                _id: "$workPreferences",
                count: { $sum: 1 }
            }
        },
        { $sort: { count: -1 } },
        { $limit: 8 }
    ]);

    // Table rows combining fields & subfields
    const tableRows = subfieldCounts.map((sub) => {
        const pct =
            totalAssessedStudents > 0
                ? Math.round((sub.count / totalAssessedStudents) * 100)
                : 0;
        return {
            fieldName: sub.fieldName || "General",
            subfieldName: sub.subfieldName || "N/A",
            numberOfStudents: sub.count,
            percentageOfStudents: `${pct}%`
        };
    });

    return {
        reportId: "career_interest",
        reportName: "Career Interest Analysis Report",
        periodLabel: label,
        startDate: startDate ? startDate.toISOString() : null,
        endDate: endDate ? endDate.toISOString() : null,
        generatedAt: new Date().toISOString(),
        summary: {
            totalAssessedStudents,
            mostSelectedField: fieldCounts[0]?.fieldName || "N/A",
            mostSelectedSubfield: subfieldCounts[0]?.subfieldName || "N/A",
            topWorkInterest: workInterestCounts[0]?._id || "N/A"
        },
        charts: {
            fieldsBarChart: fieldCounts.map((f) => ({
                name: f.fieldName,
                students: f.count,
                percentage:
                    totalAssessedStudents > 0
                        ? Math.round((f.count / totalAssessedStudents) * 100)
                        : 0
            })),
            subfieldsHorizontalChart: subfieldCounts.slice(0, 10).map((s) => ({
                name: s.subfieldName,
                field: s.fieldName,
                students: s.count
            })),
            workPreferencesChart: workPrefCounts.map((p) => ({
                name: p._id,
                value: p.count
            }))
        },
        table: {
            columns: [
                { key: "fieldName", label: "Field Name" },
                { key: "subfieldName", label: "Subfield Name" },
                { key: "numberOfStudents", label: "Number of Students" },
                { key: "percentageOfStudents", label: "Percentage of Students" }
            ],
            rows: tableRows,
            totalRows: tableRows.length
        }
    };
}

// =========================================================================
// REPORT 5: CAREER ROADMAP PROGRESS REPORT
// =========================================================================
async function getRoadmapProgressReport({ filter, startDate: sDate, endDate: eDate }) {
    const { startDate, endDate, label } = parseDateFilter(filter, sDate, eDate);

    const dateQuery = buildDateQuery("startedAt", startDate, endDate);

    // Fetch progress items
    const progressList = await RoadmapProgress.find(dateQuery)
        .populate("userId", "name email")
        .populate("careerId", "name")
        .populate("roadmapId", "title steps")
        .sort({ lastActivityAt: -1, createdAt: -1 })
        .lean();

    // Map through progress records and evaluate completion percentages
    let completedCount = 0;
    let inProgressCount = 0;
    let justStartedCount = 0;
    let totalPctSum = 0;
    const studentUserIds = new Set();
    const careerFrequency = new Map();

    const tableRows = [];

    for (const p of progressList) {
        if (p.userId) {
            studentUserIds.add(String(p.userId._id || p.userId));
        }

        const roadmapSteps = p.roadmapId?.steps || [];
        const totalSteps = roadmapSteps.length;
        const completedStepCount = (p.completedStepIds || []).length;

        // Completion percentage formula safely handling zero steps
        const percentage =
            totalSteps > 0
                ? Math.min(100, Math.round((completedStepCount / totalSteps) * 100))
                : 0;

        let status = "Just Started";
        if (percentage >= 100 && totalSteps > 0) {
            status = "Completed";
            completedCount += 1;
        } else if (percentage > 0) {
            status = "In Progress";
            inProgressCount += 1;
        } else {
            justStartedCount += 1;
        }

        totalPctSum += percentage;

        const careerName =
            p.careerId?.name || p.roadmapId?.title || "Career Roadmap";

        // Tally frequency
        careerFrequency.set(careerName, (careerFrequency.get(careerName) || 0) + 1);

        tableRows.push({
            studentId: p.userId ? String(p.userId._id || p.userId) : "N/A",
            studentName: p.userId?.name || "Student",
            careerRoadmap: careerName,
            totalSteps,
            completedSteps: completedStepCount,
            completionPercentage: `${percentage}%`,
            percentageNumber: percentage,
            status
        });
    }

    const totalRoadmapsStarted = progressList.length;
    const avgPercentage =
        totalRoadmapsStarted > 0
            ? Math.round(totalPctSum / totalRoadmapsStarted)
            : 0;

    // Sort roadmaps by popularity
    const topSelectedRoadmaps = Array.from(careerFrequency.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);

    return {
        reportId: "roadmap_progress",
        reportName: "Career Roadmap Progress Report",
        periodLabel: label,
        startDate: startDate ? startDate.toISOString() : null,
        endDate: endDate ? endDate.toISOString() : null,
        generatedAt: new Date().toISOString(),
        summary: {
            totalStudentsUsingRoadmaps: studentUserIds.size,
            totalRoadmapsStarted,
            totalRoadmapsCompleted: completedCount,
            inProgressRoadmaps: inProgressCount,
            justStartedRoadmaps: justStartedCount,
            averageCompletionPercentage: avgPercentage,
            mostSelectedRoadmap: topSelectedRoadmaps[0]?.name || "N/A"
        },
        charts: {
            statusDistribution: [
                { name: "Completed", value: completedCount },
                { name: "In Progress", value: inProgressCount },
                { name: "Just Started", value: justStartedCount }
            ],
            topRoadmapsBarChart: topSelectedRoadmaps
        },
        table: {
            columns: [
                { key: "studentId", label: "Student ID" },
                { key: "careerRoadmap", label: "Career Roadmap" },
                { key: "totalSteps", label: "Total Steps" },
                { key: "completedSteps", label: "Completed Steps" },
                { key: "completionPercentage", label: "Completion Percentage" },
                { key: "status", label: "Status" }
            ],
            rows: tableRows,
            totalRows: tableRows.length
        }
    };
}

// =========================================================================
// REPORT 6: AI CHATBOT USAGE REPORT
// =========================================================================
async function getChatbotUsageReport({ filter, startDate: sDate, endDate: eDate }) {
    const { startDate, endDate, label } = parseDateFilter(filter, sDate, eDate);

    const convDateQuery = buildDateQuery("createdAt", startDate, endDate);
    const msgDateQuery = buildDateQuery("createdAt", startDate, endDate);

    // 1. Total conversations
    const totalConversations = await ChatConversation.countDocuments(convDateQuery);

    // 2. Total user messages
    const totalUserMessages = await ChatMessage.countDocuments({
        role: "user",
        ...msgDateQuery
    });

    // 3. Unique students who used chatbot
    const uniqueUserIds = await ChatConversation.distinct("userId", convDateQuery);
    const uniqueStudentsCount = uniqueUserIds.length;

    // 4. Average messages per conversation
    const avgMessagesPerConv =
        totalConversations > 0
            ? Number((totalUserMessages / totalConversations).toFixed(1))
            : 0;

    // 5. Daily or monthly usage statistics (grouped by date)
    const dailyConvs = await ChatConversation.aggregate([
        { $match: convDateQuery },
        {
            $group: {
                _id: {
                    $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                },
                conversations: { $sum: 1 },
                uniqueUsers: { $addToSet: "$userId" }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    const dailyMsgs = await ChatMessage.aggregate([
        {
            $match: {
                role: "user",
                ...msgDateQuery
            }
        },
        {
            $group: {
                _id: {
                    $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                },
                userMessages: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    // Merge date aggregates
    const dateMap = new Map();

    dailyConvs.forEach((c) => {
        dateMap.set(c._id, {
            date: c._id,
            conversations: c.conversations,
            uniqueUsers: c.uniqueUsers?.length || 0,
            userMessages: 0
        });
    });

    dailyMsgs.forEach((m) => {
        if (!dateMap.has(m._id)) {
            dateMap.set(m._id, {
                date: m._id,
                conversations: 0,
                uniqueUsers: 0,
                userMessages: m.userMessages
            });
        } else {
            dateMap.get(m._id).userMessages = m.userMessages;
        }
    });

    const tableRows = Array.from(dateMap.values()).sort((a, b) =>
        b.date.localeCompare(a.date)
    );

    const trendChartData = [...tableRows].reverse().map((r) => ({
        date: r.date,
        conversations: r.conversations,
        userMessages: r.userMessages,
        uniqueUsers: r.uniqueUsers
    }));

    return {
        reportId: "chatbot_usage",
        reportName: "AI Chatbot Usage Report",
        periodLabel: label,
        startDate: startDate ? startDate.toISOString() : null,
        endDate: endDate ? endDate.toISOString() : null,
        generatedAt: new Date().toISOString(),
        summary: {
            totalConversations,
            totalUserMessages,
            uniqueStudents: uniqueStudentsCount,
            averageMessagesPerConversation: avgMessagesPerConv
        },
        charts: {
            usageTrend: trendChartData
        },
        table: {
            columns: [
                { key: "date", label: "Date" },
                { key: "conversations", label: "Number of Conversations" },
                { key: "userMessages", label: "User Messages" },
                { key: "uniqueUsers", label: "Unique Users" }
            ],
            rows: tableRows,
            totalRows: tableRows.length
        }
    };
}

// =========================================================================
// REPORT 7: OVERALL PLATFORM ACTIVITY REPORT
// =========================================================================
async function getOverallPlatformReport({ filter, startDate: sDate, endDate: eDate }) {
    const { startDate, endDate, label } = parseDateFilter(filter, sDate, eDate);

    const studentBase = { role: { $in: ["student", "user"] } };
    const dateQueryCreated = buildDateQuery("createdAt", startDate, endDate);
    const dateQueryStarted = buildDateQuery("startedAt", startDate, endDate);

    // Total registered students all time & new in period
    const totalStudents = await User.countDocuments(studentBase);
    const newRegistrations = await User.countDocuments({
        ...studentBase,
        ...dateQueryCreated
    });

    // Assessments completed in period
    const assessmentsCompleted = await User.countDocuments({
        ...studentBase,
        assessmentCompleted: true,
        ...(startDate || endDate
            ? buildDateQuery("assessmentCompletedAt", startDate, endDate)
            : {})
    });

    // Active roadmaps started & completed in period
    const roadmapsStarted = await RoadmapProgress.countDocuments(dateQueryStarted);
    const allProgressInPeriod = await RoadmapProgress.find(dateQueryStarted)
        .populate("roadmapId", "steps")
        .lean();

    let roadmapsCompleted = 0;
    allProgressInPeriod.forEach((p) => {
        const total = p.roadmapId?.steps?.length || 0;
        const done = (p.completedStepIds || []).length;
        if (total > 0 && done >= total) {
            roadmapsCompleted += 1;
        }
    });

    // Chatbot conversations in period
    const chatbotConversations = await ChatConversation.countDocuments(dateQueryCreated);

    // Activities in period (from Activity collection)
    const totalPlatformActivities = await Activity.countDocuments(dateQueryCreated);

    // Monthly engagement comparative trends
    const monthlyRegistrations = await User.aggregate([
        { $match: studentBase },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    const monthlyActivities = await Activity.aggregate([
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    // Merge monthly trends
    const monthSet = new Set([
        ...monthlyRegistrations.map((r) => r._id),
        ...monthlyActivities.map((a) => a._id)
    ]);

    const regMap = new Map(monthlyRegistrations.map((r) => [r._id, r.count]));
    const actMap = new Map(monthlyActivities.map((a) => [a._id, a.count]));

    const monthlyTrends = Array.from(monthSet)
        .sort()
        .slice(-12)
        .map((month) => ({
            month,
            newUsers: regMap.get(month) || 0,
            engagementEvents: actMap.get(month) || 0
        }));

    const comparativeRows = [
        { metric: "Total Registered Students", value: totalStudents, periodContext: "Platform Total" },
        { metric: "New Student Registrations", value: newRegistrations, periodContext: label },
        { metric: "Assessment Completions", value: assessmentsCompleted, periodContext: label },
        { metric: "Career Roadmaps Started", value: roadmapsStarted, periodContext: label },
        { metric: "Career Roadmaps Completed", value: roadmapsCompleted, periodContext: label },
        { metric: "AI Chatbot Conversations", value: chatbotConversations, periodContext: label },
        { metric: "Platform Activity Logs", value: totalPlatformActivities, periodContext: label }
    ];

    return {
        reportId: "overall_platform",
        reportName: "Overall Platform Activity Report",
        periodLabel: label,
        startDate: startDate ? startDate.toISOString() : null,
        endDate: endDate ? endDate.toISOString() : null,
        generatedAt: new Date().toISOString(),
        summary: {
            totalRegisteredStudents: totalStudents,
            newRegistrations,
            assessmentCompletions: assessmentsCompleted,
            roadmapsStarted,
            roadmapsCompleted,
            chatbotConversations,
            totalPlatformActivities
        },
        charts: {
            monthlyActivity: monthlyTrends,
            kpiBreakdown: [
                { name: "New Users", value: newRegistrations },
                { name: "Assessments", value: assessmentsCompleted },
                { name: "Roadmaps", value: roadmapsStarted },
                { name: "Chatbot Sessions", value: chatbotConversations }
            ]
        },
        table: {
            columns: [
                { key: "metric", label: "Platform Engagement Metric" },
                { key: "value", label: "Current Metric Value" },
                { key: "periodContext", label: "Reporting Window" }
            ],
            rows: comparativeRows,
            totalRows: comparativeRows.length
        }
    };
}

module.exports = {
    parseDateFilter,
    getUserRegistrationReport,
    getCareerAssessmentReport,
    getCareerRecommendationReport,
    getCareerInterestAnalysisReport,
    getRoadmapProgressReport,
    getChatbotUsageReport,
    getOverallPlatformReport
};
