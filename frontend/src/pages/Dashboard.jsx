import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import Navbar from "../components/Navbar";
import {
  Heart,
  Check,
  ArrowRight,
  BarChart3,
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

function formatActivityDate(dateStr) {
  if (!dateStr) return "Recent";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "Recent";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, user, token, savedCareers } = useAuth();

  const [activeRoadmaps, setActiveRoadmaps] = useState([]);
  const [topMatches, setTopMatches] = useState([]);
  const [activities, setActivities] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [showAllNotifications, setShowAllNotifications] = useState(false);

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

        const [roadmapRes, matchRes, actRes, notifRes] = await Promise.all([
          fetch(`${API_URL}/roadmaps/user/active`, { headers }),
          fetch(`${API_URL}/recommendations`, { headers }),
          fetch(`${API_URL}/activities`, { headers }),
          fetch(`${API_URL}/notifications`, { headers }),
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
          setTopMatches(list.slice(0, 5));
        }

        if (actRes.ok) {
          const aData = await actRes.json();
          setActivities(Array.isArray(aData) ? aData : []);
        }

        if (notifRes.ok) {
          const nData = await notifRes.json();
          setNotifications(Array.isArray(nData) ? nData : []);
        }
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAuthenticated, token, navigate]);

  const handleMarkAllRead = async () => {
    try {
      const authToken = token || localStorage.getItem("token");
      await fetch(`${API_URL}/notifications/read-all`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Failed to mark notifications read:", err);
    }
  };

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
  const primaryRoadmap = activeRoadmaps.length > 0 ? activeRoadmaps[0] : null;

  const roadmapProgressPct = primaryRoadmap
    ? primaryRoadmap.progressPercentage || 0
    : 0;

  const completedStepsDisplay = primaryRoadmap
    ? `${primaryRoadmap.completedSteps || 0}/${primaryRoadmap.totalSteps || 8}`
    : "0/0";

  const visibleActivities = showAllActivities
    ? activities
    : activities.slice(0, 5);

  const visibleNotifications = showAllNotifications
    ? notifications
    : notifications.slice(0, 4);

  const getActivityIcon = (type) => {
    if (type === "career_saved") {
      return (
        <span className="pdf-act-icon saved">
          <Heart size={12} fill="currentColor" />
        </span>
      );
    }
    if (type === "roadmap_completed" || type === "assessment_completed") {
      return (
        <span className="pdf-act-icon done">
          <Check size={12} strokeWidth={3} />
        </span>
      );
    }
    return (
      <span className="pdf-act-icon viewed">
        <ArrowRight size={12} />
      </span>
    );
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="dashboard-page">
      <Navbar />

      <main className="page-container pdf-dashboard-container">
        {/* Greeting Header (Matches PDF Page 8 bottom) */}
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
                Pick up to 3 fields, subfields, and your preferred work style to
                unlock personalised match scores.
              </p>
            </div>
            <Link to="/assessment" className="pdf-explore-btn">
              Select interests
            </Link>
          </section>
        )}

        {/* 4 Top Stat Cards (Exact match to PDF Page 8 bottom) */}
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
            <span className="pdf-stat-eyebrow">ROADMAP PROGRESS</span>
            <strong className="pdf-stat-value">{roadmapProgressPct}%</strong>
            <span className="pdf-stat-sub">
              {activeRoadmaps.length} roadmap(s) started
            </span>
          </div>

          <div className="pdf-dash-stat-card">
            <span className="pdf-stat-eyebrow">COMPLETED STEPS</span>
            <strong className="pdf-stat-value">{completedStepsDisplay}</strong>
            <span className="pdf-stat-sub">Steps completed</span>
          </div>
        </section>

        {/* Main 2-Column Dashboard Layout (Matches PDF Page 8 bottom) */}
        <div className="pdf-dash-main-grid">
          {/* Left Column */}
          <div className="pdf-dash-left-col">
            {/* Continue where you left off */}
            <section className="pdf-dash-section">
              <div className="pdf-dash-section-head">
                <h2>Continue where you left off</h2>
              </div>

              {primaryRoadmap ? (
                <div className="pdf-continue-card">
                  <div className="pdf-continue-top">
                    <strong>{primaryRoadmap.careerName}</strong>
                    <span>
                      {primaryRoadmap.completedSteps}/
                      {primaryRoadmap.totalSteps} steps
                    </span>
                  </div>

                  <div className="pdf-continue-pct">
                    {primaryRoadmap.progressPercentage}%
                  </div>

                  <div className="pdf-progress-bar-track">
                    <div
                      className="pdf-progress-bar-fill"
                      style={{
                        width: `${primaryRoadmap.progressPercentage}%`,
                      }}
                    />
                  </div>

                  <div className="pdf-continue-next">
                    Next: <strong>{primaryRoadmap.nextStepTitle}</strong>
                  </div>

                  <div className="mt-3">
                    <Link
                      to={`/roadmaps/${primaryRoadmap.careerId}`}
                      className="pdf-explore-btn"
                    >
                      Continue
                    </Link>
                  </div>
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

            {/* Visual Progress & Match Graph Section */}
            <section className="pdf-dash-section">
              <div className="pdf-dash-section-head">
                <h2>
                  <BarChart3
                    size={18}
                    style={{
                      display: "inline",
                      verticalAlign: "text-bottom",
                      marginRight: "8px",
                    }}
                  />
                  Progress &amp; match graph
                </h2>
                <Link to="/matches" className="pdf-section-link">
                  Full breakdown
                </Link>
              </div>

              <div className="pdf-graph-card">
                <div className="pdf-graph-layout">
                  {/* Donut Chart for Roadmap Completion */}
                  <div className="pdf-donut-box">
                    <svg
                      viewBox="0 0 120 120"
                      className="pdf-donut-svg"
                      aria-label="Roadmap completion graph"
                    >
                      <circle
                        cx="60"
                        cy="60"
                        r="48"
                        fill="none"
                        stroke="var(--border-light)"
                        strokeWidth="12"
                      />
                      <circle
                        cx="60"
                        cy="60"
                        r="48"
                        fill="none"
                        stroke="var(--primary)"
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={`${(roadmapProgressPct / 100) * 301.6} 301.6`}
                        transform="rotate(-90 60 60)"
                      />
                      <text
                        x="60"
                        y="56"
                        textAnchor="middle"
                        className="pdf-donut-pct"
                      >
                        {roadmapProgressPct}%
                      </text>
                      <text
                        x="60"
                        y="74"
                        textAnchor="middle"
                        className="pdf-donut-sub"
                      >
                        Roadmap
                      </text>
                    </svg>
                    <span className="pdf-donut-caption">
                      {primaryRoadmap
                        ? primaryRoadmap.careerName
                        : "Overall Progress"}
                    </span>
                  </div>

                  {/* Horizontal Bar Graph of Top Career Matches */}
                  <div className="pdf-bar-chart-box">
                    <span className="pdf-graph-subtitle">
                      Career Match Score Distribution
                    </span>
                    {topMatches.length > 0 ? (
                      <div className="pdf-bars-stack">
                        {topMatches.map((m, idx) => {
                          const c = m.career || m;
                          const pct = m.matchPercentage ?? m.score ?? 70;
                          return (
                            <div key={c._id || idx} className="pdf-bar-row">
                              <div className="pdf-bar-label-row">
                                <span>{c.name}</span>
                                <strong>{pct}%</strong>
                              </div>
                              <div className="pdf-bar-track">
                                <div
                                  className="pdf-bar-fill"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="pdf-empty-note">
                        Complete your interest selection to view your career
                        match graph.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Saved Careers Quick View */}
            {savedCareers && savedCareers.length > 0 && (
              <section className="pdf-dash-section">
                <div className="pdf-dash-section-head">
                  <h2>Saved careers</h2>
                  <Link to="/saved-careers" className="pdf-section-link">
                    View all ({savedCareers.length})
                  </Link>
                </div>

                <div className="pdf-dash-saved-mini-grid">
                  {savedCareers.slice(0, 2).map((item, idx) => {
                    const c = item.career;
                    if (!c) return null;
                    const cId = c._id || c.id;
                    return (
                      <Link
                        key={cId || idx}
                        to={`/careers/${cId}`}
                        className="pdf-dash-saved-mini-card"
                      >
                        <div>
                          <span className="pdf-card-field-upper">
                            {(
                              c.fieldId?.name ||
                              c.fieldName ||
                              "CAREER"
                            ).toUpperCase()}
                          </span>
                          <h4>{c.name}</h4>
                        </div>
                        <ArrowRight size={15} />
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Recent activity (Exact match to PDF Page 8 bottom left) */}
            <section className="pdf-dash-section">
              <div className="pdf-dash-section-head">
                <h2>Recent activity</h2>
                {activities.length > 5 && (
                  <button
                    type="button"
                    className="pdf-section-link"
                    onClick={() => setShowAllActivities((prev) => !prev)}
                  >
                    {showAllActivities ? "Show less" : "View all"}
                  </button>
                )}
              </div>

              {loading ? (
                <div className="pdf-continue-card">
                  <p>Loading activity...</p>
                </div>
              ) : visibleActivities.length > 0 ? (
                <div className="pdf-activity-stack">
                  {visibleActivities.map((act, idx) => (
                    <div key={act._id || idx} className="pdf-activity-row-card">
                      <div className="pdf-activity-left">
                        {getActivityIcon(act.type)}
                        <span>{act.description || "Activity recorded"}</span>
                      </div>
                      <span className="pdf-activity-date">
                        {formatActivityDate(act.createdAt)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="pdf-continue-card">
                  <p>
                    No activity recorded yet. Explore a career or start a
                    roadmap to see your history here.
                  </p>
                </div>
              )}
            </section>
          </div>

          {/* Right Column: Top matches + Notifications (Matches PDF Page 8 bottom right) */}
          <aside className="pdf-dash-right-col">
            {/* Top matches */}
            <section className="pdf-dash-section">
              <div className="pdf-dash-section-head">
                <h2>Top matches</h2>
                <Link to="/matches" className="pdf-section-link">
                  All matches
                </Link>
              </div>

              {topMatches.length > 0 ? (
                <div className="pdf-top-matches-stack">
                  {topMatches.map((item, idx) => {
                    const career = item.career || item;
                    const careerId = career._id || career.id;
                    const matchScore =
                      item.matchPercentage ?? item.score ?? 70;
                    const fieldName =
                      career.fieldId?.name || career.fieldName || "Business";
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
              ) : (
                <div className="pdf-continue-card">
                  <p>Select your interests to see your top matches.</p>
                </div>
              )}
            </section>

            {/* Notifications */}
            <section className="pdf-dash-section">
              <div className="pdf-dash-section-head">
                <h2>Notifications</h2>
                <div style={{ display: "flex", gap: "10px" }}>
                  {notifications.some((n) => !n.isRead) && (
                    <button
                      type="button"
                      className="pdf-section-link"
                      onClick={handleMarkAllRead}
                    >
                      Mark read
                    </button>
                  )}
                  {notifications.length > 4 && (
                    <button
                      type="button"
                      className="pdf-section-link"
                      onClick={() => setShowAllNotifications((prev) => !prev)}
                    >
                      {showAllNotifications ? "Show less" : "View all"}
                    </button>
                  )}
                </div>
              </div>

              {visibleNotifications.length > 0 ? (
                <div className="pdf-notif-stack">
                  {visibleNotifications.map((notif, idx) => (
                    <div
                      key={notif._id || idx}
                      className={`pdf-notif-card ${
                        notif.isRead ? "read" : "unread"
                      }`}
                    >
                      <strong>{notif.title || "Notification"}</strong>
                      {notif.message && <p>{notif.message}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="pdf-continue-card">
                  <p>No notifications right now.</p>
                </div>
              )}
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}
