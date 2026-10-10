import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import Navbar from "../components/Navbar";
import {
  Search,
  Heart,
  Compass,
  ArrowLeft,
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

export default function SavedCareers() {
  const navigate = useNavigate();
  const {
    isAuthenticated,
    token,
    savedCareers,
    loadingSaved,
    toggleSaveCareer,
  } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [removingId, setRemovingId] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [fields, setFields] = useState([]);
  const [matchMap, setMatchMap] = useState({});

  // Signed-in users only
  useEffect(() => {
    if (!isAuthenticated) {
      sessionStorage.setItem("returnAfterLogin", "/saved-careers");
      sessionStorage.setItem(
        "authGateMessage",
        "Please sign in or create an account to view your saved careers."
      );
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetch(`${API_URL}/fields`)
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => {
        const arr = Array.isArray(d) ? d : d.fields || d.data || [];
        setFields(arr);
      })
      .catch(() => {});

    const authToken = token || localStorage.getItem("token");
    if (authToken) {
      fetch(`${API_URL}/recommendations`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          const recs = Array.isArray(d) ? d : d?.recommendations || [];
          const map = {};
          recs.forEach((item) => {
            const cId = item.career?._id || item.career?.id;
            if (cId) map[String(cId)] = item.matchPercentage || 70;
          });
          setMatchMap(map);
        })
        .catch(() => {});
    }
  }, [isAuthenticated, token]);

  const getFieldName = (career) => {
    if (typeof career.fieldId === "object" && career.fieldId?.name) {
      return career.fieldId.name;
    }
    if (career.fieldName) return career.fieldName;
    if (typeof career.fieldId === "string") {
      const match = fields.find(
        (f) => String(f._id) === String(career.fieldId)
      );
      if (match) return match.name;
    }
    return "Business";
  };

  const handleRemove = async (careerId) => {
    try {
      setRemovingId(careerId);
      const res = await toggleSaveCareer(careerId);
      if (res.success) {
        setFeedbackMessage("Removed from saved careers.");
        setTimeout(() => setFeedbackMessage(""), 3000);
      }
    } catch (err) {
      console.error("Failed to remove career:", err);
    } finally {
      setRemovingId("");
    }
  };

  const filteredCareers = useMemo(() => {
    if (!savedCareers || !Array.isArray(savedCareers)) return [];
    return savedCareers.filter((item) => {
      const career = item.career;
      if (!career) return false;
      const skillsStr = Array.isArray(career.technicalSkills)
        ? career.technicalSkills.join(" ")
        : "";
      const text = `
        ${career.name || ""}
        ${career.shortDescription || ""}
        ${career.description || ""}
        ${career.fieldId?.name || ""}
        ${career.subfieldId?.name || ""}
        ${skillsStr}
      `.toLowerCase();
      return text.includes(searchQuery.toLowerCase());
    });
  }, [savedCareers, searchQuery]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="saved-careers-page">
      <Navbar />

      {feedbackMessage && (
        <div className="pdf-bottom-toast">
          <span>{feedbackMessage}</span>
          <button
            type="button"
            className="pdf-toast-close"
            onClick={() => setFeedbackMessage("")}
          >
            Close
          </button>
        </div>
      )}

      <main className="page-container saved-careers-container">
        <div className="pdf-page-back-row">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="pdf-back-btn"
            title="Go back"
          >
            <ArrowLeft size={15} />
            <span>Back</span>
          </button>
        </div>

        {/* Header (Matches PDF Page 8 top) */}
        <section className="pdf-page-intro">
          <h1>Saved careers</h1>
          <p>Everything you bookmarked while exploring, in one place.</p>
        </section>

        {/* Search Bar */}
        <form
          className="pdf-saved-search-row"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="pdf-search-input-wrap">
            <Search size={18} className="pdf-search-icon" />
            <input
              type="text"
              placeholder="Search your saved careers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="pdf-search-clear"
                onClick={() => setSearchQuery("")}
              >
                Clear
              </button>
            )}
          </div>
          <button type="submit" className="pdf-search-btn">
            Search
          </button>
        </form>

        {loadingSaved && (
          <div className="saved-loading-state">
            <div className="loading-spinner-dot"></div>
            <p>Loading your saved careers...</p>
          </div>
        )}

        {!loadingSaved && savedCareers.length === 0 && (
          <div className="saved-empty-card">
            <div className="saved-empty-icon-box">
              <Compass size={40} />
            </div>
            <h3>No saved careers yet</h3>
            <p>
              Bookmark careers while exploring or reviewing your matches to keep
              them in one place.
            </p>
            <Link to="/careers" className="pdf-explore-btn large">
              Explore careers
            </Link>
          </div>
        )}

        {!loadingSaved &&
          savedCareers.length > 0 &&
          filteredCareers.length === 0 && (
            <div className="saved-empty-card small">
              <h3>No matching saved careers</h3>
              <p>No saved careers match "{searchQuery}".</p>
              <button
                type="button"
                className="pdf-outline-btn"
                onClick={() => setSearchQuery("")}
              >
                Clear search
              </button>
            </div>
          )}

        {!loadingSaved && filteredCareers.length > 0 && (
          <section className="pdf-career-cards-grid">
            {filteredCareers.map((item, index) => {
              const career = item.career;
              if (!career) return null;

              const careerId = career._id || career.id || item.careerId;
              const fieldName = getFieldName(career);
              const subfieldName =
                career.subfieldId?.name || career.subfieldName || "";
              const skills = Array.isArray(career.technicalSkills)
                ? career.technicalSkills
                : Array.isArray(career.skills)
                ? career.skills
                : [];
              const matchPct = matchMap[String(careerId)] || 70;

              return (
                <article
                  className="pdf-career-card"
                  key={careerId || index}
                >
                  <div className="pdf-card-body">
                    <div className="pdf-card-top-meta">
                      <span className="pdf-card-field-upper">
                        {fieldName.toUpperCase()}
                      </span>
                      <span className="pdf-match-pill high">
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
                        career.description ||
                        "Explore required skills, salary ranges and step-by-step roadmap."}
                    </p>

                    {skills.length > 0 && (
                      <div className="pdf-card-skills">
                        {skills.slice(0, 4).map((skill, sIdx) => (
                          <span key={sIdx} className="pdf-skill-pill">
                            {skill}
                          </span>
                        ))}
                        {skills.length > 4 && (
                          <span className="pdf-skill-more">
                            +{skills.length - 4}
                          </span>
                        )}
                      </div>
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
                      className="pdf-save-btn saved"
                      onClick={() => handleRemove(careerId)}
                      disabled={removingId === careerId}
                    >
                      <Heart size={14} fill="currentColor" />
                      <span>Saved</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </main>
    </div>
  );
}