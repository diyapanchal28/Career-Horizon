import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import Navbar from "../components/Navbar";
import {
  Heart,
  ArrowRight,
  Check,
  Compass,
  Scale,
  X,
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

export default function Recommendations() {
  const navigate = useNavigate();
  const { isAuthenticated, token, isCareerSaved, toggleSaveCareer } = useAuth();

  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(() => {
    const msg = sessionStorage.getItem("matchesSavedToast") || "";
    if (msg) sessionStorage.removeItem("matchesSavedToast");
    return msg;
  });
  const [savingCareerId, setSavingCareerId] = useState("");

  // Career Comparison state (up to 3 careers)
  const [compareList, setCompareList] = useState([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Signed-in users only
  useEffect(() => {
    if (!isAuthenticated) {
      sessionStorage.setItem("returnAfterLogin", "/matches");
      sessionStorage.setItem(
        "authGateMessage",
        "Please sign in or create an account to view your personalised career matches."
      );
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const authToken = token || localStorage.getItem("token");

        const res = await fetch(`${API_URL}/recommendations`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          const recArray = Array.isArray(data)
            ? data
            : data.recommendations || [];
          setRecommendations(recArray);
        }
      } catch (err) {
        console.error("Failed to load recommendations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [isAuthenticated, token]);

  const handleSaveToggle = async (e, careerId) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      setSavingCareerId(careerId);
      const res = await toggleSaveCareer(careerId);
      if (res.success) {
        setToastMessage(
          res.saved ? "Saved to your careers." : "Removed from saved careers."
        );
        setTimeout(() => setToastMessage(""), 2800);
      }
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setSavingCareerId("");
    }
  };

  const toggleCompare = (career) => {
    const careerId = career._id || career.id;
    const exists = compareList.some(
      (item) => (item._id || item.id) === careerId
    );

    if (exists) {
      setCompareList((prev) =>
        prev.filter((item) => (item._id || item.id) !== careerId)
      );
    } else {
      if (compareList.length >= 3) {
        setToastMessage("You can compare up to 3 careers at once.");
        setTimeout(() => setToastMessage(""), 2500);
        return;
      }
      setCompareList((prev) => [...prev, career]);
    }
  };

  const isCompared = (careerId) => {
    return compareList.some((item) => (item._id || item.id) === careerId);
  };

  const formatSalaryBand = (career) => {
    const bands = career?.salary?.bands;
    if (Array.isArray(bands) && bands.length > 0) {
      const entry = bands[0];
      const minL = (entry.min / 100000).toFixed(1).replace(/\.0$/, "");
      const maxL = (entry.max / 100000).toFixed(1).replace(/\.0$/, "");
      return `₹${minL}L – ₹${maxL}L / yr`;
    }
    return career?.salary?.entryLevel || "₹4L – ₹7.5L / yr";
  };

  return (
    <div className="recommendations-page">
      <Navbar />

      {/* Bottom-Right Toast (Matches PDF Page 6) */}
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

      <main className="page-container recommendations-container">
        {/* Header (Matches PDF Page 6 top) */}
        <section className="pdf-matches-header">
          <div className="pdf-matches-header-top">
            <div>
              <h1>Your career matches</h1>
              <p>
                Match percentages show how closely a career lines up with the
                interests you selected. They are a starting point for research,
                not a guarantee of suitability.
              </p>
              <p className="pdf-scoring-line">
                Scoring: field match 40% · subfield match 30% · work interest
                20% · work preference 10%.{" "}
                <Link to="/about" className="pdf-inline-cta">
                  How this works
                </Link>
              </p>
            </div>

            <Link to="/assessment" className="pdf-outline-btn">
              Edit interests
            </Link>
          </div>
        </section>

        {loading ? (
          <div className="saved-loading-state">
            <div className="loading-spinner-dot"></div>
            <p>Calculating your career matches...</p>
          </div>
        ) : recommendations.length === 0 ? (
          <section className="empty-rec-card">
            <Compass size={44} className="empty-rec-icon" />
            <h2>No matches calculated yet</h2>
            <p>
              Tell us what areas and subfields interest you to see your
              personalised career matches.
            </p>
            <Link to="/assessment" className="pdf-explore-btn large">
              Select your interests
            </Link>
          </section>
        ) : (
          <section className="pdf-career-cards-grid">
            {recommendations.map((item) => {
              const career = item.career || item;
              const careerId = career._id || career.id;
              const matchPct = item.matchPercentage ?? item.score ?? 70;
              const fieldName =
                career.fieldId?.name || career.fieldName || "Career";
              const subfieldName =
                career.subfieldId?.name || career.subfieldName || "";
              const isSaved = isCareerSaved(careerId);
              const isSaving = savingCareerId === careerId;
              const inCompare = isCompared(careerId);
              const reasons = item.matchReasons || item.reasons || [];
              const skills = Array.isArray(career.technicalSkills)
                ? career.technicalSkills
                : [];

              const badgeTone =
                matchPct >= 65
                  ? "high"
                  : matchPct >= 45
                  ? "medium"
                  : "low";

              return (
                <article key={careerId} className="pdf-career-card">
                  <div className="pdf-card-body">
                    <div className="pdf-card-top-meta">
                      <span className="pdf-card-field-upper">
                        {fieldName.toUpperCase()}
                      </span>
                      <span className={`pdf-match-pill ${badgeTone}`}>
                        {matchPct}% match
                      </span>
                    </div>

                    <h3 className="pdf-card-title">
                      <Link to={`/careers/${careerId}`}>{career.name}</Link>
                    </h3>

                    {subfieldName && (
                      <span className="pdf-card-subfield">{subfieldName}</span>
                    )}

                    <p className="pdf-card-desc">
                      {career.shortDescription ||
                        career.description?.substring(0, 140) + "..." ||
                        "Explore career milestones, market demand, and learning roadmaps."}
                    </p>

                    {skills.length > 0 && (
                      <div className="pdf-card-skills">
                        {skills.slice(0, 4).map((s, idx) => (
                          <span key={idx} className="pdf-skill-pill">
                            {s}
                          </span>
                        ))}
                        {skills.length > 4 && (
                          <span className="pdf-skill-more">
                            +{skills.length - 4}
                          </span>
                        )}
                      </div>
                    )}

                    {reasons.length > 0 && (
                      <ul className="pdf-card-reasons">
                        {reasons.slice(0, 2).map((reason, rIdx) => (
                          <li key={rIdx}>
                            <Check size={13} className="pdf-reason-check" />
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="pdf-card-footer">
                    <Link
                      to={`/careers/${careerId}`}
                      className="pdf-explore-btn"
                    >
                      Explore
                    </Link>

                    <button
                      type="button"
                      className={`pdf-save-btn ${isSaved ? "saved" : ""}`}
                      onClick={(e) => handleSaveToggle(e, careerId)}
                      disabled={isSaving}
                    >
                      <Heart
                        size={14}
                        fill={isSaved ? "currentColor" : "none"}
                      />
                      <span>{isSaved ? "Saved" : "Save"}</span>
                    </button>

                    <label className="pdf-compare-check">
                      <input
                        type="checkbox"
                        checked={inCompare}
                        onChange={() => toggleCompare(career)}
                      />
                      <span>Compare</span>
                    </label>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        {/* Sticky Comparison Bottom Dock */}
        {compareList.length > 0 && (
          <div className="compare-floating-dock">
            <div className="dock-content">
              <div className="dock-info">
                <Scale size={20} className="dock-icon" />
                <div>
                  <strong>Comparing {compareList.length} of 3 Careers</strong>
                  <span>{compareList.map((c) => c.name).join(", ")}</span>
                </div>
              </div>

              <div className="dock-buttons">
                <button
                  type="button"
                  className="dock-clear-btn"
                  onClick={() => setCompareList([])}
                >
                  Clear
                </button>
                <button
                  type="button"
                  className="primary-btn dock-launch-btn"
                  onClick={() => setIsCompareModalOpen(true)}
                >
                  <span>Compare Now</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Career Comparison Modal Dialog */}
        {isCompareModalOpen && (
          <div className="modal-backdrop">
            <div className="comparison-modal-card">
              <div className="modal-header">
                <div className="modal-title-box">
                  <Scale size={22} />
                  <h2>Side-by-Side Career Comparison</h2>
                </div>
                <button
                  type="button"
                  className="close-modal-btn"
                  onClick={() => setIsCompareModalOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="comparison-table-wrapper">
                <table className="comparison-matrix-table">
                  <thead>
                    <tr>
                      <th>Attribute</th>
                      {compareList.map((c) => (
                        <th key={c._id || c.id}>{c.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <strong>Field</strong>
                      </td>
                      {compareList.map((c) => (
                        <td key={c._id || c.id}>
                          {c.fieldId?.name || c.fieldName || "General"}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td>
                        <strong>Specialisation</strong>
                      </td>
                      {compareList.map((c) => (
                        <td key={c._id || c.id}>
                          {c.subfieldId?.name || c.subfieldName || "—"}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td>
                        <strong>Demand</strong>
                      </td>
                      {compareList.map((c) => (
                        <td key={c._id || c.id}>
                          <span className="compare-demand-pill">
                            {typeof c.demand === "object"
                              ? c.demand?.level
                              : c.demand || "High"}
                          </span>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td>
                        <strong>Minimum Education</strong>
                      </td>
                      {compareList.map((c) => (
                        <td key={c._id || c.id}>
                          {c.education?.minimumQualification || "Undergraduate"}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td>
                        <strong>Entry Level Salary</strong>
                      </td>
                      {compareList.map((c) => (
                        <td key={c._id || c.id}>{formatSalaryBand(c)}</td>
                      ))}
                    </tr>
                    <tr>
                      <td>
                        <strong>Key Technical Skills</strong>
                      </td>
                      {compareList.map((c) => (
                        <td key={c._id || c.id}>
                          <div className="compare-skills-list">
                            {(Array.isArray(c.technicalSkills)
                              ? c.technicalSkills
                              : []
                            )
                              .slice(0, 4)
                              .map((s, i) => (
                                <span key={i} className="pdf-skill-pill">
                                  {s}
                                </span>
                              ))}
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td>
                        <strong>Action</strong>
                      </td>
                      {compareList.map((c) => (
                        <td key={c._id || c.id}>
                          <Link
                            to={`/careers/${c._id || c.id}`}
                            className="pdf-explore-btn"
                            onClick={() => setIsCompareModalOpen(false)}
                          >
                            Explore Career
                          </Link>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
