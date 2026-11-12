const Gamification = require("../models/Gamification");
const GamificationLog = require("../models/GamificationLog");
const Career = require("../models/Career");
const Activity = require("../models/Activity");
const Notification = require("../models/Notification");

// Levels Configuration
const LEVELS = [
    { level: 1, name: "Beginner", minXp: 0, nextXp: 100 },
    { level: 2, name: "Explorer", minXp: 100, nextXp: 300 },
    { level: 3, name: "Learner", minXp: 300, nextXp: 600 },
    { level: 4, name: "Achiever", minXp: 600, nextXp: 1000 },
    { level: 5, name: "Professional", minXp: 1000, nextXp: 1500 },
    { level: 6, name: "Career Champion", minXp: 1500, nextXp: 1500 }
];

// Initial Badges Definition (8 Required Badges)
const INITIAL_BADGES = [
    {
        badgeId: "first_step",
        name: "First Step",
        description: "Began your journey by finishing your first roadmap milestone task.",
        condition: "Complete the first roadmap task",
        icon: "footprints",
        category: "roadmap",
        targetProgress: 1
    },
    {
        badgeId: "career_explorer",
        name: "Career Explorer",
        description: "Demonstrated real career curiosity by completing 5 roadmap tasks.",
        condition: "Complete 5 roadmap tasks",
        icon: "compass",
        category: "roadmap",
        targetProgress: 5
    },
    {
        badgeId: "consistency_champion",
        name: "Consistency Champion",
        description: "Built a solid learning habit with a 7-day consecutive streak.",
        condition: "Maintain a 7-day learning streak",
        icon: "flame",
        category: "streak",
        targetProgress: 7
    },
    {
        badgeId: "dedicated_learner",
        name: "Dedicated Learner",
        description: "Exhibited unmatched discipline by maintaining a 30-day streak.",
        condition: "Maintain a 30-day learning streak",
        icon: "trophy",
        category: "streak",
        targetProgress: 30
    },
    {
        badgeId: "goal_getter",
        name: "Goal Getter",
        description: "Crushed your weekly targets by successfully completing 5 weekly goals.",
        condition: "Complete 5 weekly goals",
        icon: "target",
        category: "goals",
        targetProgress: 5
    },
    {
        badgeId: "roadmap_master",
        name: "Roadmap Master",
        description: "Achieved 100% completion of an entire career roadmap.",
        condition: "Complete an entire career roadmap",
        icon: "crown",
        category: "roadmap",
        targetProgress: 1
    },
    {
        badgeId: "skill_builder",
        name: "Skill Builder",
        description: "Actively honed your abilities by completing 10 learning activities.",
        condition: "Complete 10 learning activities",
        icon: "zap",
        category: "skills",
        targetProgress: 10
    },
    {
        badgeId: "interview_ready",
        name: "Interview Ready",
        description: "Sharpened your interview skills by completing 5 mock interview sessions.",
        condition: "Complete 5 mock interviews",
        icon: "mic",
        category: "interviews",
        targetProgress: 5
    }
];

// Roadmap Milestones Configuration
const MILESTONE_DEFS = [
    { percent: 10, title: "Beginner Explorer", xp: 100 },
    { percent: 25, title: "Progress Starter", xp: 100 },
    { percent: 50, title: "Halfway Hero", xp: 100 },
    { percent: 75, title: "Career Achiever", xp: 100 },
    { percent: 100, title: "Roadmap Master", xp: 100 }
];

// Default Weekly Goals
const DEFAULT_WEEKLY_GOALS = [
    {
        goalId: "tasks_5",
        title: "Complete 5 roadmap tasks",
        type: "roadmap_tasks",
        target: 5,
        xpReward: 50
    },
    {
        goalId: "skills_2",
        title: "Learn 2 new skills",
        type: "learn_skills",
        target: 2,
        xpReward: 50
    },
    {
        goalId: "activities_3",
        title: "Complete 3 learning activities",
        type: "learning_activities",
        target: 3,
        xpReward: 50
    },
    {
        goalId: "interview_2",
        title: "Practice 2 mock interviews",
        type: "mock_interviews",
        target: 2,
        xpReward: 50
    },
    {
        goalId: "hours_5",
        title: "Spend 5 hours learning",
        type: "study_hours",
        target: 5,
        xpReward: 50
    }
];

// Date helpers
function getTodayString(clientOffsetMinutes = 0) {
    const now = new Date();
    // Adjust if client offset provided
    const local = new Date(now.getTime() - clientOffsetMinutes * 60 * 1000);
    return local.toISOString().slice(0, 10);
}

function getYesterdayString(todayStr) {
    const d = new Date(todayStr + "T12:00:00Z");
    d.setUTCDate(d.getUTCDate() - 1);
    return d.toISOString().slice(0, 10);
}

function getWeekBoundaries(referenceDate = new Date()) {
    const d = new Date(referenceDate);
    const day = d.getDay(); // 0 is Sunday, 1 is Monday...
    const diffToMonday = (day === 0 ? -6 : 1) - day;
    const monday = new Date(d);
    monday.setDate(d.getDate() + diffToMonday);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    return {
        start: monday.toISOString().slice(0, 10),
        end: sunday.toISOString().slice(0, 10)
    };
}

// Level Calculation
function calculateLevelData(totalXp) {
    let current = LEVELS[0];
    let next = LEVELS[1];

    for (let i = LEVELS.length - 1; i >= 0; i--) {
        if (totalXp >= LEVELS[i].minXp) {
            current = LEVELS[i];
            next = LEVELS[i + 1] || LEVELS[i];
            break;
        }
    }

    const isMax = current.level === 6;
    const range = next.minXp - current.minXp;
    const progressInLevel = isMax ? range : totalXp - current.minXp;
    const progressPercent = isMax
        ? 100
        : Math.min(100, Math.max(0, Math.round((progressInLevel / (range || 1)) * 100)));

    return {
        level: current.level,
        levelName: current.name,
        totalXp,
        minXp: current.minXp,
        nextXp: next.minXp,
        xpNeededForNext: isMax ? 0 : Math.max(0, next.minXp - totalXp),
        nextLevelName: next.name,
        progressPercent,
        isMaxLevel: isMax
    };
}

/**
 * Get or create the Gamification record for a user
 */
async function getOrCreateGamification(userId) {
    let record = await Gamification.findOne({ userId });
    const { start: weekStart, end: weekEnd } = getWeekBoundaries();

    if (!record) {
        // Initialize default badges
        const badges = INITIAL_BADGES.map((b) => ({
            ...b,
            unlocked: false,
            unlockedAt: null,
            currentProgress: 0
        }));

        // Initialize default weekly goals
        const weeklyGoals = DEFAULT_WEEKLY_GOALS.map((g) => ({
            ...g,
            current: 0,
            completed: false,
            completedAt: null,
            xpClaimed: false
        }));

        record = await Gamification.create({
            userId,
            totalXp: 0,
            currentLevel: 1,
            levelName: "Beginner",
            currentStreak: 0,
            longestStreak: 0,
            lastActiveDate: null,
            activityDates: [],
            badges,
            milestoneRewards: [],
            currentWeekStartDate: weekStart,
            currentWeekEndDate: weekEnd,
            weeklyGoals,
            goalHistory: []
        });
    } else {
        let changed = false;

        // Ensure all badges exist
        const existingBadgeIds = new Set((record.badges || []).map((b) => b.badgeId));
        INITIAL_BADGES.forEach((ib) => {
            if (!existingBadgeIds.has(ib.badgeId)) {
                record.badges.push({
                    ...ib,
                    unlocked: false,
                    unlockedAt: null,
                    currentProgress: 0
                });
                changed = true;
            }
        });

        // Weekly goals rotation check
        if (record.currentWeekStartDate !== weekStart) {
            // Archive old week if it has goals
            if (record.weeklyGoals && record.weeklyGoals.length > 0 && record.currentWeekStartDate) {
                const totalG = record.weeklyGoals.length;
                const doneG = record.weeklyGoals.filter((g) => g.completed).length;
                const pct = totalG > 0 ? Math.round((doneG / totalG) * 100) : 0;
                const earned = record.weeklyGoals
                    .filter((g) => g.completed && g.xpClaimed)
                    .reduce((acc, g) => acc + (g.xpReward || 50), 0);

                record.goalHistory.unshift({
                    weekStartDate: record.currentWeekStartDate,
                    weekEndDate: record.currentWeekEndDate,
                    totalGoals: totalG,
                    completedGoals: doneG,
                    completionPercentage: pct,
                    xpEarned: earned
                });

                // Keep up to 8 historical weeks
                if (record.goalHistory.length > 8) {
                    record.goalHistory = record.goalHistory.slice(0, 8);
                }
            }

            // Reset goals for the new week
            record.currentWeekStartDate = weekStart;
            record.currentWeekEndDate = weekEnd;
            record.weeklyGoals = DEFAULT_WEEKLY_GOALS.map((g) => ({
                ...g,
                current: 0,
                completed: false,
                completedAt: null,
                xpClaimed: false
            }));
            changed = true;
        }

        if (changed) {
            await record.save();
        }
    }

    return record;
}

/**
 * Update daily streak
 */
function updateStreak(record, todayStr) {
    if (!todayStr) todayStr = getTodayString();

    const lastActive = record.lastActiveDate;
    let streakIncremented = false;

    if (!lastActive) {
        // First activity ever
        record.currentStreak = 1;
        record.longestStreak = 1;
        record.lastActiveDate = todayStr;
        record.activityDates = [todayStr];
        streakIncremented = true;
    } else if (lastActive === todayStr) {
        // Already active today; streak maintained
        if (!record.activityDates.includes(todayStr)) {
            record.activityDates.push(todayStr);
        }
    } else {
        const yesterday = getYesterdayString(todayStr);
        if (lastActive === yesterday) {
            // Consecutive day!
            record.currentStreak += 1;
            if (record.currentStreak > record.longestStreak) {
                record.longestStreak = record.currentStreak;
            }
            streakIncremented = true;
        } else {
            // Missed at least one day; reset streak
            record.currentStreak = 1;
            streakIncremented = true;
        }
        record.lastActiveDate = todayStr;
        if (!record.activityDates.includes(todayStr)) {
            record.activityDates.push(todayStr);
        }
    }

    // Keep activity dates array trimmed to last 60 days
    if (record.activityDates.length > 60) {
        record.activityDates = record.activityDates.slice(-60);
    }

    return streakIncremented;
}

/**
 * Check and unlock badges
 */
function evaluateBadges(record) {
    const newlyUnlocked = [];

    record.badges.forEach((badge) => {
        if (badge.unlocked) return;

        let meetsCondition = false;

        switch (badge.badgeId) {
            case "first_step":
                badge.currentProgress = record.totalRoadmapTasksCompleted;
                meetsCondition = record.totalRoadmapTasksCompleted >= 1;
                break;
            case "career_explorer":
                badge.currentProgress = record.totalRoadmapTasksCompleted;
                meetsCondition = record.totalRoadmapTasksCompleted >= 5;
                break;
            case "consistency_champion":
                badge.currentProgress = Math.max(record.currentStreak, record.longestStreak);
                meetsCondition = record.currentStreak >= 7 || record.longestStreak >= 7;
                break;
            case "dedicated_learner":
                badge.currentProgress = Math.max(record.currentStreak, record.longestStreak);
                meetsCondition = record.currentStreak >= 30 || record.longestStreak >= 30;
                break;
            case "goal_getter":
                badge.currentProgress = record.totalCompletedGoals;
                meetsCondition = record.totalCompletedGoals >= 5;
                break;
            case "roadmap_master":
                badge.currentProgress = record.totalCompletedRoadmaps;
                meetsCondition = record.totalCompletedRoadmaps >= 1;
                break;
            case "skill_builder":
                badge.currentProgress = record.totalLearningActivities;
                meetsCondition = record.totalLearningActivities >= 10;
                break;
            case "interview_ready":
                badge.currentProgress = record.totalMockInterviews;
                meetsCondition = record.totalMockInterviews >= 5;
                break;
            default:
                break;
        }

        if (meetsCondition) {
            badge.unlocked = true;
            badge.unlockedAt = new Date();
            newlyUnlocked.push({
                badgeId: badge.badgeId,
                name: badge.name,
                description: badge.description,
                icon: badge.icon
            });
        }
    });

    return newlyUnlocked;
}

/**
 * Update weekly goals progress
 */
function advanceWeeklyGoal(record, goalType, count = 1) {
    const completedGoalsList = [];

    (record.weeklyGoals || []).forEach((goal) => {
        if (goal.type === goalType && !goal.completed) {
            goal.current = Math.min(goal.target, (goal.current || 0) + count);
            if (goal.current >= goal.target) {
                goal.completed = true;
                goal.completedAt = new Date();
                record.totalCompletedGoals += 1;
                completedGoalsList.push(goal);
            }
        }
    });

    return completedGoalsList;
}

/**
 * Handle roadmap step completion
 */
async function onRoadmapStepCompleted(userId, careerId, roadmap, stepObj, progressPercentage) {
    const record = await getOrCreateGamification(userId);
    const todayStr = getTodayString();
    const stepIdStr = String(stepObj?._id || stepObj?.stepNumber || "step");
    const uniqueKey = `task_${roadmap?._id || careerId}_${stepIdStr}`;

    let xpGained = 0;
    const events = {
        xpGained: 0,
        taskXpAwarded: false,
        streakUpdated: false,
        newLevel: null,
        newBadges: [],
        newMilestones: [],
        completedGoals: []
    };

    // 1. Award 20 XP for completing a roadmap task (idempotent)
    const existingLog = await GamificationLog.findOne({ userId, uniqueKey });
    if (!existingLog) {
        await GamificationLog.create({
            userId,
            actionType: "roadmap_task",
            uniqueKey,
            title: `Completed Roadmap Step: ${stepObj?.title || "Step"}`,
            description: `Finished step in ${roadmap?.title || "Career Roadmap"}`,
            xpEarned: 20,
            date: todayStr
        }).catch(() => {});

        record.totalXp += 20;
        xpGained += 20;
        events.taskXpAwarded = true;
        record.totalRoadmapTasksCompleted += 1;
        record.totalLearningActivities += 1;
    }

    // 2. Advance streak
    const streakChanged = updateStreak(record, todayStr);
    if (streakChanged) events.streakUpdated = true;

    // 3. Advance weekly goals for roadmap tasks & learning activities
    const finishedGoals1 = advanceWeeklyGoal(record, "roadmap_tasks", 1);
    const finishedGoals2 = advanceWeeklyGoal(record, "learning_activities", 1);
    const allFinishedGoals = [...finishedGoals1, ...finishedGoals2];

    for (const g of allFinishedGoals) {
        if (!g.xpClaimed) {
            g.xpClaimed = true;
            record.totalXp += g.xpReward || 50;
            xpGained += g.xpReward || 50;
            await GamificationLog.create({
                userId,
                actionType: "weekly_goal",
                uniqueKey: `goal_${record.currentWeekStartDate}_${g.goalId}`,
                title: `Weekly Goal Completed: ${g.title}`,
                xpEarned: g.xpReward || 50,
                date: todayStr
            }).catch(() => {});
        }
        events.completedGoals.push({
            goalId: g.goalId,
            title: g.title,
            xpReward: g.xpReward
        });
    }

    // 4. Check Roadmap Milestones (10%, 25%, 50%, 75%, 100%)
    const careerObj = await Career.findById(careerId).select("name");
    const careerName = careerObj?.name || "Career Roadmap";

    if (progressPercentage >= 100) {
        record.totalCompletedRoadmaps = Math.max(1, (record.totalCompletedRoadmaps || 0) + 1);
    }

    for (const mDef of MILESTONE_DEFS) {
        if (progressPercentage >= mDef.percent) {
            const milestoneKey = `${careerId}_${mDef.percent}`;
            const alreadyAwarded = (record.milestoneRewards || []).some(
                (mr) => mr.milestoneKey === milestoneKey
            );

            if (!alreadyAwarded) {
                record.milestoneRewards.push({
                    milestoneKey,
                    careerId,
                    careerName,
                    milestonePercent: mDef.percent,
                    title: mDef.title,
                    xpAwarded: mDef.xp,
                    unlockedAt: new Date()
                });

                record.totalXp += mDef.xp;
                xpGained += mDef.xp;

                await GamificationLog.create({
                    userId,
                    actionType: "milestone_reward",
                    uniqueKey: `milestone_${milestoneKey}`,
                    title: `Roadmap Milestone: ${mDef.title} (${mDef.percent}%)`,
                    description: `Reached ${mDef.percent}% in ${careerName}`,
                    xpEarned: mDef.xp,
                    date: todayStr
                }).catch(() => {});

                events.newMilestones.push({
                    milestonePercent: mDef.percent,
                    title: mDef.title,
                    careerName,
                    xpAwarded: mDef.xp
                });
            }
        }
    }

    // 5. Evaluate Badge Unlocks
    const newlyUnlockedBadges = evaluateBadges(record);
    events.newBadges = newlyUnlockedBadges;

    // 6. Recalculate level
    const prevLevel = record.currentLevel;
    const levelInfo = calculateLevelData(record.totalXp);
    record.currentLevel = levelInfo.level;
    record.levelName = levelInfo.levelName;

    if (levelInfo.level > prevLevel) {
        events.newLevel = {
            level: levelInfo.level,
            levelName: levelInfo.levelName
        };

        // Notify user about level up
        await Notification.create({
            user: userId,
            title: `Leveled Up to ${levelInfo.levelName}!`,
            message: `Congratulations! You reached Level ${levelInfo.level} (${levelInfo.levelName}) with ${record.totalXp} XP.`,
            type: "general"
        }).catch(() => {});
    }

    await record.save();
    events.xpGained = xpGained;
    events.currentStreak = record.currentStreak;
    events.totalXp = record.totalXp;
    events.levelData = levelInfo;

    return events;
}

/**
 * Record a custom learning activity or mock interview
 */
async function recordLearningActivity(userId, activityType, title, notes = "") {
    const record = await getOrCreateGamification(userId);
    const todayStr = getTodayString();
    let xpAmount = 10;
    let goalType = "learning_activities";

    if (activityType === "mock_interview") {
        xpAmount = 30;
        goalType = "mock_interviews";
        record.totalMockInterviews += 1;
    } else if (activityType === "skill_learned") {
        xpAmount = 25;
        goalType = "learn_skills";
    }

    record.totalLearningActivities += 1;
    record.totalXp += xpAmount;

    // Daily streak check
    updateStreak(record, todayStr);

    // Weekly goal advancement
    const finishedGoals = advanceWeeklyGoal(record, goalType, 1);
    for (const g of finishedGoals) {
        if (!g.xpClaimed) {
            g.xpClaimed = true;
            record.totalXp += g.xpReward || 50;
            xpAmount += g.xpReward || 50;
        }
    }

    // Log action
    await GamificationLog.create({
        userId,
        actionType: activityType === "mock_interview" ? "mock_interview" : "learning_activity",
        title: title || (activityType === "mock_interview" ? "Completed Mock Interview Session" : "Completed Learning Activity"),
        description: notes,
        xpEarned: xpAmount,
        date: todayStr
    }).catch(() => {});

    // Evaluate badges
    const newBadges = evaluateBadges(record);

    // Level check
    const levelInfo = calculateLevelData(record.totalXp);
    record.currentLevel = levelInfo.level;
    record.levelName = levelInfo.levelName;

    await record.save();

    return {
        success: true,
        xpGained: xpAmount,
        totalXp: record.totalXp,
        currentStreak: record.currentStreak,
        newBadges,
        levelData: levelInfo
    };
}

/**
 * Build 7-day calendar data for the UI
 */
function build7DayCalendar(activityDates = [], lastActiveDate = null) {
    const days = [];
    const dateSet = new Set(activityDates || []);
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const iso = d.toISOString().slice(0, 10);
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const dayName = dayNames[d.getDay()];

        days.push({
            date: iso,
            dayName,
            dayNumber: d.getDate(),
            isToday: i === 0,
            completed: dateSet.has(iso)
        });
    }

    return days;
}

/**
 * Get comprehensive Gamification Overview for the Dashboard & Achievements Page
 */
async function getGamificationOverview(userId) {
    const record = await getOrCreateGamification(userId);
    const todayStr = getTodayString();
    const yesterdayStr = getYesterdayString(todayStr);

    // Streak status: If user last active before yesterday and hasn't logged today, current active streak is 0
    let displayStreak = record.currentStreak;
    if (record.lastActiveDate && record.lastActiveDate < yesterdayStr && record.lastActiveDate !== todayStr) {
        displayStreak = 0;
    }

    const levelData = calculateLevelData(record.totalXp);
    const calendarDays = build7DayCalendar(record.activityDates, record.lastActiveDate);

    // Calculate weekly goals progress percentage
    const goals = record.weeklyGoals || [];
    const totalGoals = goals.length;
    const completedGoals = goals.filter((g) => g.completed).length;
    const weeklyProgressPct = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

    // Recently unlocked badges (up to 4)
    const unlockedBadges = (record.badges || [])
        .filter((b) => b.unlocked)
        .sort((a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt));

    const lockedBadges = (record.badges || []).filter((b) => !b.unlocked);

    return {
        totalXp: record.totalXp,
        levelData,
        streak: {
            currentStreak: displayStreak,
            longestStreak: record.longestStreak,
            isActiveToday: record.lastActiveDate === todayStr,
            lastActiveDate: record.lastActiveDate,
            calendarDays
        },
        weeklyGoals: {
            weekStartDate: record.currentWeekStartDate,
            weekEndDate: record.currentWeekEndDate,
            goals,
            totalGoals,
            completedGoals,
            weeklyProgressPct,
            history: record.goalHistory || []
        },
        badges: {
            all: record.badges || [],
            unlocked: unlockedBadges,
            locked: lockedBadges,
            unlockedCount: unlockedBadges.length,
            totalCount: (record.badges || []).length
        },
        milestoneRewards: {
            list: record.milestoneRewards || [],
            totalCount: (record.milestoneRewards || []).length,
            definitions: MILESTONE_DEFS
        },
        stats: {
            totalRoadmapTasksCompleted: record.totalRoadmapTasksCompleted,
            totalLearningActivities: record.totalLearningActivities,
            totalMockInterviews: record.totalMockInterviews,
            totalCompletedGoals: record.totalCompletedGoals,
            totalCompletedRoadmaps: record.totalCompletedRoadmaps
        }
    };
}

module.exports = {
    LEVELS,
    INITIAL_BADGES,
    MILESTONE_DEFS,
    DEFAULT_WEEKLY_GOALS,
    getOrCreateGamification,
    onRoadmapStepCompleted,
    recordLearningActivity,
    getGamificationOverview,
    calculateLevelData,
    build7DayCalendar
};
