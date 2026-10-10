import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import Navbar from "../components/Navbar";
import { Check, AlertCircle, ArrowLeft } from "lucide-react";

const API_URL = "http://localhost:5000/api";

const WORK_INTERESTS_OPTIONS = [
  "Problem Solving",
  "Working with Data",
  "Creativity",
  "Communication",
  "Technology",
  "Research",
  "Management",
  "Helping People",
];

const WORK_PREFERENCES_OPTIONS = [
  "Individual Work",
  "Team Work",
  "Client Interaction",
  "Flexible/Creative Work",
];

export default function Assessment() {
  const navigate = useNavigate();
  const { isAuthenticated, user, token, updateUser, refreshUser } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [fields, setFields] = useState([]);
  const [subfields, setSubfields] = useState([]);
  const [loading, setLoading] = useState(true);

  // Assessment answers
  const [selectedFields, setSelectedFields] = useState([]);
  const [selectedSubfields, setSelectedSubfields] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [selectedPreferences, setSelectedPreferences] = useState([]);

  const [validationError, setValidationError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Signed-in users only
  useEffect(() => {
    if (!isAuthenticated) {
      sessionStorage.setItem("returnAfterLogin", "/assessment");
      sessionStorage.setItem(
        "authGateMessage",
        "Please sign in or create an account to select your career interests and get personalised matches."
      );
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Load fields, subfields, and existing user selections
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoading(true);
        const [fieldRes, subfieldRes] = await Promise.all([
          fetch(`${API_URL}/fields`),
          fetch(`${API_URL}/subfields`),
        ]);

        const fData = fieldRes.ok ? await fieldRes.json() : [];
        const sData = subfieldRes.ok ? await subfieldRes.json() : [];

        const fieldList = Array.isArray(fData) ? fData : fData.fields || [];
        // Sort fields alphabetically like in PDF Page 4 (Business, Design, Education, Finance, Healthcare, Law, Media, Science, Technology)
        fieldList.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        setFields(fieldList);
        setSubfields(Array.isArray(sData) ? sData : sData.subfields || []);

        if (user) {
          const existingFields =
            user.selectedFields || user.interestedFields || [];
          if (Array.isArray(existingFields) && existingFields.length > 0) {
            setSelectedFields(
              existingFields
                .map((f) => String(typeof f === "object" ? f._id : f))
                .slice(0, 3)
            );
          }
          const existingSubfields =
            user.selectedSubfields || user.interestedSubfields || [];
          if (
            Array.isArray(existingSubfields) &&
            existingSubfields.length > 0
          ) {
            setSelectedSubfields(
              existingSubfields.map((s) =>
                String(typeof s === "object" ? s._id : s)
              )
            );
          }
          if (
            Array.isArray(user.workInterests) &&
            user.workInterests.length > 0
          ) {
            setSelectedInterests(user.workInterests);
          }
          if (
            Array.isArray(user.workPreferences) &&
            user.workPreferences.length > 0
          ) {
            setSelectedPreferences(user.workPreferences);
          }
        }
      } catch (err) {
        console.error("Failed to load assessment fields:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, [user]);

  // Step 1: Toggle Field selection (Pick up to 3)
  const toggleField = (fieldId) => {
    const idStr = String(fieldId);
    setValidationError("");
    setSelectedFields((prev) => {
      if (prev.includes(idStr)) {
        const nextFields = prev.filter((id) => id !== idStr);
        // Also prune subfields belonging to unselected field
        setSelectedSubfields((prevSubs) =>
          prevSubs.filter((subId) => {
            const subObj = subfields.find((s) => String(s._id) === String(subId));
            if (!subObj) return true;
            const parentId = String(
              subObj.fieldId?._id || subObj.fieldId || subObj.field || ""
            );
            return nextFields.includes(parentId);
          })
        );
        return nextFields;
      } else {
        if (prev.length >= 3) {
          setValidationError("You can pick up to 3 areas of interest.");
          return prev;
        }
        return [...prev, idStr];
      }
    });
  };

  // Step 2: Available subfields filtered by chosen fields
  const relevantSubfields = subfields.filter((s) => {
    const parentFieldId = String(
      s.fieldId?._id || s.fieldId || s.field?._id || s.field || ""
    );
    return selectedFields.includes(parentFieldId);
  });

  const toggleSubfield = (subfieldId) => {
    const idStr = String(subfieldId);
    setValidationError("");
    setSelectedSubfields((prev) =>
      prev.includes(idStr)
        ? prev.filter((id) => id !== idStr)
        : [...prev, idStr]
    );
  };

  // Step 3: Toggle Work Interest & Preference
  const toggleInterest = (interest) => {
    setValidationError("");
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const togglePreference = (pref) => {
    setValidationError("");
    setSelectedPreferences((prev) =>
      prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]
    );
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (selectedFields.length === 0) {
        setValidationError(
          "Please select at least 1 area of interest (up to 3) to continue."
        );
        return;
      }
      setValidationError("");
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (selectedSubfields.length === 0) {
        setValidationError("Please select at least one subfield to continue.");
        return;
      }
      setValidationError("");
      setCurrentStep(3);
    }
  };

  const handleBackStep = () => {
    setValidationError("");
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    } else {
      navigate("/profile");
    }
  };

  const handleSubmitAssessment = async () => {
    if (selectedInterests.length === 0) {
      setValidationError("Please choose at least one type of work interest.");
      return;
    }
    if (selectedPreferences.length === 0) {
      setValidationError("Please choose at least one preferred work style.");
      return;
    }

    setSubmitting(true);
    setValidationError("");

    const assessmentPayload = {
      selectedFields,
      selectedSubfields,
      workInterests: selectedInterests,
      workPreferences: selectedPreferences,
      assessmentCompleted: true,
    };

    try {
      const authToken = token || localStorage.getItem("token");
      const res = await fetch(`${API_URL}/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(assessmentPayload),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user && typeof updateUser === "function") {
          updateUser(data.user);
        } else if (typeof refreshUser === "function") {
          await refreshUser();
        }
        sessionStorage.setItem(
          "matchesSavedToast",
          "Interests saved. Here are your matches."
        );
        navigate("/matches");
      } else {
        const errData = await res.json().catch(() => ({}));
        setValidationError(
          errData.message || "Failed to save your interests. Please try again."
        );
      }
    } catch (err) {
      console.error("Error saving assessment:", err);
      setValidationError("Network error while saving your interests.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="assessment-page">
      <Navbar />

      <main className="page-container pdf-assessment-container">
        <div className="pdf-page-back-row">
          <button
            type="button"
            onClick={handleBackStep}
            className="pdf-back-btn"
            title="Go back"
          >
            <ArrowLeft size={15} />
            <span>{currentStep === 1 ? "Back to Profile" : "Previous step"}</span>
          </button>
        </div>

        {/* Header (Matches PDF Page 4 bottom & Page 5) */}
        <div className="pdf-assessment-header">
          <h1>Tell us what interests you</h1>
          <p>
            Around ten quick selections. Your answers drive every match
            percentage you see, and you can change them later.
          </p>

          {/* 3-Step Pills */}
          <div className="pdf-step-pills">
            <button
              type="button"
              className={`pdf-step-pill ${currentStep === 1 ? "active" : ""}`}
              onClick={() => setCurrentStep(1)}
            >
              1. Areas of interest
            </button>
            <button
              type="button"
              className={`pdf-step-pill ${currentStep === 2 ? "active" : ""}`}
              onClick={() => {
                if (selectedFields.length > 0) setCurrentStep(2);
              }}
            >
              2. Subfields
            </button>
            <button
              type="button"
              className={`pdf-step-pill ${currentStep === 3 ? "active" : ""}`}
              onClick={() => {
                if (selectedFields.length > 0 && selectedSubfields.length > 0) {
                  setCurrentStep(3);
                }
              }}
            >
              3. Work style
            </button>
          </div>
        </div>

        {validationError && (
          <div className="assessment-error-banner" role="alert">
            <AlertCircle size={16} />
            <span>{validationError}</span>
          </div>
        )}

        {loading ? (
          <div className="saved-loading-state">
            <div className="loading-spinner-dot"></div>
            <p>Loading areas of interest...</p>
          </div>
        ) : (
          <div className="pdf-assessment-body">
            {/* ================= STEP 1: AREAS OF INTEREST (PDF PAGE 4 BOTTOM) ================= */}
            {currentStep === 1 && (
              <div className="pdf-step-section">
                <div className="pdf-step-subhead">
                  <h2>What areas interest you?</h2>
                  <p>
                    Pick up to 3. Selected {selectedFields.length}/3.
                  </p>
                </div>

                <div className="pdf-interest-cards-grid">
                  {fields.map((field) => {
                    const fId = String(field._id);
                    const isSelected = selectedFields.includes(fId);
                    return (
                      <div
                        key={fId}
                        className={`pdf-selectable-card ${
                          isSelected ? "selected" : ""
                        }`}
                        onClick={() => toggleField(fId)}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="pdf-selectable-card-top">
                          <h3>{field.name}</h3>
                          <span
                            className={`pdf-check-mark ${
                              isSelected ? "visible" : ""
                            }`}
                          >
                            <Check size={15} strokeWidth={2.5} />
                          </span>
                        </div>
                        <p>
                          {field.description ||
                            "Explore career pathways in this field."}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ================= STEP 2: SUBFIELDS (PDF PAGE 5 TOP) ================= */}
            {currentStep === 2 && (
              <div className="pdf-step-section">
                <div className="pdf-step-subhead">
                  <h2>Which subfields appeal to you?</h2>
                  <p>
                    These come from the fields you chose. Selecting a few
                    sharpens your matches.
                  </p>
                </div>

                <div className="pdf-subfields-groups">
                  {selectedFields.map((fieldId) => {
                    const fieldObj = fields.find(
                      (f) => String(f._id) === String(fieldId)
                    );
                    const fieldSubs = relevantSubfields.filter(
                      (s) =>
                        String(
                          s.fieldId?._id || s.fieldId || s.field || ""
                        ) === String(fieldId)
                    );

                    if (fieldSubs.length === 0) return null;

                    return (
                      <div key={fieldId} className="pdf-subfield-group">
                        <div className="pdf-subfield-group-label">
                          {(fieldObj?.name || "FIELD").toUpperCase()}
                        </div>

                        <div className="pdf-interest-cards-grid">
                          {fieldSubs.map((sub) => {
                            const sId = String(sub._id);
                            const isSelected = selectedSubfields.includes(sId);
                            return (
                              <div
                                key={sId}
                                className={`pdf-selectable-card ${
                                  isSelected ? "selected" : ""
                                }`}
                                onClick={() => toggleSubfield(sId)}
                                role="button"
                                tabIndex={0}
                              >
                                <div className="pdf-selectable-card-top">
                                  <h3>{sub.name}</h3>
                                  <span
                                    className={`pdf-check-mark ${
                                      isSelected ? "visible" : ""
                                    }`}
                                  >
                                    <Check size={15} strokeWidth={2.5} />
                                  </span>
                                </div>
                                <p>
                                  {sub.description ||
                                    `Roles and paths in ${sub.name}.`}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ================= STEP 3: WORK STYLE (PDF PAGE 5 BOTTOM) ================= */}
            {currentStep === 3 && (
              <div className="pdf-step-section">
                <div className="pdf-step-subhead">
                  <h2>What type of work interests you?</h2>
                </div>

                <div className="pdf-work-type-grid">
                  {WORK_INTERESTS_OPTIONS.map((item) => {
                    const isSelected = selectedInterests.includes(item);
                    return (
                      <div
                        key={item}
                        className={`pdf-compact-select-card ${
                          isSelected ? "selected" : ""
                        }`}
                        onClick={() => toggleInterest(item)}
                        role="button"
                        tabIndex={0}
                      >
                        <strong>{item}</strong>
                        <span
                          className={`pdf-check-mark ${
                            isSelected ? "visible" : "faint"
                          }`}
                        >
                          <Check size={14} strokeWidth={2.5} />
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="pdf-step-subhead mt-8">
                  <h2>Preferred work style</h2>
                </div>

                <div className="pdf-work-style-grid">
                  {WORK_PREFERENCES_OPTIONS.map((item) => {
                    const isSelected = selectedPreferences.includes(item);
                    return (
                      <div
                        key={item}
                        className={`pdf-compact-select-card ${
                          isSelected ? "selected" : ""
                        }`}
                        onClick={() => togglePreference(item)}
                        role="button"
                        tabIndex={0}
                      >
                        <strong>{item}</strong>
                        <span
                          className={`pdf-check-mark ${
                            isSelected ? "visible" : "faint"
                          }`}
                        >
                          <Check size={14} strokeWidth={2.5} />
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Bottom Navigation Bar */}
            <div className="pdf-assessment-footer">
              <button
                type="button"
                className="pdf-outline-btn"
                onClick={handleBackStep}
                disabled={submitting}
              >
                Back
              </button>

              {currentStep < 3 ? (
                <button
                  type="button"
                  className="pdf-explore-btn large"
                  onClick={handleNextStep}
                >
                  Continue
                </button>
              ) : (
                <button
                  type="button"
                  className="pdf-explore-btn large"
                  onClick={handleSubmitAssessment}
                  disabled={submitting}
                >
                  {submitting ? "Saving..." : "Save and see my matches"}
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
