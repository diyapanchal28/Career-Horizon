import { useEffect, useState, useMemo } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import Navbar from "../components/Navbar";
import {
  Search,
  Sparkles,
  Heart,
  X,
  SlidersHorizontal,
  Compass,
  Lock,
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

export default function Careers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, isCareerSaved, toggleSaveCareer } = useAuth();

  const [careers, setCareers] = useState([]);
  const [fields, setFields] = useState([]);
  const [subfields, setSubfields] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state initialized from searchParams
  const [search, setSearch] = useState(() => searchParams.get("search") || "");
  const [selectedField, setSelectedField] = useState(
    () => searchParams.get("fieldId") || "all"
  );
  const [selectedSubfield, setSelectedSubfield] = useState(
    () => searchParams.get("subfieldId") || "all"
  );
  const [selectedDemand, setSelectedDemand] = useState(
    () => searchParams.get("demand") || "all"
  );
  const [selectedEducation, setSelectedEducation] = useState(
    () => searchParams.get("education") || "all"
  );
  const [sortBy, setSortBy] = useState("relevant");

  // Mobile filters drawer
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [savingCareerId, setSavingCareerId] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  // Fetch initial data
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        const [careerRes, fieldRes, subfieldRes] = await Promise.all([
          fetch(`${API_URL}/careers`),
          fetch(`${API_URL}/fields`),
          fetch(`${API_URL}/subfields`),
        ]);

        const cData = careerRes.ok ? await careerRes.json() : [];
        const fData = fieldRes.ok ? await fieldRes.json() : [];
        const sData = subfieldRes.ok ? await subfieldRes.json() : [];

        setCareers(Array.isArray(cData) ? cData : cData.careers || []);
        setFields(Array.isArray(fData) ? fData : fData.fields || []);
        setSubfields(Array.isArray(sData) ? sData : sData.subfields || []);
      } catch (err) {
        console.error("Failed to load catalog data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, []);

  // Filter subfields cascading by selected field
  const availableSubfields = useMemo(() => {
    if (selectedField === "all") return subfields;
    return subfields.filter(
      (s) =>
        s.fieldId === selectedField ||
        s.fieldId?._id === selectedField ||
        s.field === selectedField ||
        s.field?._id === selectedField
    );
  }, [subfields, selectedField]);

  // Require login/signup to view full career details & roadmap
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

  // Handle save toggle
  const handleSaveToggle = async (e, careerId) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      sessionStorage.setItem("returnAfterLogin", `/careers/${careerId}`);
      sessionStorage.setItem(
        "authGateMessage",
        "Please sign in or create an account to save careers to your personal collection."
      );
      navigate("/login");
      return;
    }

    try {
      setSavingCareerId(careerId);
      const res = await toggleSaveCareer(careerId);
      if (res.success) {
        setToastMessage(
          res.saved ? "Saved to your collection." : "Removed from saved careers."
        );
        setTimeout(() => setToastMessage(""), 2500);
      }
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setSavingCareerId("");
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearch("");
    setSelectedField("all");
    setSelectedSubfield("all");
    setSelectedDemand("all");
    setSelectedEducation("all");
    setSortBy("relevant");
    setSearchParams({});
  };

  // Filtered and sorted careers
  const filteredCareers = useMemo(() => {
    const result = careers.filter((c) => {
      if (search.trim()) {
        const query = search.toLowerCase();
        const nameMatch = (c.name || "").toLowerCase().includes(query);
        const descMatch = (c.shortDescription || c.description || "")
          .toLowerCase()
          .includes(query);
        const fieldMatch = (c.fieldId?.name || c.fieldName || "")
          .toLowerCase()
          .includes(query);
        const subMatch = (c.subfieldId?.name || c.subfieldName || "")
          .toLowerCase()
          .includes(query);
        const skillsMatch =
          Array.isArray(c.technicalSkills) &&
          c.technicalSkills.some((s) => s.toLowerCase().includes(query));

        if (!nameMatch && !descMatch && !fieldMatch && !subMatch && !skillsMatch) {
          return false;
        }
      }

      if (selectedField !== "all") {
        const cFieldId = c.fieldId?._id || c.fieldId;
        if (
          cFieldId !== selectedField &&
          c.fieldName?.toLowerCase() !== selectedField.toLowerCase()
        ) {
          return false;
        }
      }

      if (selectedSubfield !== "all") {
        const cSubId = c.subfieldId?._id || c.subfieldId;
        if (
          cSubId !== selectedSubfield &&
          c.subfieldName?.toLowerCase() !== selectedSubfield.toLowerCase()
        ) {
          return false;
        }
      }

      if (selectedDemand !== "all") {
        const demandLevel =
          typeof c.demand === "object" ? c.demand?.level : c.demand;
        if (
          !demandLevel ||
          !demandLevel.toLowerCase().includes(selectedDemand.toLowerCase())
        ) {
          return false;
        }
      }

      if (selectedEducation !== "all") {
        const edu =
          c.education?.minimumQualification || c.educationRequirement || "";
        if (!edu.toLowerCase().includes(selectedEducation.toLowerCase())) {
          return false;
        }
      }

      return true;
    });

    result.sort((a, b) => {
      if (sortBy === "name" || sortBy === "relevant") {
        return (a.name || "").localeCompare(b.name || "");
      }
      if (sortBy === "popular") {
        return (b.viewCount || 0) - (a.viewCount || 0);
      }
      if (sortBy === "newest") {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
      return 0;
    });

    return result;
  }, [
    careers,
    search,
    selectedField,
    selectedSubfield,
    selectedDemand,
    selectedEducation,
    sortBy,
  ]);

  const activeFiltersCount = [
    selectedField !== "all",
    selectedSubfield !== "all",
    selectedDemand !== "all",
    selectedEducation !== "all",
    search.trim() !== "",
  ].filter(Boolean).length;

  return (
    <div className="careers-catalog-page">
      <Navbar />

      {toastMessage && (
        <div className="global-save-toast">
          <Sparkles size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="page-container catalog-container">
        {/* Catalog Header (Matches PDF Page 1 Middle) */}
        <div className="pdf-page-intro">
          <h1>Explore careers</h1>
          <p>
            Search by career name, skill or field. Everything here is public — no
            account needed.
          </p>
        </div>

        {/* Full-Width Search Bar */}
        <form
          className="pdf-catalog-search-row"
          onSubmit={(e) => e.preventDefault()}
        >
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

          <button
            type="button"
            className="mobile-filter-btn"
            onClick={() => setShowMobileFilters(true)}
          >
            <SlidersHorizontal size={16} />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="filter-count-badge">{activeFiltersCount}</span>
            )}
          </button>
        </form>

        {/* Layout: Left Sidebar Filters + Right Grid */}
        <div className="pdf-catalog-layout">
          {/* Left Filter Sidebar */}
          <aside className={`pdf-catalog-sidebar ${showMobileFilters ? "open" : ""}`}>
            {showMobileFilters && (
              <div className="sidebar-mobile-top">
                <strong>Filters</strong>
                <button
                  type="button"
                  onClick={() => setShowMobileFilters(false)}
                >
                  <X size={20} />
                </button>
              </div>
            )}

            {/* Field */}
            <div className="pdf-filter-group">
              <label className="pdf-filter-label">Field</label>
              <select
                value={selectedField}
                onChange={(e) => {
                  setSelectedField(e.target.value);
                  setSelectedSubfield("all");
                }}
                className="pdf-filter-select"
              >
                <option value="all">All fields</option>
                {fields.map((f) => (
                  <option key={f._id} value={f._id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Specialisation */}
            <div className="pdf-filter-group">
              <label className="pdf-filter-label">Specialisation</label>
              <select
                value={selectedSubfield}
                onChange={(e) => setSelectedSubfield(e.target.value)}
                className="pdf-filter-select"
              >
                <option value="all">
                  {selectedField === "all"
                    ? "Pick a field first"
                    : "All specialisations"}
                </option>
                {availableSubfields.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Minimum education */}
            <div className="pdf-filter-group">
              <label className="pdf-filter-label">Minimum education</label>
              <select
                value={selectedEducation}
                onChange={(e) => setSelectedEducation(e.target.value)}
                className="pdf-filter-select"
              >
                <option value="all">Any level</option>
                <option value="Undergraduate">Undergraduate</option>
                <option value="Postgraduate">Postgraduate</option>
                <option value="Diploma">Diploma</option>
                <option value="12th">12th / High School</option>
              </select>
            </div>

            {/* Demand */}
            <div className="pdf-filter-group">
              <label className="pdf-filter-label">Demand</label>
              <select
                value={selectedDemand}
                onChange={(e) => setSelectedDemand(e.target.value)}
                className="pdf-filter-select"
              >
                <option value="all">Any</option>
                <option value="High">High</option>
                <option value="Moderate">Moderate</option>
                <option value="Growing">Growing</option>
              </select>
            </div>

            {activeFiltersCount > 0 && (
              <button
                type="button"
                className="pdf-reset-filters-link"
                onClick={handleResetFilters}
              >
                Reset filters
              </button>
            )}
          </aside>

          {/* Right Career Cards Content Area */}
          <section className="pdf-catalog-main">
            <div className="pdf-results-topbar">
              <span className="pdf-results-count">
                {filteredCareers.length}{" "}
                {filteredCareers.length === 1 ? "career" : "careers"} found
              </span>

              <div className="pdf-sort-box">
                <label htmlFor="sort-select">Sort</label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="relevant">Most relevant</option>
                  <option value="name">Alphabetical (A–Z)</option>
                  <option value="popular">Most popular</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="saved-loading-state">
                <div className="loading-spinner-dot"></div>
                <p>Loading career pathways...</p>
              </div>
            ) : filteredCareers.length === 0 ? (
              <div className="catalog-empty-card">
                <Compass size={40} className="empty-icon" />
                <h3>No careers found</h3>
                <p>
                  No careers match your current search and filter combination.
                </p>
                <button
                  type="button"
                  className="primary-btn"
                  onClick={handleResetFilters}
                >
                  Reset all filters
                </button>
              </div>
            ) : (
              <div className="pdf-career-cards-grid">
                {filteredCareers.map((career) => {
                  const careerId = career._id || career.id;
                  const fieldName =
                    career.fieldId?.name || career.fieldName || "Career";
                  const subfieldName =
                    career.subfieldId?.name || career.subfieldName || "";
                  const isSaved = isCareerSaved(careerId);
                  const isSaving = savingCareerId === careerId;
                  const skillsList = Array.isArray(career.technicalSkills)
                    ? career.technicalSkills
                    : [];

                  return (
                    <article className="pdf-career-card" key={careerId}>
                      <div className="pdf-card-body">
                        <span className="pdf-card-field-upper">
                          {fieldName.toUpperCase()}
                        </span>

                        <h3 className="pdf-card-title">{career.name}</h3>

                        {subfieldName && (
                          <span className="pdf-card-subfield">
                            {subfieldName}
                          </span>
                        )}

                        <p className="pdf-card-desc">
                          {career.shortDescription ||
                            career.description?.substring(0, 140) + "..." ||
                            "Explore core responsibilities, salary trends, and learning milestones."}
                        </p>

                        {skillsList.length > 0 && (
                          <div className="pdf-card-skills">
                            {skillsList.slice(0, 4).map((skill, idx) => (
                              <span key={idx} className="pdf-skill-pill">
                                {skill}
                              </span>
                            ))}
                            {skillsList.length > 4 && (
                              <span className="pdf-skill-more">
                                +{skillsList.length - 4}
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
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Footer */}
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
