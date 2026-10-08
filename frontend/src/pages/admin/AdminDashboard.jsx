import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import Navbar from "../../components/Navbar";
import {
  Shield,
  Users,
  Briefcase,
  Layers,
  Compass,
  Plus,
  Trash2,
  Search,
  Sparkles,
  AlertTriangle,
  X,
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, user, token } = useAuth();

  const [activeTab, setActiveTab] = useState("overview"); // overview, careers, fields, roadmaps, users
  const [loading, setLoading] = useState(true);

  // Data states
  const [stats, setStats] = useState({ users: 0, careers: 0, fields: 0, roadmaps: 0 });
  const [careers, setCareers] = useState([]);
  const [fields, setFields] = useState([]);
  const [subfields, setSubfields] = useState([]);
  const [roadmaps, setRoadmaps] = useState([]);
  const [usersList, setUsersList] = useState([]);

  // Career search & modals
  const [careerSearch, setCareerSearch] = useState("");
  const [isAddCareerOpen, setIsAddCareerOpen] = useState(false);
  const [isAddFieldOpen, setIsAddFieldOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // New Career Form State
  const [newCareer, setNewCareer] = useState({
    name: "",
    fieldId: "",
    subfieldId: "",
    shortDescription: "",
    description: "",
    technicalSkills: "",
    professionalSkills: "",
    minimumQualification: "Bachelor's Degree",
    demandLevel: "High",
    entrySalary: "$50,000 - $70,000 / yr",
    experiencedSalary: "$120,000 - $160,000 / yr",
  });

  // New Field Form State
  const [newField, setNewField] = useState({
    name: "",
    description: "",
  });

  const authToken = token || localStorage.getItem("token");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (user && user.role !== "admin") {
      // Not admin
      return;
    }

    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const headers = { Authorization: `Bearer ${authToken}` };

        const [cRes, fRes, sRes, rRes, uRes] = await Promise.all([
          fetch(`${API_URL}/careers`),
          fetch(`${API_URL}/fields`),
          fetch(`${API_URL}/subfields`),
          fetch(`${API_URL}/roadmaps`),
          fetch(`${API_URL}/users`, { headers }),
        ]);

        const cData = await cRes.json();
        const fData = await fRes.json();
        const sData = await sRes.json();
        const rData = await rRes.json();
        const uData = uRes.ok ? await uRes.json() : [];

        const cList = Array.isArray(cData) ? cData : cData.careers || [];
        const fList = Array.isArray(fData) ? fData : fData.fields || [];
        const sList = Array.isArray(sData) ? sData : sData.subfields || [];
        const rList = Array.isArray(rData) ? rData : rData.roadmaps || [];
        const uList = Array.isArray(uData) ? uData : uData.users || [];

        setCareers(cList);
        setFields(fList);
        setSubfields(sList);
        setRoadmaps(rList);
        setUsersList(uList);

        setStats({
          careers: cList.length,
          fields: fList.length,
          roadmaps: rList.length,
          users: uList.length,
        });
      } catch (err) {
        console.error("Failed to load admin data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [isAuthenticated, user, authToken, navigate]);

  // Non-admin block view
  if (user && user.role !== "admin") {
    return (
      <div className="admin-page">
        <Navbar />
        <main className="page-container admin-container text-center py-5">
          <div className="admin-unauthorized-card">
            <AlertTriangle size={48} className="text-amber-500 mb-3" />
            <h2>Administrator Access Required</h2>
            <p>You do not have permission to access the Career Horizon administrator panel.</p>
            <Link to="/dashboard" className="primary-btn mt-3">
              Return to Dashboard
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Handle Add Career
  const handleCreateCareer = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: newCareer.name,
        fieldId: newCareer.fieldId,
        subfieldId: newCareer.subfieldId || undefined,
        shortDescription: newCareer.shortDescription,
        description: newCareer.description,
        technicalSkills: newCareer.technicalSkills.split(",").map((s) => s.trim()).filter(Boolean),
        professionalSkills: newCareer.professionalSkills.split(",").map((s) => s.trim()).filter(Boolean),
        education: {
          minimumQualification: newCareer.minimumQualification,
        },
        demand: {
          level: newCareer.demandLevel,
        },
        salary: {
          entryLevel: newCareer.entrySalary,
          experienced: newCareer.experiencedSalary,
        },
      };

      const res = await fetch(`${API_URL}/careers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const created = await res.json();
        setCareers((prev) => [created, ...prev]);
        setStats((prev) => ({ ...prev, careers: prev.careers + 1 }));
        setIsAddCareerOpen(false);
        setToastMessage("Career pathway created successfully!");
        setTimeout(() => setToastMessage(""), 3000);
      }
    } catch (err) {
      console.error("Failed to create career:", err);
    }
  };

  // Handle Delete Career
  const handleDeleteCareer = async (careerId) => {
    if (!window.confirm("Are you sure you want to delete this career?")) return;
    try {
      const res = await fetch(`${API_URL}/careers/${careerId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (res.ok) {
        setCareers((prev) => prev.filter((c) => (c._id || c.id) !== careerId));
        setStats((prev) => ({ ...prev, careers: prev.careers - 1 }));
        setToastMessage("Career deleted successfully.");
        setTimeout(() => setToastMessage(""), 2500);
      }
    } catch (err) {
      console.error("Failed to delete career:", err);
    }
  };

  // Handle Create Field
  const handleCreateField = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/fields`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(newField),
      });

      if (res.ok) {
        const created = await res.json();
        setFields((prev) => [...prev, created]);
        setStats((prev) => ({ ...prev, fields: prev.fields + 1 }));
        setIsAddFieldOpen(false);
        setToastMessage("Industry field created successfully!");
        setTimeout(() => setToastMessage(""), 3000);
      }
    } catch (err) {
      console.error("Failed to create field:", err);
    }
  };

  // Filter careers for management
  const filteredCareers = careers.filter((c) =>
    (c.name || "").toLowerCase().includes(careerSearch.toLowerCase()) ||
    (c.fieldId?.name || "").toLowerCase().includes(careerSearch.toLowerCase())
  );

  return (
    <div className="admin-page">
      <Navbar />

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="global-save-toast">
          <Sparkles size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="page-container admin-container">
        {/* Admin Header */}
        <section className="admin-header-bar">
          <div className="admin-title-box">
            <div className="admin-badge">
              <Shield size={14} />
              <span>ADMINISTRATOR CONTROL PANEL</span>
            </div>
            <h1>Platform Administration</h1>
            <p>
              Manage verified career pathways, industry disciplines, roadmap milestones, and student accounts.
            </p>
          </div>
        </section>

        {/* Tabs Bar */}
        <div className="admin-tabs-bar">
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === "careers" ? "active" : ""}`}
            onClick={() => setActiveTab("careers")}
          >
            Manage Careers ({careers.length})
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === "fields" ? "active" : ""}`}
            onClick={() => setActiveTab("fields")}
          >
            Fields & Subfields ({fields.length})
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === "roadmaps" ? "active" : ""}`}
            onClick={() => setActiveTab("roadmaps")}
          >
            Roadmaps ({roadmaps.length})
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            Users ({usersList.length})
          </button>
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="saved-loading-state">
            <div className="loading-spinner-dot"></div>
            <p>Loading platform telemetry and datasets...</p>
          </div>
        )}

        {/* ================= TAB 1: OVERVIEW ================= */}
        {!loading && activeTab === "overview" && (
          <section className="admin-overview-section">
            <div className="admin-stats-grid">
              <div className="admin-stat-card">
                <Briefcase size={24} className="stat-icon purple" />
                <div className="stat-details">
                  <span className="stat-number">{stats.careers}</span>
                  <span className="stat-label">Total Careers</span>
                </div>
              </div>

              <div className="admin-stat-card">
                <Layers size={24} className="stat-icon blue" />
                <div className="stat-details">
                  <span className="stat-number">{stats.fields}</span>
                  <span className="stat-label">Industry Fields</span>
                </div>
              </div>

              <div className="admin-stat-card">
                <Compass size={24} className="stat-icon green" />
                <div className="stat-details">
                  <span className="stat-number">{stats.roadmaps}</span>
                  <span className="stat-label">Milestone Roadmaps</span>
                </div>
              </div>

              <div className="admin-stat-card">
                <Users size={24} className="stat-icon orange" />
                <div className="stat-details">
                  <span className="stat-number">{stats.users}</span>
                  <span className="stat-label">Registered Users</span>
                </div>
              </div>
            </div>

            <div className="admin-quick-actions-card">
              <h3>Quick Actions</h3>
              <div className="quick-actions-row">
                <button
                  type="button"
                  className="primary-btn"
                  onClick={() => {
                    setActiveTab("careers");
                    setIsAddCareerOpen(true);
                  }}
                >
                  <Plus size={16} />
                  <span>Add New Career Pathway</span>
                </button>

                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => {
                    setActiveTab("fields");
                    setIsAddFieldOpen(true);
                  }}
                >
                  <Plus size={16} />
                  <span>Add Industry Field</span>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ================= TAB 2: MANAGE CAREERS ================= */}
        {activeTab === "careers" && (
          <section className="admin-table-section">
            <div className="table-actions-header">
              <div className="table-search-input-box">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search careers by name or field..."
                  value={careerSearch}
                  onChange={(e) => setCareerSearch(e.target.value)}
                />
              </div>

              <button
                type="button"
                className="primary-btn"
                onClick={() => setIsAddCareerOpen(true)}
              >
                <Plus size={16} />
                <span>Add Career</span>
              </button>
            </div>

            <div className="admin-table-wrapper">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Career Name</th>
                    <th>Field</th>
                    <th>Demand</th>
                    <th>Education</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCareers.map((c) => (
                    <tr key={c._id || c.id}>
                      <td>
                        <strong>{c.name}</strong>
                      </td>
                      <td>{c.fieldId?.name || c.fieldName || "—"}</td>
                      <td>
                        <span className="demand-pill-small">
                          {typeof c.demand === "object" ? c.demand?.level : c.demand || "High"}
                        </span>
                      </td>
                      <td>{c.education?.minimumQualification || "Bachelor's"}</td>
                      <td>
                        <div className="table-action-buttons">
                          <Link
                            to={`/careers/${c._id || c.id}`}
                            className="table-view-link"
                            target="_blank"
                          >
                            View
                          </Link>
                          <button
                            type="button"
                            className="table-delete-btn"
                            onClick={() => handleDeleteCareer(c._id || c.id)}
                            title="Delete Career"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ================= TAB 3: MANAGE FIELDS ================= */}
        {activeTab === "fields" && (
          <section className="admin-table-section">
            <div className="table-actions-header">
              <h3>Industry Disciplines & Specialisations</h3>
              <button
                type="button"
                className="primary-btn"
                onClick={() => setIsAddFieldOpen(true)}
              >
                <Plus size={16} />
                <span>Add Field</span>
              </button>
            </div>

            <div className="admin-fields-list-cards">
              {fields.map((f) => (
                <div key={f._id} className="admin-field-card">
                  <div className="field-card-title-row">
                    <h4>{f.name}</h4>
                    <span className="career-count-pill">
                      {subfields.filter((s) => (s.fieldId?._id || s.fieldId || s.field) === f._id).length} Subfields
                    </span>
                  </div>
                  <p>{f.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ================= TAB 4: MANAGE ROADMAPS ================= */}
        {activeTab === "roadmaps" && (
          <section className="admin-table-section">
            <h3>Registered Career Roadmaps</h3>
            <div className="admin-table-wrapper mt-3">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Roadmap Title</th>
                    <th>Linked Career</th>
                    <th>Total Milestones</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {roadmaps.map((r) => (
                    <tr key={r._id}>
                      <td><strong>{r.title || "Career Roadmap"}</strong></td>
                      <td>{r.career?.name || r.careerId?.name || "Career"}</td>
                      <td>{r.steps?.length || 0} Steps</td>
                      <td>
                        <Link
                          to={`/roadmaps/${r.career?._id || r.careerId?._id || r.careerId}`}
                          className="table-view-link"
                          target="_blank"
                        >
                          View Roadmap
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ================= TAB 5: MANAGE USERS ================= */}
        {activeTab === "users" && (
          <section className="admin-table-section">
            <h3>Registered Students & Users</h3>
            <div className="admin-table-wrapper mt-3">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Assessment Done</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((u) => (
                    <tr key={u._id}>
                      <td><strong>{u.name}</strong></td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`role-badge ${u.role === "admin" ? "admin" : ""}`}>
                          {u.role || "user"}
                        </span>
                      </td>
                      <td>
                        {u.assessmentCompleted ? (
                          <span className="text-emerald-600 font-semibold">Completed</span>
                        ) : (
                          <span className="text-gray-400">Pending</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Modal: Add Career */}
        {isAddCareerOpen && (
          <div className="modal-backdrop">
            <div className="admin-modal-card">
              <div className="modal-header">
                <h2>Add New Career Pathway</h2>
                <button
                  type="button"
                  className="close-modal-btn"
                  onClick={() => setIsAddCareerOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateCareer} className="admin-modal-form">
                <div className="form-group">
                  <label>Career Title</label>
                  <input
                    type="text"
                    required
                    value={newCareer.name}
                    onChange={(e) => setNewCareer({ ...newCareer, name: e.target.value })}
                    placeholder="e.g. Cloud Solutions Architect"
                  />
                </div>

                <div className="form-group-row">
                  <div className="form-group">
                    <label>Industry Field</label>
                    <select
                      required
                      value={newCareer.fieldId}
                      onChange={(e) => setNewCareer({ ...newCareer, fieldId: e.target.value })}
                    >
                      <option value="">Select Field</option>
                      {fields.map((f) => (
                        <option key={f._id} value={f._id}>{f.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Demand Level</label>
                    <select
                      value={newCareer.demandLevel}
                      onChange={(e) => setNewCareer({ ...newCareer, demandLevel: e.target.value })}
                    >
                      <option value="High">High Demand</option>
                      <option value="Moderate">Moderate Demand</option>
                      <option value="Growing">Growing Demand</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Short Description (1-2 sentences)</label>
                  <input
                    type="text"
                    required
                    value={newCareer.shortDescription}
                    onChange={(e) => setNewCareer({ ...newCareer, shortDescription: e.target.value })}
                    placeholder="Brief summary for catalog cards"
                  />
                </div>

                <div className="form-group">
                  <label>Technical Skills (comma-separated)</label>
                  <input
                    type="text"
                    value={newCareer.technicalSkills}
                    onChange={(e) => setNewCareer({ ...newCareer, technicalSkills: e.target.value })}
                    placeholder="AWS, Docker, Kubernetes, Linux, Terraform"
                  />
                </div>

                <div className="form-group">
                  <label>Professional Skills (comma-separated)</label>
                  <input
                    type="text"
                    value={newCareer.professionalSkills}
                    onChange={(e) => setNewCareer({ ...newCareer, professionalSkills: e.target.value })}
                    placeholder="System Architecture, Problem Solving, Communication"
                  />
                </div>

                <div className="modal-footer-actions">
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => setIsAddCareerOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="primary-btn">
                    Create Career Pathway
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Add Field */}
        {isAddFieldOpen && (
          <div className="modal-backdrop">
            <div className="admin-modal-card small">
              <div className="modal-header">
                <h2>Add Industry Field</h2>
                <button
                  type="button"
                  className="close-modal-btn"
                  onClick={() => setIsAddFieldOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateField} className="admin-modal-form">
                <div className="form-group">
                  <label>Field Name</label>
                  <input
                    type="text"
                    required
                    value={newField.name}
                    onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                    placeholder="e.g. Biotechnology"
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    rows={3}
                    value={newField.description}
                    onChange={(e) => setNewField({ ...newField, description: e.target.value })}
                    placeholder="Overview of this industry discipline"
                  ></textarea>
                </div>

                <div className="modal-footer-actions">
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => setIsAddFieldOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="primary-btn">
                    Create Field
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-brand">
            <Link to="/" className="brand">
              <div className="brand-icon">
                <Sparkles size={18} />
              </div>
              <span>Career Horizon</span>
            </Link>
            <p>Platform Administration Panel</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
