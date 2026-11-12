const assert = require("assert");
const {
    LEVELS,
    INITIAL_BADGES,
    MILESTONE_DEFS,
    DEFAULT_WEEKLY_GOALS,
    calculateLevelData,
    build7DayCalendar
} = require("./services/gamificationService");

console.log("=================================================");
console.log("   CAREER HORIZON GAMIFICATION UNIT TESTS");
console.log("=================================================");

// Test 1: Level Calculations
console.log("Test 1: Level calculation verification...");
const l1 = calculateLevelData(0);
assert.strictEqual(l1.level, 1);
assert.strictEqual(l1.levelName, "Beginner");
assert.strictEqual(l1.progressPercent, 0);

const l2 = calculateLevelData(150);
assert.strictEqual(l2.level, 2);
assert.strictEqual(l2.levelName, "Explorer");
assert.strictEqual(l2.minXp, 100);
assert.strictEqual(l2.nextXp, 300);
assert.strictEqual(l2.xpNeededForNext, 150);
assert.strictEqual(l2.progressPercent, 25); // 50 / 200 = 25%

const l6 = calculateLevelData(1800);
assert.strictEqual(l6.level, 6);
assert.strictEqual(l6.levelName, "Career Champion");
assert.strictEqual(l6.isMaxLevel, true);
assert.strictEqual(l6.progressPercent, 100);
console.log("✓ Level calculation verified successfully.");

// Test 2: Badge Configurations
console.log("Test 2: Verifying required 8 initial badges...");
const expectedBadgeIds = [
    "career_explorer",
    "first_step",
    "consistency_champion",
    "dedicated_learner",
    "goal_getter",
    "roadmap_master",
    "skill_builder",
    "interview_ready"
];
assert.strictEqual(INITIAL_BADGES.length, 8);
expectedBadgeIds.forEach((bId) => {
    const found = INITIAL_BADGES.find((b) => b.badgeId === bId);
    assert.ok(found, `Badge ${bId} must be defined`);
    assert.ok(found.condition.length > 0, `Badge ${bId} must have unlock condition`);
});
console.log("✓ All 8 initial badges configured with complete criteria.");

// Test 3: Milestone Definitions
console.log("Test 3: Verifying roadmap milestones (10%, 25%, 50%, 75%, 100%)...");
assert.strictEqual(MILESTONE_DEFS.length, 5);
assert.deepStrictEqual(
    MILESTONE_DEFS.map((m) => m.percent),
    [10, 25, 50, 75, 100]
);
assert.deepStrictEqual(
    MILESTONE_DEFS.map((m) => m.title),
    ["Beginner Explorer", "Progress Starter", "Halfway Hero", "Career Achiever", "Roadmap Master"]
);
console.log("✓ All 5 roadmap milestones verified.");

// Test 4: Weekly Goals Defaults
console.log("Test 4: Verifying weekly goals definitions...");
assert.strictEqual(DEFAULT_WEEKLY_GOALS.length, 5);
const goalTypes = DEFAULT_WEEKLY_GOALS.map((g) => g.type);
assert.ok(goalTypes.includes("roadmap_tasks"));
assert.ok(goalTypes.includes("learn_skills"));
assert.ok(goalTypes.includes("learning_activities"));
assert.ok(goalTypes.includes("mock_interviews"));
assert.ok(goalTypes.includes("study_hours"));
console.log("✓ All 5 weekly goals defined.");

// Test 5: 7-Day Calendar Builder
console.log("Test 5: Verifying 7-day calendar builder...");
const today = new Date().toISOString().slice(0, 10);
const cal = build7DayCalendar([today], today);
assert.strictEqual(cal.length, 7);
const todayEntry = cal.find((c) => c.isToday);
assert.ok(todayEntry);
assert.strictEqual(todayEntry.completed, true);
assert.strictEqual(todayEntry.date, today);
console.log("✓ 7-Day calendar builder verified.");

console.log("\n=================================================");
console.log("   ALL 5 GAMIFICATION UNIT TESTS PASSED!");
console.log("=================================================\n");
