import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import Navbar from "../components/Navbar";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  Compass,
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

export default function Roadmap() {
  const { careerId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, token } = useAuth();

  const [roadmap, setRoadmap] = useState(null);
  const [career, setCareer] = useState(null);
  const [completedStepIds, setCompletedStepIds] = useState([]);
  const [expandedStepIds, setExpandedStepIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [togglingStepId, setTogglingStepId] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  // Enforce login/signup for roadmap access
  useEffect(() => {
    if (!isAuthenticated) {
      sessionStorage.setItem("returnAfterLogin", `/roadmaps/${careerId}`);
      sessionStorage.setItem(
        "authGateMessage",
        "Please sign in or create a free account to access interactive career roadmaps and track your step-by-step progress."
      );
      navigate("/login");
    }
  }, [isAuthenticated, careerId, navigate]);

  useEffect(() => {
    if (!isAuthenticated || !careerId) return;

    const fetchRoadmapData = async () => {
      try {
        setLoading(true);
        setError("");
        const authToken = token || localStorage.getItem("token");

        const [careerRes, roadmapRes, progRes] = await Promise.all([
          fetch(`${API_URL}/careers/${careerId}`),
          fetch(`${API_URL}/roadmaps/career/${careerId}`),
          fetch(`${API_URL}/roadmaps/career/${careerId}/progress`, {
            headers: { Authorization: `Bearer ${authToken}` },
          }),
        ]);

        if (careerRes.ok) {
          const cData = await careerRes.json();
          setCareer(cData);
        }

        let rData = null;
        if (roadmapRes.ok) {
          rData = await roadmapRes.json();
          setRoadmap(rData);
        } else {
          setError(
            "No structured learning roadmap has been registered for this career yet."
          );
        }

        let doneIds = [];
        if (progRes.ok) {
          const progData = await progRes.json();
          if (Array.isArray(progData.completedStepIds)) {
            doneIds = progData.completedStepIds.map((id) => String(id));
            setCompletedStepIds(doneIds);
          }
        }

        // Expand the first step (or first incomplete step) by default
        if (rData && Array.isArray(rData.steps) && rData.steps.length > 0) {
          const firstStepId = String(
            rData.steps[0]._id || rData.steps[0].stepNumber || 1
          );
          setExpandedStepIds([firstStepId]);
        }
      } catch (err) {
        console.error("Failed to load roadmap:", err);
        setError("Failed to load learning roadmap. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmapData();
  }, [careerId, isAuthenticated, token]);

  const toggleExpandStep = (stepId) => {
    const idStr = String(stepId);
    setExpandedStepIds((prev) =>
      prev.includes(idStr)
        ? prev.filter((id) => id !== idStr)
        : [...prev, idStr]
    );
  };

  const handleToggleStep = async (stepObj, index) => {
    const sId = String(stepObj._id || stepObj.stepNumber || index + 1);
    const isCurrentlyDone = completedStepIds.includes(sId);
    setTogglingStepId(sId);

    try {
      const authToken = token || localStorage.getItem("token");
      const res = await fetch(
        `${API_URL}/roadmaps/career/${careerId}/toggle-step`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ stepId: sId }),
        }
      );

      if (res.ok) {
        const updated = await res.json();
        if (Array.isArray(updated.completedStepIds)) {
          setCompletedStepIds(updated.completedStepIds.map((id) => String(id)));
        } else {
          setCompletedStepIds((prev) =>
            isCurrentlyDone ? prev.filter((id) => id !== sId) : [...prev, sId]
          );
        }

        setToastMessage(
          isCurrentlyDone
            ? `"${stepObj.title}" marked as not complete.`
            : `"${stepObj.title}" marked complete.`
        );
        setTimeout(() => setToastMessage(""), 3500);
      }
    } catch (err) {
      console.error("Failed to toggle step:", err);
    } finally {
      setTogglingStepId("");
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  const stepsList = Array.isArray(roadmap?.steps) ? roadmap.steps : [];
  const totalSteps = stepsList.length;
  const completedCount = stepsList.filter((s, idx) =>
    completedStepIds.includes(String(s._id || s.stepNumber || idx + 1))
  ).length;
  const progressPct =
    totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  const nextIncompleteStep = stepsList.find(
    (s, idx) =>
      !completedStepIds.includes(String(s._id || s.stepNumber || idx + 1))
  );

  return (
    <div className="roadmap-page">
      <Navbar />

      {/* Bottom-Right Toast (Matches PDF Page 7 bottom right) */}
      {toastMessage && (
        <div className="pdf-bottom-toast">
          <span>{toastMessage}</span>
          <button
            type="button"
            className="pdf-toast-close"
            onClick={() => setToastMessage("")}
          >
            Close
          </button>
        </div>
      )}

      <main className="page-container pdf-roadmap-container">
        <div className="pdf-roadmap-back-row">
          <Link to={`/careers/${careerId}`} className="pdf-back-link">
            <ArrowLeft size={14} />
            <span>Back to {career?.name || "Career"}</span>
          </Link>
        </div>

        {loading && (
          <div className="saved-loading-state">
            <div className="loading-spinner-dot"></div>
            <p>Loading roadmap milestones...</p>
          </div>
        )}

        {!loading && error && (
          <div className="saved-empty-card">
            <Compass size={40} className="empty-icon" />
            <h3>Roadmap Not Found</h3>
            <p>{error}</p>
            <Link to="/careers" className="pdf-explore-btn large">
              <span>Explore other careers</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        )}

        {!loading && roadmap && (
          <>
            {/* Header (Matches PDF Page 7 bottom) */}
            <header className="pdf-roadmap-header">
              <h1>{roadmap.title || `${career?.name || "Career"} Roadmap`}</h1>
              <p>
                {roadmap.summary ||
                  "Follow these steps in order and mark each one as you finish it."}
              </p>
            </header>

            {/* Progress Card */}
            <section className="pdf-roadmap-progress-card">
              <div className="pdf-roadmap-prog-top">
                <strong>
                  {completedCount}/{totalSteps} steps complete
                </strong>
                <span>{progressPct}%</span>
              </div>

              <div className="pdf-progress-bar-track">
                <div
                  className="pdf-progress-bar-fill"
                  style={{ width: `${progressPct}%` }}
                />
              </div>

              <div className="pdf-roadmap-next-up">
                {nextIncompleteStep ? (
                  <>
                    Next up: <strong>{nextIncompleteStep.title}</strong>
                  </>
                ) : (
                  <strong>All roadmap steps completed! 🎉</strong>
                )}
              </div>
            </section>

            {/* Accordion Milestone Steps */}
            <section className="pdf-roadmap-steps-stack">
              {stepsList.map((step, index) => {
                const stepId = String(
                  step._id || step.stepNumber || index + 1
                );
                const isDone = completedStepIds.includes(stepId);
                const isExpanded = expandedStepIds.includes(stepId);
                const isToggling = togglingStepId === stepId;

                return (
                  <article
                    key={stepId}
                    className={`pdf-step-accordion-card ${
                      isDone ? "done" : ""
                    } ${isExpanded ? "expanded" : ""}`}
                  >
                    <button
                      type="button"
                      className="pdf-step-accordion-header"
                      onClick={() => toggleExpandStep(stepId)}
                    >
                      <div className="pdf-step-header-left">
                        <span
                          className={`pdf-step-circle ${isDone ? "done" : ""}`}
                        >
                          {isDone ? (
                            <Check size={14} strokeWidth={3} />
                          ) : (
                            step.stepNumber || index + 1
                          )}
                        </span>
                        <div className="pdf-step-title-wrap">
                          <h3>{step.title}</h3>
                          {step.estimatedWeeks && (
                            <span>About {step.estimatedWeeks} weeks</span>
                          )}
                        </div>
                      </div>

                      <span className="pdf-step-chevron">
                        {isExpanded ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="pdf-step-accordion-body">
                        <p className="pdf-step-desc">{step.description}</p>

                        {step.whyItMatters && (
                          <div className="pdf-step-block">
                            <span className="pdf-step-eyebrow">
                              WHY LEARN IT
                            </span>
                            <p>{step.whyItMatters}</p>
                          </div>
                        )}

                        {Array.isArray(step.topics) &&
                          step.topics.length > 0 && (
                            <div className="pdf-step-block">
                              <span className="pdf-step-eyebrow">TOPICS</span>
                              <div className="pdf-card-skills mt-1">
                                {step.topics.map((t, tIdx) => (
                                  <span key={tIdx} className="pdf-skill-pill">
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                        {step.practice && (
                          <div className="pdf-step-block">
                            <span className="pdf-step-eyebrow">PRACTICE</span>
                            <p>{step.practice}</p>
                          </div>
                        )}

                        <div className="pdf-step-action-row">
                          <button
                            type="button"
                            className={
                              isDone ? "pdf-outline-btn" : "pdf-explore-btn"
                            }
                            onClick={() => handleToggleStep(step, index)}
                            disabled={isToggling}
                          >
                            {isDone
                              ? "Mark as not complete"
                              : "Mark as complete"}
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
