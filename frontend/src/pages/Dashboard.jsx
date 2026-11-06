import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import Navbar from "../components/Navbar";
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Compass,
  Bookmark,
  Briefcase,
  UserCheck,
  Activity as ActivityIcon,
} from "lucide-react";

import { API_URL } from "../config/api";

const ROADMAP_COLORS = [
  "#632cd6",
  "#10b981",
  "#f59e0b",
  "#06b6d4",
  "#ec4899",
  "#3b82f6",
];

function formatRelativeTime(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 60) return "Just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function getActivityIcon(type) {
  switch (type) {
    case "roadmap_completed":
      return {
        icon: CheckCircle2,
        label: "Roadmap Step Completed",
        color: "#059669",
        bg: "#ecfdf5",
      };
    case "roadmap_started":
      return {
        icon: Compass,
        label: "Roadmap Started",
        color: "#632cd6",
        bg: "#f3effe",
      };
    case "career_saved":
      return {
        icon: Bookmark,
        label: "Career Bookmarked",
        color: "#d97706",
        bg: "#fef3c7",
      };
    case "career_removed":
      return {
        icon: Bookmark,
        label: "Career Removed",
        color: "#6b7280",
        bg: "#f3f4f6",
      };
    case "career_viewed":
      return {
        icon: Briefcase,
        label: "Career Explored",
        color: "#0284c7",
        bg: "#e0f2fe",
      };
    case "assessment_completed":
      return {
        icon: Award,
        label: "Assessment Updated",
        color: "#10b981",
        bg: "#d1fae5",
      };
    case "profile_updated":
      return {
        icon: UserCheck,
        label: "Profile Updated",
        color: "#8b5cf6",
        bg: "#ede9fe",
      };
    default:
      return {
        icon: ActivityIcon,
        label: "Platform Activity",
        color: "#632cd6",
        bg: "#f3effe",
      };
  }
}

function renderRoadmapPieChart(roadmaps, overallPct) {
  const size = 58;
  const strokeWidth = 6.5;
  const radius = (size - strokeWidth) / 2; // (58 - 6.5) / 2 = 25.75
  const circumference = 2 * Math.PI * radius; // ~161.79

  if (!roadmaps || roadmaps.length === 0) {
    return (
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="dash-roadmap-pie-svg"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#f3effe"
          strokeWidth={strokeWidth}
        />
        <text
          x={size / 2}
          y={size / 2 + 4}
          textAnchor="middle"
          fontSize="11"
          fontWeight="700"
          fill="var(--text-subtle)"
        >
          0%
        </text>
      </svg>
    );
  }

  if (roadmaps.length === 1) {
    const pct = Math.min(100, Math.max(0, roadmaps[0].progressPercentage || 0));
    const strokeDashoffset = circumference - (circumference * pct) / 100;

    return (
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="dash-roadmap-pie-svg"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#f3effe"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={pct >= 100 ? "#10b981" : "var(--primary)"}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
        <text
          x={size / 2}
          y={size / 2 + 4}
          textAnchor="middle"
          fontSize="11"
          fontWeight="800"
          fill="var(--text-main)"
        >
          {pct}%
        </text>
      </svg>
    );
  }

  // Multi-roadmap segmented ring
  const count = roadmaps.length;
  const gap = 4;
  const totalGaps = count * gap;
  const availableLength = Math.max(0, circumference - totalGaps);
  const segmentLength = availableLength / count;

  let currentOffset = 0;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="dash-roadmap-pie-svg"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#f3effe"
        strokeWidth={strokeWidth}
      />
      {roadmaps.map((r, idx) => {
        const pct = Math.min(100, Math.max(0, r.progressPercentage || 0));
        const color = ROADMAP_COLORS[idx % ROADMAP_COLORS.length];
        const filledLen = Math.max(1, (pct / 100) * segmentLength);
        const dashArray = `${filledLen} ${circumference - filledLen}`;
        const rotateAngle = -90 + (currentOffset / circumference) * 360;
        currentOffset += segmentLength + gap;

        return (
          <circle
            key={r.careerId || idx}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={dashArray}
            strokeLinecap="round"
            transform={`rotate(${rotateAngle} ${size / 2} ${size / 2})`}
            style={{ transition: "all 0.5s ease" }}
          />
        );
      })}
      <text
        x={size / 2}
        y={size / 2 + 4}
        textAnchor="middle"
        fontSize="11"
        fontWeight="800"
        fill="var(--text-main)"
      >
        {overallPct}%
      </text>
    </svg>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, user, token, savedCareers } = useAuth();

  const [activeRoadmaps, setActiveRoadmaps] = useState([]);
  const [topMatches, setTopMatches] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const authToken = token || localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${authToken}` };

        const [roadmapRes, matchRes, actRes] = await Promise.all([
          fetch(`${API_URL}/roadmaps/user/active`, { headers }),
          fetch(`${API_URL}/recommendations`, { headers }),
          fetch(`${API_URL}/activities`, { headers }),
        ]);

        if (roadmapRes.ok) {
          const rData = await roadmapRes.json();
          setActiveRoadmaps(Array.isArray(rData) ? rData : []);
        }

        if (matchRes.ok) {
          const mData = await matchRes.json();
          const list = Array.isArray(mData)
            ? mData
            : mData.recommendations || [];
          setTopMatches(list.slice(0, 3));
        }

        if (actRes.ok) {
          const aData = await actRes.json();
          setActivities(Array.isArray(aData) ? aData : []);
        }
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAuthenticated, token, navigate]);

  // Distinct careers explored (from career_viewed activities or active roadmaps)
  const exploredCareersCount = useMemo(() => {
    const careerIds = new Set();
    activities.forEach((act) => {
      if (act.type === "career_viewed") {
        const cId = act.career?._id || act.career || act.description;
        if (cId) careerIds.add(String(cId));
      }
    });
    activeRoadmaps.forEach((r) => {
      if (r.careerId) careerIds.add(String(r.careerId));
    });
    return careerIds.size;
  }, [activities, activeRoadmaps]);

  const savedCount = savedCareers ? savedCareers.length : 0;

  // Aggregate roadmap progress across all started career roadmaps
  const totalCompletedSteps = useMemo(() => {
    return activeRoadmaps.reduce((acc, r) => acc + (r.completedSteps || 0), 0);
  }, [activeRoadmaps]);

  const totalStepsCount = useMemo(() => {
    return activeRoadmaps.reduce((acc, r) => acc + (r.totalSteps || 0), 0);
  }, [activeRoadmaps]);

  const completedRoadmapsCount = useMemo(() => {
    return activeRoadmaps.filter(
      (r) =>
        (r.totalSteps > 0 && r.completedSteps >= r.totalSteps) ||
        r.progressPercentage >= 100
    ).length;
  }, [activeRoadmaps]);

  const inProgressRoadmapsCount = Math.max(
    0,
    activeRoadmaps.length - completedRoadmapsCount
  );

  const overallRoadmapProgressPct = useMemo(() => {
    if (activeRoadmaps.length === 0) return 0;
    if (totalStepsCount > 0) {
      return Math.round((totalCompletedSteps / totalStepsCount) * 100);
    }
    const avg = activeRoadmaps.reduce(
      (acc, r) => acc + (r.progressPercentage || 0),
      0
    );
    return Math.round(avg / activeRoadmaps.length);
  }, [activeRoadmaps, totalCompletedSteps, totalStepsCount]);

  const completedStepsDisplay =
    activeRoadmaps.length > 0
      ? `${totalCompletedSteps}/${totalStepsCount}`
      : "0/0";

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="dashboard-page">
      <Navbar />

      <main className="page-container pdf-dashboard-container">
        {/* Greeting Header */}
        <section className="pdf-dash-greeting">
          <h1>Hello, {user?.name || "Student"}</h1>
          <p>Here is where you are, and what to do next.</p>
        </section>

        {/* Prompt if user hasn't picked 3 fields / interests yet */}
        {!user?.assessmentCompleted && (
          <section className="pdf-dash-onboard-banner">
            <div>
              <strong>Complete your interest selection</strong>
              <p>
                Pick up to 3 fields, subfields, interests, and the activities
                you enjoy to unlock personalised match scores.
              </p>
            </div>
            <Link to="/assessment" className="pdf-explore-btn">
              Select interests
            </Link>
          </section>
        )}

        {/* 4 Top Stat Cards */}
        <section className="pdf-dash-stats-grid">
          <div className="pdf-dash-stat-card">
            <span className="pdf-stat-eyebrow">CAREERS EXPLORED</span>
            <strong className="pdf-stat-value">{exploredCareersCount}</strong>
            <span className="pdf-stat-sub">Distinct careers you opened</span>
          </div>

          <Link to="/saved-careers" className="pdf-dash-stat-card">
            <span className="pdf-stat-eyebrow">SAVED CAREERS</span>
            <strong className="pdf-stat-value">{savedCount}</strong>
            <span className="pdf-stat-sub">Bookmarked for later</span>
          </Link>

          <div className="pdf-dash-stat-card">
            <div className="dash-roadmap-prog-header">
              <div className="dash-roadmap-prog-titles">
                <span className="pdf-stat-eyebrow">ROADMAP PROGRESS</span>
                <strong className="pdf-stat-value">
                  {overallRoadmapProgressPct}%
                </strong>
              </div>
              {renderRoadmapPieChart(activeRoadmaps, overallRoadmapProgressPct)}
            </div>

            {activeRoadmaps.length > 0 ? (
              <div className="dash-each-roadmap-list">
                {activeRoadmaps.map((r, idx) => {
                  const color = ROADMAP_COLORS[idx % ROADMAP_COLORS.length];
                  return (
                    <div key={r.careerId || idx} className="dash-each-roadmap-item">
                      <div className="dash-each-roadmap-left">
                        <span
                          className="dash-each-dot"
                          style={{ backgroundColor: color }}
                        />
                        <span className="dash-each-name" title={r.careerName}>
                          {r.careerName}
                        </span>
                      </div>
                      <span className="dash-each-pct" style={{ color }}>
                        {r.progressPercentage || 0}%
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <span className="pdf-stat-sub">No roadmaps started yet</span>
            )}
          </div>

          <div className="pdf-dash-stat-card">
            <span className="pdf-stat-eyebrow">COMPLETED STEPS</span>
            <strong className="pdf-stat-value">{completedStepsDisplay}</strong>
            <span className="pdf-stat-sub">Across all roadmaps</span>
          </div>
        </section>

        {/* Main 2-Column Dashboard Layout */}
        <div className="pdf-dash-main-grid">
          {/* Left Column: All Active Career Roadmaps + Saved Careers */}
          <div className="pdf-dash-left-col">
            {/* Show all career roadmaps in which user has progress */}
            <section className="pdf-dash-section">
              <div className="pdf-dash-section-head">
                <h2>Continue where you left off</h2>
                {activeRoadmaps.length > 0 && (
                  <span className="pdf-section-count">
                    {completedRoadmapsCount > 0
                      ? `${completedRoadmapsCount} completed · ${inProgressRoadmapsCount} active`
                      : `${activeRoadmaps.length} roadmap${
                          activeRoadmaps.length > 1 ? "s" : ""
                        } in progress`}
                  </span>
                )}
              </div>

              {activeRoadmaps.length > 0 ? (
                <div className="pdf-roadmaps-stack">
                  {activeRoadmaps.map((roadmap) => {
                    const total = roadmap.totalSteps || 9;
                    const done = roadmap.completedSteps || 0;
                    const isCompleted =
                      (total > 0 && done >= total) ||
                      roadmap.progressPercentage >= 100;
                    const third = Math.max(1, Math.ceil(total / 3));
                    const advTotal = Math.max(1, total - third * 2);

                    const fallbackLevels = [
                      {
                        level: "Beginner",
                        completed: Math.min(third, done),
                        total: third,
                      },
                      {
                        level: "Intermediate",
                        completed: Math.min(third, Math.max(0, done - third)),
                        total: third,
                      },
                      {
                        level: "Advanced",
                        completed: Math.min(
                          advTotal,
                          Math.max(0, done - third * 2)
                        ),
                        total: advTotal,
                      },
                    ];

                    const levels =
                      Array.isArray(roadmap.levelProgress) &&
                      roadmap.levelProgress.length === 3
                        ? roadmap.levelProgress
                        : fallbackLevels;

                    let runningStep = 1;
                    const levelMeta = levels.map((lvl) => {
                      const count = Math.max(1, lvl.total || 3);
                      const start = runningStep;
                      const end = runningStep + count - 1;
                      runningStep = end + 1;
                      const theme = (lvl.level || "Beginner").toLowerCase();
                      return {
                        ...lvl,
                        count,
                        start,
                        end,
                        theme,
                      };
                    });

                    return (
                      <div
                        key={roadmap.progressId || roadmap.careerId}
                        className={`pdf-continue-card ${
                          isCompleted ? "completed" : ""
                        }`}
                      >
                        <div className="pdf-continue-top">
                          <div>
                            <div className="dash-roadmap-title-row">
                              <strong className="pdf-roadmap-title">
                                {roadmap.careerName}
                              </strong>
                              {isCompleted && (
                                <span className="dash-roadmap-completed-badge">
                                  <CheckCircle2 size={13} />
                                  <span>Successfully Completed</span>
                                </span>
                              )}
                            </div>
                            <div className="roadmap-prog-top-left mt-1">
                              <span className="pdf-roadmap-step-count">
                                {roadmap.completedSteps}/{roadmap.totalSteps} steps completed
                              </span>
                            </div>
                          </div>
                          <div className="pdf-continue-pct">
                            {roadmap.progressPercentage}%
                          </div>
                        </div>

                        {/* 9-Segment Pill Progress Bar */}
                        <div
                          className="rm-seg-bar-wrap"
                          role="progressbar"
                          aria-valuenow={roadmap.progressPercentage}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        >
                          <div className="rm-seg-pills-row">
                            {levelMeta.map((lvl) =>
                              Array.from({ length: lvl.count }).map(
                                (_, segIdx) => {
                                  const isFilled = segIdx < (lvl.completed || 0);
                                  return (
                                    <span
                                      key={`${lvl.level}-seg-${segIdx}`}
                                      className={`rm-seg-pill ${lvl.theme} ${
                                        isFilled ? "filled" : ""
                                      }`}
                                      title={`${lvl.level} — Step ${
                                        lvl.start + segIdx
                                      }`}
                                    />
                                  );
                                }
                              )
                            )}
                          </div>

                          <div className="rm-seg-legend">
                            {levelMeta.map((lvl) => (
                              <div
                                key={lvl.level}
                                className="rm-seg-legend-item"
                              >
                                <div className="rm-seg-legend-title">
                                  <span
                                    className={`rm-seg-legend-dot ${lvl.theme}`}
                                  />
                                  <strong>{lvl.level}</strong>
                                </div>
                                <span className="rm-seg-legend-sub">
                                  Steps {lvl.start}&ndash;{lvl.end}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {isCompleted ? (
                          <div className="dash-roadmap-completed-banner">
                            <Award size={16} className="dash-completed-icon" />
                            <span>
                              <strong>Successfully Completed!</strong> You
                              finished all {total} learning steps in this
                              roadmap.
                            </span>
                          </div>
                        ) : (
                          <div className="pdf-continue-next">
                            <span className="pdf-next-tag">Next step:</span>{" "}
                            <strong>{roadmap.nextStepTitle}</strong>
                          </div>
                        )}

                        <div className="dash-roadmap-action-wrap">
                          <Link
                            to={`/roadmaps/${roadmap.careerId}`}
                            className={`dash-roadmap-full-btn ${
                              isCompleted ? "completed" : ""
                            }`}
                          >
                            <span>
                              {isCompleted
                                ? "View Completed Roadmap"
                                : "Continue Roadmap"}
                            </span>
                            <ArrowRight size={15} />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="pdf-continue-card empty">
                  <p>
                    You have not started a career roadmap yet. Open any career
                    and click &ldquo;Start roadmap&rdquo; to track your
                    step-by-step progress.
                  </p>
                  <div className="mt-3">
                    <Link to="/careers" className="pdf-explore-btn">
                      Browse careers
                    </Link>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Right Column: Top 3 Matches */}
          <aside className="pdf-dash-right-col">
            <section className="pdf-dash-section">
              <div className="pdf-dash-section-head">
                <h2>Top matches</h2>
              </div>

              {topMatches.length > 0 ? (
                <>
                  <div className="pdf-top-matches-stack">
                    {topMatches.slice(0, 3).map((item, idx) => {
                      const career = item.career || item;
                      const careerId = career._id || career.id;
                      const matchScore =
                        item.matchPercentage ?? item.score ?? 70;
                      const fieldName =
                        career.fieldId?.name || career.fieldName || "Career";
                      const pillTone =
                        matchScore >= 60 ? "high" : "amber";

                      return (
                        <Link
                          key={careerId || idx}
                          to={`/careers/${careerId}`}
                          className="pdf-top-match-card"
                        >
                          <div>
                            <strong>{career.name}</strong>
                            <span>{fieldName}</span>
                          </div>
                          <span className={`pdf-match-pill ${pillTone}`}>
                            {matchScore}% match
                          </span>
                        </Link>
                      );
                    })}
                  </div>

                  <Link
                    to="/matches"
                    className="pdf-outline-btn pdf-all-matches-btn"
                  >
                    <span>View all matches</span>
                    <ArrowRight size={14} />
                  </Link>
                </>
              ) : (
                <div className="pdf-continue-card">
                  <p>Select your interests to see your top matches.</p>
                  <div className="mt-3">
                    <Link to="/assessment" className="pdf-explore-btn">
                      Select interests
                    </Link>
                  </div>
                </div>
              )}
            </section>

            {/* User Activity Area */}
            <section className="pdf-dash-section">
              <div className="pdf-dash-section-head">
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <ActivityIcon size={18} color="var(--primary)" />
                  <h2>Your Recent Activity</h2>
                </div>
                {activities.length > 0 && (
                  <span className="pdf-section-count">
                    {activities.length} event{activities.length > 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {activities.length > 0 ? (
                <div className="dash-activity-timeline-card">
                  {activities.slice(0, 6).map((act, idx) => {
                    const iconConfig = getActivityIcon(act.type);
                    const IconComp = iconConfig.icon;

                    return (
                      <div key={act._id || idx} className="dash-activity-item">
                        <div
                          className="dash-activity-icon-wrap"
                          style={{
                            backgroundColor: iconConfig.bg,
                            color: iconConfig.color,
                          }}
                        >
                          <IconComp size={15} />
                        </div>

                        <div className="dash-activity-content">
                          <div className="dash-activity-title-row">
                            <strong className="dash-activity-label">
                              {iconConfig.label}
                            </strong>
                            <span className="dash-activity-time">
                              {formatRelativeTime(act.createdAt)}
                            </span>
                          </div>
                          <p className="dash-activity-desc">
                            {act.description || (act.career ? act.career.name : "Platform interaction")}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="pdf-continue-card empty">
                  <p>
                    No activity recorded yet. Explore careers, complete your assessment, or start a roadmap to see your journey here!
                  </p>
                  <div className="mt-3">
                    <Link to="/careers" className="pdf-explore-btn">
                      Explore careers
                    </Link>
                  </div>
                </div>
              )}
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}
