import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import Navbar from "../components/Navbar";
import { CheckCircle2 } from "lucide-react";

const API_URL = "http://localhost:5000/api";

export default function Profile() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, user, token, updateUser, refreshUser } = useAuth();
  const isOnboarding =
    searchParams.get("onboarding") === "1" || !user?.assessmentCompleted;

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    location: user?.location || "",
    profilePicture: user?.profilePicture || "",
    educationLevel: user?.education?.level || "",
    degree: user?.education?.degree || user?.education?.course || "",
    specialization:
      user?.education?.specialization || user?.education?.fieldOfStudy || "",
    college: user?.education?.college || user?.education?.institution || "",
    currentYear: user?.education?.currentYear || "",
    expectedGraduation:
      user?.education?.expectedGraduation ||
      (user?.education?.graduationYear
        ? String(user.education.graduationYear)
        : ""),
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Load latest profile data from backend on mount
  useEffect(() => {
    let ignore = false;
    async function loadProfile() {
      const authToken = token || localStorage.getItem("token");
      if (!authToken) return;
      try {
        const res = await fetch(`${API_URL}/users/profile`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (res.ok && !ignore) {
          const u = await res.json();
          setFormData({
            name: u.name || "",
            email: u.email || "",
            phone: u.phone || "",
            location: u.location || "",
            profilePicture: u.profilePicture || "",
            educationLevel: u.education?.level || "",
            degree: u.education?.degree || u.education?.course || "",
            specialization:
              u.education?.specialization || u.education?.fieldOfStudy || "",
            college: u.education?.college || u.education?.institution || "",
            currentYear: u.education?.currentYear || "",
            expectedGraduation:
              u.education?.expectedGraduation ||
              (u.education?.graduationYear
                ? String(u.education.graduationYear)
                : ""),
          });
        }
      } catch {
        // Ignore network errors on initial prefill
      }
    }
    loadProfile();
    return () => {
      ignore = true;
    };
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const authToken = token || localStorage.getItem("token");
      const payload = {
        name: formData.name,
        phone: formData.phone,
        location: formData.location,
        profilePicture: formData.profilePicture,
        education: {
          level: formData.educationLevel,
          degree: formData.degree,
          specialization: formData.specialization,
          college: formData.college,
          institution: formData.college,
          currentYear: formData.currentYear,
          expectedGraduation: formData.expectedGraduation,
        },
      };

      const res = await fetch(`${API_URL}/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user && typeof updateUser === "function") {
          updateUser(data.user);
        } else if (typeof refreshUser === "function") {
          await refreshUser();
        }
        setSuccessMessage("Profile saved! Continuing to interest selection...");
        setTimeout(() => {
          navigate("/assessment");
        }, 400);
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMessage(data.message || "Failed to update profile.");
      }
    } catch (err) {
      console.error("Profile update error:", err);
      setErrorMessage("Network error occurred while saving profile.");
    } finally {
      setLoading(false);
    }
  };

  const hasSelectedInterests =
    Boolean(user?.assessmentCompleted) ||
    (Array.isArray(user?.selectedFields) && user.selectedFields.length > 0);

  return (
    <div className="profile-page">
      <Navbar />

      {successMessage && (
        <div className="global-save-toast">
          <CheckCircle2 size={16} />
          <span>{successMessage}</span>
        </div>
      )}

      <main className="page-container pdf-profile-container">
        <div className="pdf-profile-header">
          <h1>Your profile</h1>
          <p>
            We only ask for what helps us give you better guidance. Nothing here
            is shown publicly.
          </p>
        </div>

        {isOnboarding && (
          <div className="pdf-step-banner">
            Step 1 of 2 — after saving your profile you will pick your
            interests.
          </div>
        )}

        {errorMessage && (
          <div className="profile-error-alert" role="alert">
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="pdf-profile-form-stack">
          {/* Card 1: Basic Information (Matches PDF Page 3 bottom) */}
          <section className="pdf-profile-card">
            <h2>Basic information</h2>

            <div className="pdf-avatar-url-row">
              <div className="pdf-avatar-initial">
                {formData.name
                  ? formData.name.charAt(0).toUpperCase()
                  : "U"}
              </div>
              <div className="pdf-form-field flex-1">
                <label htmlFor="profilePicture">
                  Profile picture URL (optional)
                </label>
                <input
                  type="url"
                  id="profilePicture"
                  name="profilePicture"
                  placeholder="https://..."
                  value={formData.profilePicture}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="pdf-two-col-fields">
              <div className="pdf-form-field">
                <label htmlFor="name">Full name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="pdf-form-field">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="pdf-disabled-input"
                />
              </div>

              <div className="pdf-form-field">
                <label htmlFor="phone">Phone (optional)</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder=""
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="pdf-form-field">
                <label htmlFor="location">Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  placeholder="City, State"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>
            </div>
          </section>

          {/* Card 2: Education (Matches PDF Page 3 bottom & Page 4 top) */}
          <section className="pdf-profile-card">
            <h2>Education</h2>
            <p className="pdf-card-sub">
              Pick where you are right now and we will ask only what fits.
            </p>

            <div className="pdf-form-field">
              <label htmlFor="educationLevel">Education level</label>
              <select
                id="educationLevel"
                name="educationLevel"
                value={formData.educationLevel}
                onChange={handleChange}
              >
                <option value="">Select a level</option>
                <option value="High School (10th)">High School (10th)</option>
                <option value="Higher Secondary (12th)">
                  Higher Secondary (12th)
                </option>
                <option value="Diploma">Diploma</option>
                <option value="Undergraduate">Undergraduate</option>
                <option value="Postgraduate">Postgraduate</option>
                <option value="Working Professional">
                  Working Professional
                </option>
              </select>
            </div>

            {formData.educationLevel && (
              <div className="pdf-two-col-fields mt-4">
                <div className="pdf-form-field">
                  <label htmlFor="degree">Degree</label>
                  <input
                    type="text"
                    id="degree"
                    name="degree"
                    placeholder="e.g. M.Sc. IT, B.Tech, MBA"
                    value={formData.degree}
                    onChange={handleChange}
                  />
                </div>

                <div className="pdf-form-field">
                  <label htmlFor="specialization">Specialization</label>
                  <input
                    type="text"
                    id="specialization"
                    name="specialization"
                    placeholder="e.g. Information Technology"
                    value={formData.specialization}
                    onChange={handleChange}
                  />
                </div>

                <div className="pdf-form-field">
                  <label htmlFor="college">College / University</label>
                  <input
                    type="text"
                    id="college"
                    name="college"
                    placeholder="e.g. University name"
                    value={formData.college}
                    onChange={handleChange}
                  />
                </div>

                <div className="pdf-form-field">
                  <label htmlFor="currentYear">Current year or semester</label>
                  <input
                    type="text"
                    id="currentYear"
                    name="currentYear"
                    placeholder="e.g. Semester 3 / Final Year"
                    value={formData.currentYear}
                    onChange={handleChange}
                  />
                </div>

                <div className="pdf-form-field">
                  <label htmlFor="expectedGraduation">Expected graduation</label>
                  <input
                    type="text"
                    id="expectedGraduation"
                    name="expectedGraduation"
                    placeholder="e.g. 2026"
                    value={formData.expectedGraduation}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}
          </section>

          {/* Card 3: Interests and preferences (Matches PDF Page 4 top) */}
          <section className="pdf-profile-card pdf-interests-row-card">
            <div>
              <h2>Interests and preferences</h2>
              <p className="pdf-card-sub mb-0">
                {hasSelectedInterests
                  ? `You have selected ${user?.selectedFields?.length || 0} field(s), ${user?.selectedSubfields?.length || 0} subfield(s), and ${user?.workInterests?.length || 0} work interest(s).`
                  : "You have not selected your interests yet."}
              </p>
            </div>

            <Link to="/assessment" className="pdf-outline-btn">
              {hasSelectedInterests ? "Edit interests" : "Select interests"}
            </Link>
          </section>

          {/* Save and continue button */}
          <div className="pdf-profile-submit-row">
            <button
              type="submit"
              className="pdf-explore-btn large"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save and continue"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
