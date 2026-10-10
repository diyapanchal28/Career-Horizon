import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import Navbar from "../components/Navbar";
import {
  Heart,
  ArrowLeft,
  ArrowRight,
  Check,
  AlertCircle,
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

function formatLakh(amount) {
  if (!amount || isNaN(amount)) return "";
  const lakhs = amount / 100000;
  return `₹${ Number.isInteger(lakhs) ? lakhs : lakhs.toFixed(1).replace(/\.0$/, "") }L`;
}

export default function CareerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, token, isCareerSaved, toggleSaveCareer } = useAuth();

  const [career, setCareer] = useState(null);
  const [matchData, setMatchData] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const saved = isCareerSaved(id);

  // Enforce login/signup for detailed career view
  useEffect(() => {
    if (!isAuthenticated) {
      sessionStorage.setItem("returnAfterLogin", `/careers/${id}`);
      navigate("/login");
    }
  }, [isAuthenticated, id, navigate]);

  /* Fetch career data, match breakdown, roadmap preview, and log view activity */
  useEffect(() => {
    if (!isAuthenticated || !id) return;

    const fetchCareerDetails = async () => {
      try {
        setLoading(true);
        setError("");
        const authToken = token || localStorage.getItem("token");

        const [careerRes, roadmapRes] = await Promise.all([
          fetch(`${API_URL}/careers/${id}`),
          fetch(`${API_URL}/roadmaps/career/${id}`),
        ]);

        if (!careerRes.ok) {
          throw new Error(`Failed to load career (Status ${careerRes.status})`);
        }

        const data = await careerRes.json();
        const cData = data.career || data.data || data;
        setCareer(cData);

        if (roadmapRes.ok) {
          const rData = await roadmapRes.json();
          setRoadmap(rData);
        }

        if (authToken) {
          // Fetch personalized match score
          fetch(`${API_URL}/recommendations/career/${id}`, {
            headers: { Authorization: `Bearer ${authToken}` },
          })
            .then((r) => (r.ok ? r.json() : null))
            .then((mData) => {
              if (mData) setMatchData(mData);
            })
            .catch(() => {});

          // Log "career_viewed" activity so Dashboard "CAREERS EXPLORED" & "Recent activity" update
          if (cData?.name) {
            fetch(`${API_URL}/activities`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
              },
              body: JSON.stringify({
                type: "career_viewed",
                career: cData._id || id,
                description: `Viewed ${cData.name}`,
              }),
            }).catch(() => {});
          }
        }
      } catch (err) {
        console.error("Failed to load career:", err);
        setError(
          "Unable to load this career. It may have been removed or the server is unavailable."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCareerDetails();
  }, [id, isAuthenticated, token]);

  const handleSaveToggle = async () => {
    try {
      setSaveLoading(true);
      const res = await toggleSaveCareer(id);
      if (res.success) {
        setToastMessage(
          res.saved
            ? `${career?.name || "Career"} saved to your shortlist.`
            : "Removed from saved careers."
        );
      }
    } catch {
      setToastMessage("Action could not be completed.");
    } finally {
      setSaveLoading(false);
      setTimeout(() => setToastMessage(""), 3000);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="career-details-page">
        <Navbar />
        <main className="career-details-container loading-centered">
          <div className="detail-loading-box">
            <div className="loading-spinner-dot"></div>
            <p>Loading career details and roadmap...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !career) {
    return (
      <div className="career-details-page">
        <Navbar />
        <main className="career-details-container">
          <div className="career-error-card">
            <AlertCircle size={44} className="career-error-icon" />
            <h2>Career Not Found</h2>
            <p>
              {error ||
                "The career information you requested could not be retrieved."}
            </p>
            <Link to="/careers" className="pdf-explore-btn large">
              <ArrowLeft size={16} />
              <span>Back to all careers</span>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const demandLevel =
    typeof career.demand === "object"
      ? career.demand?.level
      : career.demand || "High";
  const demandNote =
    typeof career.demand === "object" ? career.demand?.note : "";
  const description = career.description || career.shortDescription || "";
  const shortDescription = career.shortDescription || "";
  const fieldName = career.fieldId?.name || career.fieldName || "Business";
  const subfieldName = career.subfieldId?.name || career.subfieldName || "";

  const techSkills = Array.isArray(career.technicalSkills)
    ? career.technicalSkills
    : Array.isArray(career.skills)
    ? career.skills
    : [];

  const profSkills = Array.isArray(career.professionalSkills)
    ? career.professionalSkills
    : [];

  const responsibilities = Array.isArray(career.responsibilities)
    ? career.responsibilities
    : Array.isArray(career.whatYouDo)
    ? career.whatYouDo
    : [];

  const growthSteps = Array.isArray(career.careerGrowth)
    ? career.careerGrowth
    : [];

  const salaryBands =
    Array.isArray(career.salary?.bands) && career.salary.bands.length > 0
      ? career.salary.bands
      : [
          { label: "Entry Level", min: 400000, max: 750000, period: "per year" },
          { label: "Mid Level", min: 850000, max: 1700000, period: "per year" },
          {
            label: "Experienced",
            min: 1800000,
            max: 3200000,
            period: "per year",
          },
        ];

  const salaryNote =
    career.salary?.note ||
    "Example ranges for demonstration. Actual pay varies by city, company, and skills.";

  const matchPct = matchData?.matchPercentage || 70;
  const matchReasons = matchData?.matchReasons || matchData?.reasons || [];

  const sourceLabel =
    Array.isArray(career.sources) && career.sources[0]?.label
      ? career.sources[0].label
      : "Career Horizon demo dataset (illustrative example data)";

  return (
    <div className="career-details-page">
      <Navbar />

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

      <main>
        {/* Top White Hero Header (Matches PDF Page 6 bottom) */}
        <section className="pdf-detail-top-hero">
          <div className="career-details-container">
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

            <div className="pdf-detail-breadcrumb">
              <Link to="/careers">Explore careers</Link>
              <span>/</span>
              <span>{fieldName}</span>
            </div>

            <div className="pdf-detail-title-row">
              <div>
                <h1>{career.name}</h1>
                <div className="pdf-detail-sub-meta">
                  <span>{fieldName}</span>
                  {subfieldName && (
                    <>
                      <span>·</span>
                      <span>{subfieldName}</span>
                    </>
                  )}
                </div>
              </div>

              <span className="pdf-match-pill high large">
                {matchPct}% match
              </span>
            </div>

            {shortDescription && (
              <p className="pdf-detail-lead">{shortDescription}</p>
            )}

            <div className="pdf-detail-hero-actions">
              <button
                type="button"
                className={`pdf-explore-btn large ${saved ? "saved" : ""}`}
                onClick={handleSaveToggle}
                disabled={saveLoading}
              >
                <Heart size={15} fill={saved ? "currentColor" : "none"} />
                <span>{saved ? "Saved career" : "Save career"}</span>
              </button>

              <Link to={`/roadmaps/${id}`} className="pdf-outline-btn large">
                Start roadmap
              </Link>
            </div>
          </div>
        </section>

        {/* Main 2-Column Body (Matches PDF Page 6 bottom & Page 7 top) */}
        <section className="pdf-detail-body-section">
          <div className="career-details-container pdf-detail-grid">
            {/* Left Main Column */}
            <div className="pdf-detail-main-col">
              {/* Why this career matches you */}
              <div className="pdf-why-match-card">
                <h3>Why this career matches you</h3>
                {matchReasons.length > 0 ? (
                  <ul className="pdf-why-match-list">
                    {matchReasons.map((r, idx) => (
                      <li key={idx}>
                        <Check size={15} className="pdf-reason-check" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <ul className="pdf-why-match-list">
                    <li>
                      <Check size={15} className="pdf-reason-check" />
                      <span>
                        Aligns with core competencies in {fieldName}.
                      </span>
                    </li>
                  </ul>
                )}
                <p className="pdf-why-match-disclaimer">
                  A match percentage compares this career with the interests you
                  selected. It is a research starting point, not a guarantee of
                  suitability.
                </p>
              </div>

              {/* Overview */}
              <div className="pdf-detail-section">
                <h2>Overview</h2>
                <p className="pdf-detail-prose">{description}</p>

                {responsibilities.length > 0 && (
                  <div className="pdf-detail-subblock">
                    <h3>What does a professional do?</h3>
                    <ul className="pdf-bullet-list">
                      {responsibilities.map((item, idx) => {
                        const text =
                          typeof item === "object"
                            ? item.text || item.description || ""
                            : item;
                        return <li key={idx}>{text}</li>;
                      })}
                    </ul>
                  </div>
                )}

                {career.suitableFor && (
                  <div className="pdf-detail-subblock">
                    <h3>Who this suits</h3>
                    <p className="pdf-detail-prose">{career.suitableFor}</p>
                  </div>
                )}
              </div>

              {/* Skills (2 side-by-side cards matching PDF Page 7 top) */}
              <div className="pdf-detail-section">
                <h2>Skills</h2>
                <div className="pdf-skills-two-col">
                  <div className="pdf-skill-box-card">
                    <h3>Technical skills</h3>
                    <div className="pdf-card-skills">
                      {techSkills.map((skill, idx) => (
                        <span key={idx} className="pdf-skill-pill">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pdf-skill-box-card">
                    <h3>Professional skills</h3>
                    <div className="pdf-card-skills">
                      {profSkills.map((skill, idx) => (
                        <span key={idx} className="pdf-skill-pill">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Career growth (Matches PDF Page 7 top) */}
              {growthSteps.length > 0 && (
                <div className="pdf-detail-section">
                  <h2>Career growth</h2>
                  <div className="pdf-growth-stack">
                    {growthSteps.map((stage, idx) => (
                      <div key={idx} className="pdf-growth-item-card">
                        <span className="pdf-growth-num">
                          {stage.order || idx + 1}
                        </span>
                        <div>
                          <strong>{stage.title}</strong>
                          <span>{stage.experience}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Roadmap Preview (Matches PDF Page 7 top) */}
              <div className="pdf-detail-section">
                <h2>Roadmap</h2>
                <div className="pdf-roadmap-preview-card">
                  <h3>
                    {roadmap?.title || `${career.name} Roadmap`}
                  </h3>
                  <p>
                    {roadmap?.summary ||
                      `Step-by-step milestones to build the skills required for ${career.name}.`}
                  </p>

                  {Array.isArray(roadmap?.steps) && roadmap.steps.length > 0 && (
                    <ol className="pdf-roadmap-preview-list">
                      {roadmap.steps.slice(0, 4).map((step, idx) => (
                        <li key={step._id || idx}>
                          <span className="preview-step-idx">
                            {step.stepNumber || idx + 1}.
                          </span>{" "}
                          <span>{step.title}</span>
                        </li>
                      ))}
                    </ol>
                  )}

                  <div className="mt-4">
                    <Link
                      to={`/roadmaps/${id}`}
                      className="pdf-explore-btn large"
                    >
                      <span>Start roadmap</span>
                      <ArrowRight size={15} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar Column (Salary range, Demand, Source & Last Updated) */}
            <aside className="pdf-detail-sidebar">
              {/* Salary range card */}
              <div className="pdf-side-card">
                <h3>Salary range</h3>
                <div className="pdf-salary-bands">
                  {salaryBands.map((band, idx) => (
                    <div key={idx} className="pdf-salary-band-item">
                      <span className="pdf-band-label">
                        {(band.label || "Level").toUpperCase()}
                      </span>
                      <strong className="pdf-band-value">
                        {formatLakh(band.min)} – {formatLakh(band.max)}{" "}
                        {band.period || "per year"}
                      </strong>
                    </div>
                  ))}
                </div>
                <p className="pdf-side-footnote">{salaryNote}</p>
              </div>

              {/* Demand card */}
              <div className="pdf-side-card">
                <h3>Demand</h3>
                <span
                  className={`pdf-demand-badge ${demandLevel.toLowerCase()}`}
                >
                  {demandLevel}
                </span>
                {demandNote && (
                  <p className="pdf-side-prose mt-2">{demandNote}</p>
                )}
              </div>

              {/* Source & Last Updated card */}
              <div className="pdf-side-card">
                <span className="pdf-side-eyebrow">
                  SOURCE &amp; LAST UPDATED
                </span>
                <p className="pdf-side-prose strong">{sourceLabel}</p>
                <p className="pdf-side-footnote">
                  Last updated: September 2026
                </p>
                <p className="pdf-side-footnote mt-2">
                  Salary and demand information changes over time and varies by
                  city, company and experience. Treat these figures as
                  indicative and verify them before making a decision.
                </p>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
}