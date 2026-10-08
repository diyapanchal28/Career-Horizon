import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import Navbar from "../components/Navbar";
import {
  Search,
  Sparkles,
  ArrowRight,
  Heart,
  Lock,
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, isCareerSaved, toggleSaveCareer } = useAuth();

  const [careers, setCareers] = useState([]);
  const [fields, setFields] = useState([]);
  const [subfields, setSubfields] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedField, setSelectedField] = useState("all");
  const [loading, setLoading] = useState(true);
  const [savingCareerId, setSavingCareerId] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [careerResponse, fieldResponse, subfieldResponse] = await Promise.all([
          fetch(`${API_URL}/careers`),
          fetch(`${API_URL}/fields`),
          fetch(`${API_URL}/subfields`),
        ]);

        const careerData = careerResponse.ok ? await careerResponse.json() : [];
        const fieldData = fieldResponse.ok ? await fieldResponse.json() : [];
        const subfieldData = subfieldResponse.ok ? await subfieldResponse.json() : [];

        setCareers(
          Array.isArray(careerData)
            ? careerData
            : careerData.careers || careerData.data || []
        );
        setFields(
          Array.isArray(fieldData)
            ? fieldData
            : fieldData.fields || fieldData.data || []
        );
        setSubfields(
          Array.isArray(subfieldData)
            ? subfieldData
            : subfieldData.subfields || subfieldData.data || []
        );
      } catch (error) {
        console.error("Failed to load homepage data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleExploreCareer = (e, careerId) => {
    e.preventDefault();
    if (!isAuthenticated) {
      sessionStorage.setItem("returnAfterLogin", `/careers/${careerId}`);
      sessionStorage.setItem(
        "authGateMessage",
        "Sign in or create a free account to view full career details, salary insights, and step-by-step roadmaps."
      );
      navigate("/login");
      return;
    }
    navigate(`/careers/${careerId}`);
  };

  const handleSaveToggle = async (e, careerId) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      sessionStorage.setItem("returnAfterLogin", `/careers/${careerId}`);
      sessionStorage.setItem(
        "authGateMessage",
        "Please sign in or create an account to save careers to your personal shortlist."
      );
      navigate("/login");
      return;
    }

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

  const handleHeroSearchSubmit = (e) => {
    e.preventDefault();
    if (search.trim()) {
      document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/careers");
    }
  };

  /* Filter careers based on search text and selected field */
  const filteredCareers = useMemo(() => {
    return careers.filter((career) => {
      const skillsStr = Array.isArray(career.technicalSkills)
        ? career.technicalSkills.join(" ")
        : "";
      const matchesSearch = `
        ${career.name || ""}
        ${career.shortDescription || ""}
        ${career.description || ""}
        ${career.fieldId?.name || ""}
        ${career.subfieldId?.name || ""}
        ${skillsStr}
      `
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesField =
        selectedField === "all" ||
        career.fieldId?._id === selectedField ||
        career.fieldId?.name?.toLowerCase() === selectedField.toLowerCase();

      return matchesSearch && matchesField;
    });
  }, [careers, search, selectedField]);

  const displayCareers =
    search || selectedField !== "all" ? filteredCareers : careers.slice(0, 6);

  const getSubfieldsForField = (fieldId) => {
    return subfields.filter(
      (sub) =>
        sub.fieldId === fieldId ||
        sub.fieldId?._id === fieldId ||
        sub.field === fieldId ||
        sub.field?._id === fieldId
    );
  };

  const getCareerCountForField = (fieldId) => {
    return careers.filter(
      (c) =>
        c.fieldId === fieldId ||
        c.fieldId?._id === fieldId ||
        c.field === fieldId
    ).length;
  };

  return (
    <div className="home-page">
      <Navbar />

      {toastMessage && (
        <div className="global-save-toast">
          <Sparkles size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      <main>
        {/* ================= PDF-STYLE CENTERED HERO SECTION ================= */}
        <section className="pdf-hero-banner">
          <div className="pdf-hero-inner">
            <h1 className="pdf-hero-title">
              Discover. Explore.
              <br />
              Plan your career.
            </h1>

            <p className="pdf-hero-subtitle">
              Browse hundreds of career paths, see which ones line up with what
              you actually enjoy, and follow a step-by-step roadmap to get there.
              No account needed to start looking.
            </p>

            <form className="pdf-hero-search-bar" onSubmit={handleHeroSearchSubmit}>
              <div className="pdf-search-input-wrap">
                <Search size={18} className="pdf-search-icon" />
                <input
                  type="text"
                  placeholder="Search careers, skills, or fields..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button
                    type="button"
                    className="pdf-search-clear"
                    onClick={() => setSearch("")}
                  >
                    Clear
                  </button>
                )}
              </div>
              <button type="submit" className="pdf-search-btn">
                Search
              </button>
            </form>

            {/* Quick Try Tags */}
            <div className="pdf-try-row">
              <span className="pdf-try-label">Try:</span>
              {["Data Analyst", "UI/UX Designer", "Cybersecurity", "Business Analyst"].map(
                (tag) => (
                  <button
                    key={tag}
                    type="button"
                    className={`pdf-try-chip ${search === tag ? "active" : ""}`}
                    onClick={() => {
                      setSearch(search === tag ? "" : tag);
                      document
                        .getElementById("explore")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    {tag}
                  </button>
                )
              )}
            </div>

            {/* Account Prompt */}
            <p className="pdf-hero-account-prompt">
              {!isAuthenticated ? (
                <>
                  Want matches picked for you?{" "}
                  <Link to="/register" className="pdf-inline-cta">
                    Create a free account
                  </Link>
                </>
              ) : (
                <>
                  Ready to continue your journey?{" "}
                  <Link to="/dashboard" className="pdf-inline-cta">
                    Go to your dashboard
                  </Link>
                </>
              )}
            </p>
          </div>
        </section>

        {/* ================= EXPLORE CAREERS PREVIEW ================= */}
        <section id="explore" className="content-section">
          <div className="section-title-row">
            <div>
              <h2>
                {search
                  ? `Search results for "${search}"`
                  : selectedField !== "all"
                  ? "Careers in selected field"
                  : "Explore careers"}
              </h2>
              <p>
                {displayCareers.length} career{" "}
                {displayCareers.length === 1 ? "path" : "paths"} shown —{" "}
                {!isAuthenticated
                  ? "sign in to unlock full career details and step-by-step roadmaps."
                  : "click Explore to view full details and roadmaps."}
              </p>
            </div>

            <div className="section-actions-right">
              {(search || selectedField !== "all") && (
                <button
                  type="button"
                  className="reset-filter-btn"
                  onClick={() => {
                    setSearch("");
                    setSelectedField("all");
                  }}
                >
                  Reset filters
                </button>
              )}
              <Link to="/careers" className="secondary-btn small">
                <span>View all {careers.length} careers</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner-dot"></div>
              <span>Loading careers...</span>
            </div>
          ) : displayCareers.length > 0 ? (
            <div className="pdf-career-cards-grid">
              {displayCareers.map((career, index) => {
                const careerId = career._id || career.id;
                const saved = isCareerSaved(careerId);
                const fieldName =
                  career.fieldId?.name || career.fieldName || "General";
                const subfieldName =
                  career.subfieldId?.name || career.subfieldName || "";
                const skills = Array.isArray(career.technicalSkills)
                  ? career.technicalSkills
                  : [];

                return (
                  <article className="pdf-career-card" key={careerId || index}>
                    <div className="pdf-card-body">
                      <span className="pdf-card-field-upper">
                        {fieldName.toUpperCase()}
                      </span>

                      <h3 className="pdf-card-title">{career.name}</h3>

                      {subfieldName && (
                        <span className="pdf-card-subfield">{subfieldName}</span>
                      )}

                      <p className="pdf-card-desc">
                        {career.shortDescription ||
                          career.description ||
                          "Explore the roadmap, required skills, and market demand."}
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
                      <button
                        type="button"
                        className="pdf-explore-btn"
                        onClick={(e) => handleExploreCareer(e, careerId)}
                      >
                        {!isAuthenticated && <Lock size={13} />}
                        <span>Explore</span>
                      </button>

                      <button
                        type="button"
                        className={`pdf-save-btn ${saved ? "saved" : ""}`}
                        onClick={(e) => handleSaveToggle(e, careerId)}
                        disabled={savingCareerId === careerId}
                      >
                        <Heart
                          size={14}
                          fill={saved ? "currentColor" : "none"}
                        />
                        <span>{saved ? "Saved" : "Save"}</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <h3>No careers match your search</h3>
              <p>Try searching for a different keyword or clearing your filter.</p>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => {
                  setSearch("");
                  setSelectedField("all");
                }}
              >
                Reset search
              </button>
            </div>
          )}
        </section>

        {/* ================= CAREER FIELDS OVERVIEW (PDF PAGE 1 BOTTOM) ================= */}
        <section id="fields" className="content-section">
          <div className="section-title-row">
            <div>
              <h2>Career fields</h2>
              <p>
                Every career on Career Horizon sits inside a field and a
                specialisation within it. Browsing from the top down is a good
                way to find roles you did not know existed.
              </p>
            </div>
            <Link to="/fields" className="secondary-btn small">
              <span>All career fields</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          {!loading && fields.length > 0 && (
            <div className="pdf-fields-stack">
              {fields.slice(0, 4).map((field) => {
                const fieldSubs = getSubfieldsForField(field._id);
                const count = getCareerCountForField(field._id);

                return (
                  <div key={field._id} className="pdf-field-block">
                    <div className="pdf-field-block-header">
                      <div>
                        <h3>{field.name}</h3>
                        <p>{field.description}</p>
                      </div>
                      <Link
                        to={`/careers?fieldId=${field._id}`}
                        className="pdf-field-count-badge"
                      >
                        {count} {count === 1 ? "career" : "careers"}
                      </Link>
                    </div>

                    {fieldSubs.length > 0 && (
                      <div className="pdf-subfields-grid">
                        {fieldSubs.map((sub) => (
                          <Link
                            key={sub._id}
                            to={`/careers?fieldId=${field._id}&subfieldId=${sub._id}`}
                            className="pdf-subfield-item"
                          >
                            <strong>{sub.name}</strong>
                            <span>
                              {sub.description ||
                                `Explore roles in ${sub.name}`}
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* ================= FOOTER (PDF PAGE 2 BOTTOM) ================= */}
      <footer className="footer">
        <div className="footer-container pdf-footer-grid">
          <div className="footer-brand">
            <Link to="/" className="brand">
              <div className="brand-icon">
                <span className="brand-letter">C</span>
              </div>
              <span className="brand-title-text">Career Horizon</span>
            </Link>
            <p>
              Explore careers, find the ones that fit your interests, and follow
              a roadmap to get there.
            </p>
          </div>

          <div className="footer-col">
            <strong>Explore</strong>
            <Link to="/careers">All careers</Link>
            <Link to="/fields">Career fields</Link>
            <Link to={isAuthenticated ? "/matches" : "/login"}>
              Compare careers
            </Link>
          </div>

          <div className="footer-col">
            <strong>Your account</strong>
            {!isAuthenticated ? (
              <>
                <Link to="/register">Create an account</Link>
                <Link to="/login">Log in</Link>
                <Link to="/login">Dashboard</Link>
              </>
            ) : (
              <>
                <Link to="/dashboard">Dashboard</Link>
                <Link to="/matches">My matches</Link>
                <Link to="/saved-careers">Saved careers</Link>
              </>
            )}
          </div>

          <div className="footer-col">
            <strong>About</strong>
            <Link to="/about">How matching works</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}