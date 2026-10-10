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
  Edit3,
  Search,
  Sparkles,
  AlertTriangle,
  X,
  CheckCircle2,
  UserCheck,
  UserX,
  ExternalLink,
  FolderGit2,
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

const EMPTY_CAREER_FORM = {
  name: "",
  fieldId: "",
  subfieldId: "",
  shortDescription: "",
  description: "",
  technicalSkills: "",
  professionalSkills: "",
  responsibilities: "",
  minimumQualification: "Bachelor's Degree",
  demandLevel: "High",
  salaryNote: "₹6 LPA – ₹18 LPA depending on experience",
};

const EMPTY_FIELD_FORM = {
  name: "",
  description: "",
};

const EMPTY_SUBFIELD_FORM = {
  name: "",
  description: "",
  field: "",
};

const EMPTY_ROADMAP_STEP = {
  stepNumber: 1,
  order: 1,
  title: "",
  description: "",
  whyItMatters: "",
  topicsText: "",
  practice: "",
  estimatedWeeks: 4,
};

const EMPTY_ROADMAP_FORM = {
  careerId: "",
  title: "",
  summary: "",
  steps: [{ ...EMPTY_ROADMAP_STEP }],
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, user, token, login } = useAuth();

  const [activeTab, setActiveTab] = useState("overview"); // overview, careers, fields, roadmaps, users
  const [loading, setLoading] = useState(true);
  const [promotingAdmin, setPromotingAdmin] = useState(false);

  // Datasets
  const [careers, setCareers] = useState([]);
  const [fields, setFields] = useState([]);
  const [subfields, setSubfields] = useState([]);
  const [roadmaps, setRoadmaps] = useState([]);
  const [usersList, setUsersList] = useState([]);

  // Search & Filter states
  const [careerSearch, setCareerSearch] = useState("");
  const [careerFieldFilter, setCareerFieldFilter] = useState("all");
  const [roadmapSearch, setRoadmapSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");

  // Toast feedback
  const [toastMessage, setToastMessage] = useState("");
  const [errorBanner, setErrorBanner] = useState("");

  // Career Modal State (Add & Edit)
  const [isCareerModalOpen, setIsCareerModalOpen] = useState(false);
  const [editingCareerId, setEditingCareerId] = useState(null);
  const [careerForm, setCareerForm] = useState(EMPTY_CAREER_FORM);

  // Field Modal State (Add & Edit)
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState(null);
  const [fieldForm, setFieldForm] = useState(EMPTY_FIELD_FORM);

  // Subfield Modal State (Add & Edit)
  const [isSubfieldModalOpen, setIsSubfieldModalOpen] = useState(false);
  const [editingSubfieldId, setEditingSubfieldId] = useState(null);
  const [subfieldForm, setSubfieldForm] = useState(EMPTY_SUBFIELD_FORM);

  // Roadmap Modal State (Add & Edit)
  const [isRoadmapModalOpen, setIsRoadmapModalOpen] = useState(false);
  const [editingRoadmapId, setEditingRoadmapId] = useState(null);
  const [roadmapForm, setRoadmapForm] = useState(EMPTY_ROADMAP_FORM);

  const authToken = token || localStorage.getItem("token");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3200);
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login?role=admin");
      return;
    }

    if (user && user.role !== "admin") {
      return;
    }

    let ignore = false;
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        setErrorBanner("");
        const headers = { Authorization: `Bearer ${authToken}` };

        const [cRes, fRes, sRes, rRes, uRes] = await Promise.all([
          fetch(`${API_URL}/careers`),
          fetch(`${API_URL}/fields`),
          fetch(`${API_URL}/subfields`),
          fetch(`${API_URL}/roadmaps`),
          fetch(`${API_URL}/users`, { headers }),
        ]);

        if (ignore) return;

        const cData = cRes.ok ? await cRes.json() : [];
        const fData = fRes.ok ? await fRes.json() : [];
        const sData = sRes.ok ? await sRes.json() : [];
        const rData = rRes.ok ? await rRes.json() : [];
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
      } catch (err) {
        console.error("Failed to load admin data:", err);
        if (!ignore) {
          setErrorBanner("Unable to load some platform datasets. Check backend server connection.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchAdminData();
    return () => {
      ignore = true;
    };
  }, [isAuthenticated, user, authToken, navigate]);

  // Promote current account to Admin for demo/project convenience
  const handleEnableAdminAccess = async () => {
    try {
      setPromotingAdmin(true);
      const res = await fetch(`${API_URL}/users/make-admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.token && data.user) {
        login(data.token, data.user);
        showToast("Administrator access enabled for your account!");
      } else {
        setErrorBanner(data.message || "Could not enable admin access. Please sign in with the admin account.");
      }
    } catch (err) {
      console.error("Enable admin error:", err);
      setErrorBanner("Failed to connect to server.");
    } finally {
      setPromotingAdmin(false);
    }
  };

  // Non-admin gate view with 1-click Admin activation or Admin Login
  if (user && user.role !== "admin") {
    return (
      <div className="admin-page">
        <Navbar />
        <main className="page-container admin-container">
          <div className="admin-unauthorized-card">
            <div className="admin-unauth-icon-wrap">
              <Shield size={36} />
            </div>
            <h2>Administrator Control Panel</h2>
            <p>
              Your current account (<strong>{user.email}</strong>) is signed in as a{" "}
              <span className="role-badge">{user.role || "student"}</span>. You can enable administrator
              privileges for this account or sign in with the dedicated administrator account.
            </p>
            {errorBanner && <div className="admin-inline-error">{errorBanner}</div>}
            <div className="admin-unauth-actions">
              <button
                type="button"
                className="primary-btn"
                onClick={handleEnableAdminAccess}
                disabled={promotingAdmin}
              >
                <Shield size={16} />
                <span>
                  {promotingAdmin ? "Enabling Admin Access..." : "Enable Admin Access for My Account"}
                </span>
              </button>
              <Link to="/login?role=admin" className="secondary-btn">
                <span>Sign in with Admin Account</span>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* ========================================================================
     1. CAREER CRUD HANDLERS
     ======================================================================== */
  const openAddCareerModal = () => {
    setEditingCareerId(null);
    const defaultFieldId = fields[0]?._id || "";
    const matchingSubfields = subfields.filter(
      (s) => String(s.field?._id || s.field) === String(defaultFieldId)
    );
    setCareerForm({
      ...EMPTY_CAREER_FORM,
      fieldId: defaultFieldId,
      subfieldId: matchingSubfields[0]?._id || "",
    });
    setIsCareerModalOpen(true);
  };

  const openEditCareerModal = (career) => {
    setEditingCareerId(career._id || career.id);
    const fieldId = career.fieldId?._id || career.fieldId || "";
    const subfieldId = career.subfieldId?._id || career.subfieldId || "";
    setCareerForm({
      name: career.name || "",
      fieldId,
      subfieldId,
      shortDescription: career.shortDescription || "",
      description: career.description || career.overview || "",
      technicalSkills: Array.isArray(career.technicalSkills)
        ? career.technicalSkills.join(", ")
        : "",
      professionalSkills: Array.isArray(career.professionalSkills)
        ? career.professionalSkills.join(", ")
        : "",
      responsibilities: Array.isArray(career.responsibilities)
        ? career.responsibilities.join(", ")
        : "",
      minimumQualification:
        career.education?.minimumQualification || "Bachelor's Degree",
      demandLevel:
        (typeof career.demand === "object"
          ? career.demand?.level
          : career.demand) || "High",
      salaryNote:
        career.salary?.note || "₹6 LPA – ₹18 LPA depending on experience",
    });
    setIsCareerModalOpen(true);
  };

  const handleSaveCareer = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: careerForm.name.trim(),
        fieldId: careerForm.fieldId,
        subfieldId: careerForm.subfieldId || undefined,
        shortDescription: careerForm.shortDescription.trim(),
        description: careerForm.description.trim(),
        overview: careerForm.description.trim(),
        technicalSkills: careerForm.technicalSkills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        professionalSkills: careerForm.professionalSkills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        responsibilities: careerForm.responsibilities
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        education: {
          minimumQualification: careerForm.minimumQualification.trim(),
        },
        demand: {
          level: careerForm.demandLevel,
        },
        salary: {
          note: careerForm.salaryNote.trim(),
        },
      };

      const url = editingCareerId
        ? `${API_URL}/careers/${editingCareerId}`
        : `${API_URL}/careers`;
      const method = editingCareerId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });

      const saved = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorBanner(saved.message || saved.error || "Failed to save career.");
        return;
      }

      if (editingCareerId) {
        setCareers((prev) =>
          prev.map((c) => ((c._id || c.id) === editingCareerId ? saved : c))
        );
        showToast("Career pathway updated successfully!");
      } else {
        setCareers((prev) => [saved, ...prev]);
        showToast("New career pathway created!");
      }
      setIsCareerModalOpen(false);
    } catch (err) {
      console.error("Failed to save career:", err);
      setErrorBanner("Error saving career pathway.");
    }
  };

  const handleDeleteCareer = async (careerId) => {
    if (!window.confirm("Are you sure you want to delete this career pathway?"))
      return;
    try {
      const res = await fetch(`${API_URL}/careers/${careerId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (res.ok) {
        setCareers((prev) => prev.filter((c) => (c._id || c.id) !== careerId));
        showToast("Career deleted successfully.");
      }
    } catch (err) {
      console.error("Failed to delete career:", err);
    }
  };

  /* ========================================================================
     2. FIELD & SUBFIELD CRUD HANDLERS
     ======================================================================== */
  const openAddFieldModal = () => {
    setEditingFieldId(null);
    setFieldForm(EMPTY_FIELD_FORM);
    setIsFieldModalOpen(true);
  };

  const openEditFieldModal = (field) => {
    setEditingFieldId(field._id);
    setFieldForm({
      name: field.name || "",
      description: field.description || "",
    });
    setIsFieldModalOpen(true);
  };

  const handleSaveField = async (e) => {
    e.preventDefault();
    try {
      const url = editingFieldId
        ? `${API_URL}/fields/${editingFieldId}`
        : `${API_URL}/fields`;
      const method = editingFieldId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: fieldForm.name.trim(),
          description: fieldForm.description.trim(),
        }),
      });

      const saved = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorBanner(saved.message || "Failed to save field.");
        return;
      }

      if (editingFieldId) {
        setFields((prev) =>
          prev.map((f) => (f._id === editingFieldId ? saved : f))
        );
        showToast("Industry field updated!");
      } else {
        setFields((prev) => [...prev, saved]);
        showToast("New industry field created!");
      }
      setIsFieldModalOpen(false);
    } catch (err) {
      console.error("Failed to save field:", err);
    }
  };

  const handleDeleteField = async (fieldId) => {
    if (!window.confirm("Delete this industry field?")) return;
    try {
      const res = await fetch(`${API_URL}/fields/${fieldId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        setFields((prev) => prev.filter((f) => f._id !== fieldId));
        showToast("Industry field removed.");
      }
    } catch (err) {
      console.error("Failed to delete field:", err);
    }
  };

  const openAddSubfieldModal = (preselectedFieldId = "") => {
    setEditingSubfieldId(null);
    setSubfieldForm({
      name: "",
      description: "",
      field: preselectedFieldId || fields[0]?._id || "",
    });
    setIsSubfieldModalOpen(true);
  };

  const openEditSubfieldModal = (sub) => {
    setEditingSubfieldId(sub._id);
    setSubfieldForm({
      name: sub.name || "",
      description: sub.description || "",
      field: sub.field?._id || sub.field || "",
    });
    setIsSubfieldModalOpen(true);
  };

  const handleSaveSubfield = async (e) => {
    e.preventDefault();
    try {
      const url = editingSubfieldId
        ? `${API_URL}/subfields/${editingSubfieldId}`
        : `${API_URL}/subfields`;
      const method = editingSubfieldId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: subfieldForm.name.trim(),
          description: subfieldForm.description.trim(),
          field: subfieldForm.field,
        }),
      });

      const saved = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorBanner(saved.message || "Failed to save subfield.");
        return;
      }

      if (editingSubfieldId) {
        setSubfields((prev) =>
          prev.map((s) => (s._id === editingSubfieldId ? saved : s))
        );
        showToast("Subfield updated!");
      } else {
        setSubfields((prev) => [...prev, saved]);
        showToast("New subfield created!");
      }
      setIsSubfieldModalOpen(false);
    } catch (err) {
      console.error("Failed to save subfield:", err);
    }
  };

  const handleDeleteSubfield = async (subfieldId) => {
    if (!window.confirm("Delete this subfield?")) return;
    try {
      const res = await fetch(`${API_URL}/subfields/${subfieldId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        setSubfields((prev) => prev.filter((s) => s._id !== subfieldId));
        showToast("Subfield deleted.");
      }
    } catch (err) {
      console.error("Failed to delete subfield:", err);
    }
  };

  /* ========================================================================
     3. ROADMAP CRUD HANDLERS
     ======================================================================== */
  const openAddRoadmapModal = () => {
    setEditingRoadmapId(null);
    const defaultCareer = careers[0];
    setRoadmapForm({
      careerId: defaultCareer?._id || "",
      title: defaultCareer ? `${defaultCareer.name} Roadmap` : "",
      summary: "",
      steps: [{ ...EMPTY_ROADMAP_STEP, stepNumber: 1, order: 1 }],
    });
    setIsRoadmapModalOpen(true);
  };

  const openEditRoadmapModal = (roadmap) => {
    setEditingRoadmapId(roadmap._id);
    const cId =
      roadmap.career?._id ||
      roadmap.careerId?._id ||
      roadmap.careerId ||
      roadmap.career ||
      "";
    const mappedSteps =
      Array.isArray(roadmap.steps) && roadmap.steps.length > 0
        ? roadmap.steps.map((s, idx) => ({
            stepNumber: s.stepNumber || idx + 1,
            order: s.order || idx + 1,
            title: s.title || "",
            description: s.description || "",
            whyItMatters: s.whyItMatters || "",
            topicsText: Array.isArray(s.topics) ? s.topics.join(", ") : "",
            practice: s.practice || "",
            estimatedWeeks: s.estimatedWeeks || 4,
          }))
        : [{ ...EMPTY_ROADMAP_STEP }];

    setRoadmapForm({
      careerId: cId,
      title: roadmap.title || "",
      summary: roadmap.summary || "",
      steps: mappedSteps,
    });
    setIsRoadmapModalOpen(true);
  };

  const handleRoadmapStepChange = (index, field, value) => {
    setRoadmapForm((prev) => {
      const nextSteps = [...prev.steps];
      nextSteps[index] = { ...nextSteps[index], [field]: value };
      return { ...prev, steps: nextSteps };
    });
  };

  const handleAddRoadmapStep = () => {
    setRoadmapForm((prev) => ({
      ...prev,
      steps: [
        ...prev.steps,
        {
          ...EMPTY_ROADMAP_STEP,
          stepNumber: prev.steps.length + 1,
          order: prev.steps.length + 1,
        },
      ],
    }));
  };

  const handleRemoveRoadmapStep = (index) => {
    setRoadmapForm((prev) => {
      const next = prev.steps
        .filter((_, idx) => idx !== index)
        .map((s, idx) => ({ ...s, stepNumber: idx + 1, order: idx + 1 }));
      return {
        ...prev,
        steps: next.length > 0 ? next : [{ ...EMPTY_ROADMAP_STEP }],
      };
    });
  };

  const handleSaveRoadmap = async (e) => {
    e.preventDefault();
    try {
      const formattedSteps = roadmapForm.steps
        .filter((s) => s.title.trim())
        .map((s, idx) => ({
          stepNumber: idx + 1,
          order: idx + 1,
          title: s.title.trim(),
          description: s.description.trim(),
          whyItMatters: s.whyItMatters.trim(),
          topics: (s.topicsText || "")
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          practice: s.practice.trim(),
          estimatedWeeks: Number(s.estimatedWeeks) || 4,
        }));

      const payload = {
        career: roadmapForm.careerId,
        careerId: roadmapForm.careerId,
        title: roadmapForm.title.trim(),
        summary: roadmapForm.summary.trim(),
        steps: formattedSteps,
      };

      const url = editingRoadmapId
        ? `${API_URL}/roadmaps/${editingRoadmapId}`
        : `${API_URL}/roadmaps`;
      const method = editingRoadmapId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });

      const saved = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorBanner(saved.message || "Failed to save roadmap.");
        return;
      }

      if (editingRoadmapId) {
        setRoadmaps((prev) =>
          prev.map((r) => (r._id === editingRoadmapId ? saved : r))
        );
        showToast("Roadmap updated successfully!");
      } else {
        setRoadmaps((prev) => [saved, ...prev]);
        showToast("New career roadmap created!");
      }
      setIsRoadmapModalOpen(false);
    } catch (err) {
      console.error("Failed to save roadmap:", err);
    }
  };

  const handleDeleteRoadmap = async (roadmapId) => {
    if (!window.confirm("Are you sure you want to delete this roadmap?")) return;
    try {
      const res = await fetch(`${API_URL}/roadmaps/${roadmapId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        setRoadmaps((prev) => prev.filter((r) => r._id !== roadmapId));
        showToast("Roadmap deleted.");
      }
    } catch (err) {
      console.error("Failed to delete roadmap:", err);
    }
  };

  /* ========================================================================
     4. USER MANAGEMENT HANDLERS
     ======================================================================== */
  const handleToggleUserRole = async (targetUser) => {
    const nextRole = targetUser.role === "admin" ? "student" : "admin";
    try {
      const res = await fetch(`${API_URL}/users/${targetUser._id}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ role: nextRole }),
      });
      if (res.ok) {
        setUsersList((prev) =>
          prev.map((u) =>
            u._id === targetUser._id ? { ...u, role: nextRole } : u
          )
        );
        showToast(`Updated ${targetUser.name}'s role to ${nextRole}.`);
      }
    } catch (err) {
      console.error("Failed to update user role:", err);
    }
  };

  const handleToggleUserStatus = async (targetUser) => {
    try {
      const res = await fetch(`${API_URL}/users/${targetUser._id}/status`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        const newStatus = data.user?.isActive ?? !targetUser.isActive;
        setUsersList((prev) =>
          prev.map((u) =>
            u._id === targetUser._id ? { ...u, isActive: newStatus } : u
          )
        );
        showToast(
          `${targetUser.name} is now ${newStatus ? "active" : "deactivated"}.`
        );
      }
    } catch (err) {
      console.error("Failed to toggle user status:", err);
    }
  };

  const handleDeleteUser = async (targetUser) => {
    if (String(targetUser._id) === String(user?._id || user?.id)) {
      alert("You cannot delete your own active admin account.");
      return;
    }
    if (!window.confirm(`Delete user account "${targetUser.name}"?`)) return;
    try {
      const res = await fetch(`${API_URL}/users/${targetUser._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        setUsersList((prev) => prev.filter((u) => u._id !== targetUser._id));
        showToast("User account deleted.");
      }
    } catch (err) {
      console.error("Failed to delete user:", err);
    }
  };

  /* ========================================================================
     FILTERED LISTS
     ======================================================================== */
  const filteredCareers = careers.filter((c) => {
    const matchesSearch =
      (c.name || "").toLowerCase().includes(careerSearch.toLowerCase()) ||
      (c.fieldId?.name || "").toLowerCase().includes(careerSearch.toLowerCase()) ||
      (c.subfieldId?.name || "").toLowerCase().includes(careerSearch.toLowerCase());
    const cFieldId = String(c.fieldId?._id || c.fieldId || "");
    const matchesField =
      careerFieldFilter === "all" || cFieldId === String(careerFieldFilter);
    return matchesSearch && matchesField;
  });

  const filteredRoadmaps = roadmaps.filter((r) => {
    const q = roadmapSearch.toLowerCase();
    const cName = r.career?.name || r.careerId?.name || "";
    return (
      (r.title || "").toLowerCase().includes(q) ||
      cName.toLowerCase().includes(q)
    );
  });

  const filteredUsers = usersList.filter((u) => {
    const q = userSearch.toLowerCase();
    const matchesSearch =
      (u.name || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q);
    const matchesRole =
      userRoleFilter === "all" ||
      (userRoleFilter === "admin" && u.role === "admin") ||
      (userRoleFilter === "student" && u.role !== "admin");
    return matchesSearch && matchesRole;
  });

  const availableSubfieldsForCareerForm = subfields.filter(
    (s) =>
      !careerForm.fieldId ||
      String(s.field?._id || s.field) === String(careerForm.fieldId)
  );

  return (
    <div className="admin-page">
      <Navbar />

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="global-save-toast">
          <CheckCircle2 size={16} />
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
              Manage career pathways, industry fields, subfields, milestone roadmaps, and user accounts.
            </p>
          </div>

          <div className="admin-header-quick-btns">
            <button
              type="button"
              className="primary-btn"
              onClick={openAddCareerModal}
            >
              <Plus size={16} />
              <span>New Career</span>
            </button>
            <button
              type="button"
              className="secondary-btn"
              onClick={openAddRoadmapModal}
            >
              <Plus size={16} />
              <span>New Roadmap</span>
            </button>
          </div>
        </section>

        {errorBanner && (
          <div className="admin-error-alert" role="alert">
            <AlertTriangle size={18} />
            <span>{errorBanner}</span>
            <button type="button" onClick={() => setErrorBanner("")}>
              ×
            </button>
          </div>
        )}

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
            Careers ({careers.length})
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === "fields" ? "active" : ""}`}
            onClick={() => setActiveTab("fields")}
          >
            Fields & Subfields ({fields.length} / {subfields.length})
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
            <p>Loading platform datasets...</p>
          </div>
        )}

        {/* ================= TAB 1: OVERVIEW ================= */}
        {!loading && activeTab === "overview" && (
          <section className="admin-overview-section">
            <div className="admin-stats-grid">
              <div
                className="admin-stat-card clickable"
                onClick={() => setActiveTab("careers")}
              >
                <div className="stat-icon purple">
                  <Briefcase size={22} />
                </div>
                <div className="stat-details">
                  <span className="stat-number">{careers.length}</span>
                  <span className="stat-label">Total Careers</span>
                </div>
              </div>

              <div
                className="admin-stat-card clickable"
                onClick={() => setActiveTab("fields")}
              >
                <div className="stat-icon blue">
                  <Layers size={22} />
                </div>
                <div className="stat-details">
                  <span className="stat-number">{fields.length}</span>
                  <span className="stat-label">Industry Fields</span>
                </div>
              </div>

              <div
                className="admin-stat-card clickable"
                onClick={() => setActiveTab("fields")}
              >
                <div className="stat-icon cyan">
                  <FolderGit2 size={22} />
                </div>
                <div className="stat-details">
                  <span className="stat-number">{subfields.length}</span>
                  <span className="stat-label">Specialised Subfields</span>
                </div>
              </div>

              <div
                className="admin-stat-card clickable"
                onClick={() => setActiveTab("roadmaps")}
              >
                <div className="stat-icon green">
                  <Compass size={22} />
                </div>
                <div className="stat-details">
                  <span className="stat-number">{roadmaps.length}</span>
                  <span className="stat-label">Milestone Roadmaps</span>
                </div>
              </div>

              <div
                className="admin-stat-card clickable"
                onClick={() => setActiveTab("users")}
              >
                <div className="stat-icon orange">
                  <Users size={22} />
                </div>
                <div className="stat-details">
                  <span className="stat-number">{usersList.length}</span>
                  <span className="stat-label">Registered Users</span>
                </div>
              </div>
            </div>

            <div className="admin-quick-actions-card">
              <h3>Quick Management Actions</h3>
              <div className="quick-actions-row">
                <button
                  type="button"
                  className="primary-btn"
                  onClick={openAddCareerModal}
                >
                  <Plus size={16} />
                  <span>Add Career Pathway</span>
                </button>

                <button
                  type="button"
                  className="secondary-btn"
                  onClick={openAddFieldModal}
                >
                  <Plus size={16} />
                  <span>Add Industry Field</span>
                </button>

                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => openAddSubfieldModal()}
                >
                  <Plus size={16} />
                  <span>Add Subfield</span>
                </button>

                <button
                  type="button"
                  className="secondary-btn"
                  onClick={openAddRoadmapModal}
                >
                  <Plus size={16} />
                  <span>Create Career Roadmap</span>
                </button>
              </div>
            </div>

            {/* Overview Breakdown Grid */}
            <div className="admin-overview-panels-grid">
              {/* Panel 1: Careers per Field */}
              <div className="admin-panel-card">
                <div className="admin-panel-header">
                  <h3>Careers by Industry Field</h3>
                  <button
                    type="button"
                    className="admin-link-btn"
                    onClick={() => setActiveTab("fields")}
                  >
                    Manage Fields →
                  </button>
                </div>
                <div className="admin-field-bars-list">
                  {fields.map((f) => {
                    const count = careers.filter(
                      (c) => String(c.fieldId?._id || c.fieldId) === String(f._id)
                    ).length;
                    const pct =
                      careers.length > 0
                        ? Math.round((count / careers.length) * 100)
                        : 0;
                    return (
                      <div key={f._id} className="admin-field-bar-item">
                        <div className="admin-field-bar-top">
                          <strong>{f.name}</strong>
                          <span>
                            {count} careers ({pct}%)
                          </span>
                        </div>
                        <div className="admin-field-bar-track">
                          <div
                            className="admin-field-bar-fill"
                            style={{ width: `${Math.max(pct, 4)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Panel 2: Recent Registered Users */}
              <div className="admin-panel-card">
                <div className="admin-panel-header">
                  <h3>Recent Users</h3>
                  <button
                    type="button"
                    className="admin-link-btn"
                    onClick={() => setActiveTab("users")}
                  >
                    Manage All Users →
                  </button>
                </div>
                <div className="admin-recent-users-list">
                  {usersList.slice(0, 6).map((u) => (
                    <div key={u._id} className="admin-recent-user-row">
                      <div className="admin-user-avatar">
                        {(u.name || "U").charAt(0).toUpperCase()}
                      </div>
                      <div className="admin-user-meta">
                        <strong>{u.name}</strong>
                        <span>{u.email}</span>
                      </div>
                      <span
                        className={`role-badge ${
                          u.role === "admin" ? "admin" : ""
                        }`}
                      >
                        {u.role || "student"}
                      </span>
                    </div>
                  ))}
                  {usersList.length === 0 && (
                    <p className="text-muted">No users found.</p>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ================= TAB 2: MANAGE CAREERS ================= */}
        {!loading && activeTab === "careers" && (
          <section className="admin-table-section">
            <div className="table-actions-header">
              <div className="admin-filters-group">
                <div className="table-search-input-box">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Search careers by title, field or subfield..."
                    value={careerSearch}
                    onChange={(e) => setCareerSearch(e.target.value)}
                  />
                </div>

                <select
                  className="admin-filter-select"
                  value={careerFieldFilter}
                  onChange={(e) => setCareerFieldFilter(e.target.value)}
                >
                  <option value="all">All Industry Fields</option>
                  {fields.map((f) => (
                    <option key={f._id} value={f._id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                className="primary-btn"
                onClick={openAddCareerModal}
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
                    <th>Industry Field</th>
                    <th>Subfield</th>
                    <th>Demand</th>
                    <th>Minimum Education</th>
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
                      <td>{c.subfieldId?.name || "—"}</td>
                      <td>
                        <span className="demand-pill-small">
                          {typeof c.demand === "object"
                            ? c.demand?.level
                            : c.demand || "High"}
                        </span>
                      </td>
                      <td>
                        {c.education?.minimumQualification || "Bachelor's Degree"}
                      </td>
                      <td>
                        <div className="table-action-buttons">
                          <Link
                            to={`/careers/${c._id || c.id}`}
                            className="table-view-link"
                            title="View Career Page"
                          >
                            <ExternalLink size={14} />
                            <span>View</span>
                          </Link>
                          <button
                            type="button"
                            className="table-edit-btn"
                            onClick={() => openEditCareerModal(c)}
                            title="Edit Career"
                          >
                            <Edit3 size={15} />
                            <span>Edit</span>
                          </button>
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
                  {filteredCareers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="admin-empty-cell">
                        No matching careers found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ================= TAB 3: MANAGE FIELDS & SUBFIELDS ================= */}
        {!loading && activeTab === "fields" && (
          <section className="admin-table-section">
            <div className="table-actions-header">
              <div>
                <h3>Industry Fields & Specialised Subfields</h3>
                <p className="admin-section-subtext">
                  Organize top-level career domains and their specialised subfields.
                </p>
              </div>
              <div className="admin-btn-group">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => openAddSubfieldModal()}
                >
                  <Plus size={16} />
                  <span>Add Subfield</span>
                </button>
                <button
                  type="button"
                  className="primary-btn"
                  onClick={openAddFieldModal}
                >
                  <Plus size={16} />
                  <span>Add Industry Field</span>
                </button>
              </div>
            </div>

            <div className="admin-fields-list-cards">
              {fields.map((f) => {
                const fieldSubfields = subfields.filter(
                  (s) => String(s.field?._id || s.field) === String(f._id)
                );
                const fieldCareerCount = careers.filter(
                  (c) => String(c.fieldId?._id || c.fieldId) === String(f._id)
                ).length;

                return (
                  <div key={f._id} className="admin-field-card">
                    <div className="field-card-title-row">
                      <div>
                        <h4>{f.name}</h4>
                        <p className="field-card-desc">{f.description}</p>
                      </div>
                      <div className="field-card-actions">
                        <span className="career-count-pill">
                          {fieldCareerCount} Careers
                        </span>
                        <span className="career-count-pill subfield-pill">
                          {fieldSubfields.length} Subfields
                        </span>
                        <button
                          type="button"
                          className="table-edit-btn"
                          onClick={() => openEditFieldModal(f)}
                          title="Edit Field"
                        >
                          <Edit3 size={14} />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          className="table-delete-btn"
                          onClick={() => handleDeleteField(f._id)}
                          title="Delete Field"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    <div className="admin-subfields-area">
                      <div className="admin-subfields-header">
                        <span>Subfields in {f.name}:</span>
                        <button
                          type="button"
                          className="admin-add-sub-inline-btn"
                          onClick={() => openAddSubfieldModal(f._id)}
                        >
                          <Plus size={13} />
                          <span>Add Subfield</span>
                        </button>
                      </div>

                      {fieldSubfields.length > 0 ? (
                        <div className="admin-subfield-chips">
                          {fieldSubfields.map((sub) => (
                            <div key={sub._id} className="admin-subfield-chip">
                              <span>{sub.name}</span>
                              <button
                                type="button"
                                onClick={() => openEditSubfieldModal(sub)}
                                title="Edit Subfield"
                              >
                                <Edit3 size={12} />
                              </button>
                              <button
                                type="button"
                                className="danger"
                                onClick={() => handleDeleteSubfield(sub._id)}
                                title="Delete Subfield"
                              >
                                <X size={13} />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="admin-no-subfields">
                          No subfields added yet.
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ================= TAB 4: MANAGE ROADMAPS ================= */}
        {!loading && activeTab === "roadmaps" && (
          <section className="admin-table-section">
            <div className="table-actions-header">
              <div className="table-search-input-box">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search roadmaps by title or career..."
                  value={roadmapSearch}
                  onChange={(e) => setRoadmapSearch(e.target.value)}
                />
              </div>

              <button
                type="button"
                className="primary-btn"
                onClick={openAddRoadmapModal}
              >
                <Plus size={16} />
                <span>Create Roadmap</span>
              </button>
            </div>

            <div className="admin-table-wrapper">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Roadmap Title</th>
                    <th>Linked Career</th>
                    <th>Milestones</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRoadmaps.map((r) => {
                    const linkedCareerId =
                      r.career?._id ||
                      r.careerId?._id ||
                      r.careerId ||
                      r.career;
                    return (
                      <tr key={r._id}>
                        <td>
                          <strong>{r.title || "Career Roadmap"}</strong>
                          {r.summary && (
                            <div className="table-subtext">{r.summary}</div>
                          )}
                        </td>
                        <td>
                          {r.career?.name || r.careerId?.name || "Linked Career"}
                        </td>
                        <td>
                          <span className="demand-pill-small">
                            {r.steps?.length || 0} Steps
                          </span>
                        </td>
                        <td>
                          <div className="table-action-buttons">
                            {linkedCareerId && (
                              <Link
                                to={`/roadmaps/${linkedCareerId}`}
                                className="table-view-link"
                              >
                                <ExternalLink size={14} />
                                <span>View</span>
                              </Link>
                            )}
                            <button
                              type="button"
                              className="table-edit-btn"
                              onClick={() => openEditRoadmapModal(r)}
                            >
                              <Edit3 size={15} />
                              <span>Edit Steps</span>
                            </button>
                            <button
                              type="button"
                              className="table-delete-btn"
                              onClick={() => handleDeleteRoadmap(r._id)}
                              title="Delete Roadmap"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredRoadmaps.length === 0 && (
                    <tr>
                      <td colSpan={4} className="admin-empty-cell">
                        No roadmaps found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ================= TAB 5: MANAGE USERS ================= */}
        {!loading && activeTab === "users" && (
          <section className="admin-table-section">
            <div className="table-actions-header">
              <div className="admin-filters-group">
                <div className="table-search-input-box">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
                </div>

                <select
                  className="admin-filter-select"
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admins Only</option>
                  <option value="student">Students Only</option>
                </select>
              </div>
            </div>

            <div className="admin-table-wrapper">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Interests Setup</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => {
                    const isActive = u.isActive !== false;
                    return (
                      <tr key={u._id}>
                        <td>
                          <strong>{u.name}</strong>
                          {u.location && (
                            <div className="table-subtext">{u.location}</div>
                          )}
                        </td>
                        <td>{u.email}</td>
                        <td>
                          <span
                            className={`role-badge ${
                              u.role === "admin" ? "admin" : ""
                            }`}
                          >
                            {u.role || "student"}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`status-badge ${
                              isActive ? "active" : "inactive"
                            }`}
                          >
                            {isActive ? "Active" : "Deactivated"}
                          </span>
                        </td>
                        <td>
                          {u.assessmentCompleted ? (
                            <span className="status-badge active">Completed</span>
                          ) : (
                            <span className="status-badge pending">Pending</span>
                          )}
                        </td>
                        <td>
                          <div className="table-action-buttons">
                            <button
                              type="button"
                              className="table-edit-btn"
                              onClick={() => handleToggleUserRole(u)}
                              title="Switch Role"
                            >
                              <Shield size={14} />
                              <span>
                                {u.role === "admin"
                                  ? "Make Student"
                                  : "Make Admin"}
                              </span>
                            </button>

                            <button
                              type="button"
                              className="table-edit-btn"
                              onClick={() => handleToggleUserStatus(u)}
                              title={
                                isActive ? "Deactivate User" : "Activate User"
                              }
                            >
                              {isActive ? (
                                <>
                                  <UserX size={14} />
                                  <span>Deactivate</span>
                                </>
                              ) : (
                                <>
                                  <UserCheck size={14} />
                                  <span>Activate</span>
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              className="table-delete-btn"
                              onClick={() => handleDeleteUser(u)}
                              title="Delete User"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="admin-empty-cell">
                        No matching users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ================= MODAL 1: ADD / EDIT CAREER ================= */}
        {isCareerModalOpen && (
          <div className="modal-backdrop">
            <div className="admin-modal-card">
              <div className="modal-header">
                <h2>
                  {editingCareerId
                    ? "Edit Career Pathway"
                    : "Add New Career Pathway"}
                </h2>
                <button
                  type="button"
                  className="close-modal-btn"
                  onClick={() => setIsCareerModalOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveCareer} className="admin-modal-form">
                <div className="form-group">
                  <label>Career Title</label>
                  <input
                    type="text"
                    required
                    value={careerForm.name}
                    onChange={(e) =>
                      setCareerForm({ ...careerForm, name: e.target.value })
                    }
                    placeholder="e.g. Cloud Solutions Architect"
                  />
                </div>

                <div className="form-group-row">
                  <div className="form-group">
                    <label>Industry Field</label>
                    <select
                      required
                      value={careerForm.fieldId}
                      onChange={(e) => {
                        const nextFieldId = e.target.value;
                        const matchingSubs = subfields.filter(
                          (s) =>
                            String(s.field?._id || s.field) ===
                            String(nextFieldId)
                        );
                        setCareerForm({
                          ...careerForm,
                          fieldId: nextFieldId,
                          subfieldId: matchingSubs[0]?._id || "",
                        });
                      }}
                    >
                      <option value="">Select Field</option>
                      {fields.map((f) => (
                        <option key={f._id} value={f._id}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Subfield</label>
                    <select
                      value={careerForm.subfieldId}
                      onChange={(e) =>
                        setCareerForm({
                          ...careerForm,
                          subfieldId: e.target.value,
                        })
                      }
                    >
                      <option value="">Select Subfield (optional)</option>
                      {availableSubfieldsForCareerForm.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group-row">
                  <div className="form-group">
                    <label>Demand Level</label>
                    <select
                      value={careerForm.demandLevel}
                      onChange={(e) =>
                        setCareerForm({
                          ...careerForm,
                          demandLevel: e.target.value,
                        })
                      }
                    >
                      <option value="Very High">Very High Demand</option>
                      <option value="High">High Demand</option>
                      <option value="Growing">Growing Demand</option>
                      <option value="Moderate">Moderate Demand</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Minimum Qualification</label>
                    <input
                      type="text"
                      value={careerForm.minimumQualification}
                      onChange={(e) =>
                        setCareerForm({
                          ...careerForm,
                          minimumQualification: e.target.value,
                        })
                      }
                      placeholder="e.g. Bachelor's in CS / IT"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Short Description (shown on catalog cards)</label>
                  <input
                    type="text"
                    required
                    value={careerForm.shortDescription}
                    onChange={(e) =>
                      setCareerForm({
                        ...careerForm,
                        shortDescription: e.target.value,
                      })
                    }
                    placeholder="1–2 sentence summary of this role"
                  />
                </div>

                <div className="form-group">
                  <label>Detailed Overview</label>
                  <textarea
                    rows={3}
                    value={careerForm.description}
                    onChange={(e) =>
                      setCareerForm({
                        ...careerForm,
                        description: e.target.value,
                      })
                    }
                    placeholder="Explain what this career involves and who it suits..."
                  />
                </div>

                <div className="form-group">
                  <label>Technical Skills (comma-separated)</label>
                  <input
                    type="text"
                    value={careerForm.technicalSkills}
                    onChange={(e) =>
                      setCareerForm({
                        ...careerForm,
                        technicalSkills: e.target.value,
                      })
                    }
                    placeholder="Python, SQL, Docker, AWS, React"
                  />
                </div>

                <div className="form-group">
                  <label>Professional Skills (comma-separated)</label>
                  <input
                    type="text"
                    value={careerForm.professionalSkills}
                    onChange={(e) =>
                      setCareerForm({
                        ...careerForm,
                        professionalSkills: e.target.value,
                      })
                    }
                    placeholder="Problem Solving, Communication, System Design"
                  />
                </div>

                <div className="form-group-row">
                  <div className="form-group">
                    <label>Key Responsibilities (comma-separated)</label>
                    <input
                      type="text"
                      value={careerForm.responsibilities}
                      onChange={(e) =>
                        setCareerForm({
                          ...careerForm,
                          responsibilities: e.target.value,
                        })
                      }
                      placeholder="Build APIs, Review code, Optimize queries"
                    />
                  </div>

                  <div className="form-group">
                    <label>Salary Note / Typical Range</label>
                    <input
                      type="text"
                      value={careerForm.salaryNote}
                      onChange={(e) =>
                        setCareerForm({
                          ...careerForm,
                          salaryNote: e.target.value,
                        })
                      }
                      placeholder="₹6 LPA – ₹20 LPA"
                    />
                  </div>
                </div>

                <div className="modal-footer-actions">
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => setIsCareerModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="primary-btn">
                    {editingCareerId
                      ? "Save Changes"
                      : "Create Career Pathway"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================= MODAL 2: ADD / EDIT FIELD ================= */}
        {isFieldModalOpen && (
          <div className="modal-backdrop">
            <div className="admin-modal-card small">
              <div className="modal-header">
                <h2>
                  {editingFieldId
                    ? "Edit Industry Field"
                    : "Add Industry Field"}
                </h2>
                <button
                  type="button"
                  className="close-modal-btn"
                  onClick={() => setIsFieldModalOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveField} className="admin-modal-form">
                <div className="form-group">
                  <label>Field Name</label>
                  <input
                    type="text"
                    required
                    value={fieldForm.name}
                    onChange={(e) =>
                      setFieldForm({ ...fieldForm, name: e.target.value })
                    }
                    placeholder="e.g. Technology & Computer Science"
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    rows={3}
                    value={fieldForm.description}
                    onChange={(e) =>
                      setFieldForm({
                        ...fieldForm,
                        description: e.target.value,
                      })
                    }
                    placeholder="Overview of this industry discipline..."
                  />
                </div>

                <div className="modal-footer-actions">
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => setIsFieldModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="primary-btn">
                    {editingFieldId ? "Save Field" : "Create Field"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================= MODAL 3: ADD / EDIT SUBFIELD ================= */}
        {isSubfieldModalOpen && (
          <div className="modal-backdrop">
            <div className="admin-modal-card small">
              <div className="modal-header">
                <h2>
                  {editingSubfieldId ? "Edit Subfield" : "Add New Subfield"}
                </h2>
                <button
                  type="button"
                  className="close-modal-btn"
                  onClick={() => setIsSubfieldModalOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveSubfield} className="admin-modal-form">
                <div className="form-group">
                  <label>Parent Industry Field</label>
                  <select
                    required
                    value={subfieldForm.field}
                    onChange={(e) =>
                      setSubfieldForm({
                        ...subfieldForm,
                        field: e.target.value,
                      })
                    }
                  >
                    <option value="">Select Industry Field</option>
                    {fields.map((f) => (
                      <option key={f._id} value={f._id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Subfield Name</label>
                  <input
                    type="text"
                    required
                    value={subfieldForm.name}
                    onChange={(e) =>
                      setSubfieldForm({ ...subfieldForm, name: e.target.value })
                    }
                    placeholder="e.g. Cloud & DevOps Engineering"
                  />
                </div>

                <div className="form-group">
                  <label>Description (optional)</label>
                  <textarea
                    rows={2}
                    value={subfieldForm.description}
                    onChange={(e) =>
                      setSubfieldForm({
                        ...subfieldForm,
                        description: e.target.value,
                      })
                    }
                    placeholder="Brief description of this specialisation..."
                  />
                </div>

                <div className="modal-footer-actions">
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => setIsSubfieldModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="primary-btn">
                    {editingSubfieldId ? "Save Subfield" : "Create Subfield"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================= MODAL 4: CREATE / EDIT ROADMAP ================= */}
        {isRoadmapModalOpen && (
          <div className="modal-backdrop">
            <div className="admin-modal-card large">
              <div className="modal-header">
                <h2>
                  {editingRoadmapId
                    ? "Edit Career Roadmap & Milestones"
                    : "Create Career Roadmap"}
                </h2>
                <button
                  type="button"
                  className="close-modal-btn"
                  onClick={() => setIsRoadmapModalOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveRoadmap} className="admin-modal-form">
                <div className="form-group-row">
                  <div className="form-group">
                    <label>Linked Career</label>
                    <select
                      required
                      value={roadmapForm.careerId}
                      onChange={(e) => {
                        const selectedCareer = careers.find(
                          (c) => String(c._id) === String(e.target.value)
                        );
                        setRoadmapForm({
                          ...roadmapForm,
                          careerId: e.target.value,
                          title:
                            roadmapForm.title ||
                            (selectedCareer
                              ? `${selectedCareer.name} Roadmap`
                              : ""),
                        });
                      }}
                    >
                      <option value="">Select Career</option>
                      {careers.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Roadmap Title</label>
                    <input
                      type="text"
                      required
                      value={roadmapForm.title}
                      onChange={(e) =>
                        setRoadmapForm({
                          ...roadmapForm,
                          title: e.target.value,
                        })
                      }
                      placeholder="e.g. Full-Stack Developer Learning Path"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Roadmap Summary</label>
                  <input
                    type="text"
                    value={roadmapForm.summary}
                    onChange={(e) =>
                      setRoadmapForm({
                        ...roadmapForm,
                        summary: e.target.value,
                      })
                    }
                    placeholder="Step-by-step progression from fundamentals to job readiness"
                  />
                </div>

                <div className="admin-roadmap-steps-builder">
                  <div className="steps-builder-header">
                    <h4>Milestone Steps ({roadmapForm.steps.length})</h4>
                    <button
                      type="button"
                      className="secondary-btn small-btn"
                      onClick={handleAddRoadmapStep}
                    >
                      <Plus size={14} />
                      <span>Add Milestone Step</span>
                    </button>
                  </div>

                  {roadmapForm.steps.map((step, idx) => (
                    <div key={idx} className="admin-step-editor-card">
                      <div className="admin-step-editor-top">
                        <span className="step-num-badge">Step {idx + 1}</span>
                        {roadmapForm.steps.length > 1 && (
                          <button
                            type="button"
                            className="table-delete-btn"
                            onClick={() => handleRemoveRoadmapStep(idx)}
                            title="Remove Step"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>

                      <div className="form-group-row">
                        <div className="form-group">
                          <label>Step Title</label>
                          <input
                            type="text"
                            required
                            value={step.title}
                            onChange={(e) =>
                              handleRoadmapStepChange(
                                idx,
                                "title",
                                e.target.value
                              )
                            }
                            placeholder="e.g. Master Core Programming & Git"
                          />
                        </div>

                        <div className="form-group">
                          <label>Estimated Weeks</label>
                          <input
                            type="number"
                            min={1}
                            max={52}
                            value={step.estimatedWeeks}
                            onChange={(e) =>
                              handleRoadmapStepChange(
                                idx,
                                "estimatedWeeks",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Description</label>
                        <input
                          type="text"
                          value={step.description}
                          onChange={(e) =>
                            handleRoadmapStepChange(
                              idx,
                              "description",
                              e.target.value
                            )
                          }
                          placeholder="What the student will learn in this milestone..."
                        />
                      </div>

                      <div className="form-group-row">
                        <div className="form-group">
                          <label>Key Topics (comma-separated)</label>
                          <input
                            type="text"
                            value={step.topicsText}
                            onChange={(e) =>
                              handleRoadmapStepChange(
                                idx,
                                "topicsText",
                                e.target.value
                              )
                            }
                            placeholder="HTML/CSS, JavaScript ES6, Git workflows"
                          />
                        </div>

                        <div className="form-group">
                          <label>Practice Project / Output</label>
                          <input
                            type="text"
                            value={step.practice}
                            onChange={(e) =>
                              handleRoadmapStepChange(
                                idx,
                                "practice",
                                e.target.value
                              )
                            }
                            placeholder="Build and deploy a responsive portfolio app"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="modal-footer-actions">
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => setIsRoadmapModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="primary-btn">
                    {editingRoadmapId ? "Save Roadmap" : "Create Roadmap"}
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
