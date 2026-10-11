import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import Navbar from "../components/Navbar";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Award,
  BarChart2,
  BookOpen,
  Briefcase,
  Check,
  ClipboardList,
  Code2,
  Compass,
  Cpu,
  Database,
  Heart,
  Layers,
  Layout,
  Lightbulb,
  LineChart,
  MessageSquare,
  Palette,
  PenTool,
  Rocket,
  Scale,
  Search,
  Settings,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  getFieldMeta,
  getSubfieldMeta,
} from "../utils/fieldDescriptions";

const API_URL = "http://localhost:5000/api";

const WORK_INTERESTS_OPTIONS = [
  {
    id: "Problem Solving",
    label: "Problem Solving",
    shortTag: "Logic & Troubleshooting",
    Icon: Lightbulb,
    tone: "purple",
  },
  {
    id: "Working with Data",
    label: "Working with Data",
    shortTag: "Metrics & Patterns",
    Icon: BarChart2,
    tone: "blue",
  },
  {
    id: "Creativity",
    label: "Creativity",
    shortTag: "Design & Original Ideas",
    Icon: Palette,
    tone: "rose",
  },
  {
    id: "Communication",
    label: "Communication",
    shortTag: "Writing & Presenting",
    Icon: MessageSquare,
    tone: "violet",
  },
  {
    id: "Technology",
    label: "Technology",
    shortTag: "Software & Digital Tools",
    Icon: Cpu,
    tone: "indigo",
  },
  {
    id: "Research",
    label: "Research",
    shortTag: "Investigation & Study",
    Icon: Search,
    tone: "cyan",
  },
  {
    id: "Management",
    label: "Management",
    shortTag: "Leadership & Planning",
    Icon: Briefcase,
    tone: "amber",
  },
  {
    id: "Helping People",
    label: "Helping People",
    shortTag: "Care, Guidance & Impact",
    Icon: Heart,
    tone: "teal",
  },
];

const WORK_ACTIVITIES_OPTIONS = [
  {
    id: "Finding & Solving Problems",
    title: "Finding & Solving Problems",
    example:
      "Diagnosing why a system, process, or workflow isn't working and fixing it",
    Icon: Settings,
    tone: "purple",
  },
  {
    id: "Analyzing Data",
    title: "Analyzing Data",
    example:
      "Finding patterns, comparing numbers, and drawing evidence-based conclusions",
    Icon: LineChart,
    tone: "blue",
  },
  {
    id: "Creating New Ideas",
    title: "Creating New Ideas",
    example:
      "Brainstorming new concepts, product features, or strategic solutions",
    Icon: Lightbulb,
    tone: "amber",
  },
  {
    id: "Designing & Creating",
    title: "Designing & Creating",
    example:
      "Crafting user interfaces, visuals, media assets, or structured content",
    Icon: PenTool,
    tone: "rose",
  },
  {
    id: "Building Technology",
    title: "Building Technology",
    example:
      "Writing code, building applications, or configuring digital systems",
    Icon: Code2,
    tone: "indigo",
  },
  {
    id: "Research & Investigation",
    title: "Research & Investigation",
    example:
      "Studying domain problems, testing hypotheses, and gathering reliable data",
    Icon: Search,
    tone: "cyan",
  },
  {
    id: "Explaining & Communicating",
    title: "Explaining & Communicating",
    example:
      "Presenting findings, teaching others, or translating complex topics clearly",
    Icon: BookOpen,
    tone: "teal",
  },
  {
    id: "Planning & Organizing",
    title: "Planning & Organizing",
    example:
      "Structuring workflows, project roadmaps, budgets, and team deliverables",
    Icon: ClipboardList,
    tone: "emerald",
  },
];

const PRACTICAL_PROBLEM_STYLES = [
  {
    id: "Style:Hands-On Technical Building",
    title: "Hands-On Technical Building",
    description:
      "Write code, configure tools, and build a working prototype to solve the problem",
    impliedActivity: "Building Technology",
    Icon: Code2,
    tone: "purple",
  },
  {
    id: "Style:Evidence & Data-Driven Analysis",
    title: "Evidence & Data-Driven Analysis",
    description:
      "Collect data, run numbers, and let measurable metrics prove the right direction",
    impliedActivity: "Analyzing Data",
    Icon: Database,
    tone: "blue",
  },
  {
    id: "Style:User-Centric Design & Empathy",
    title: "User-Centric Design & Empathy",
    description:
      "Understand user pain points and design an intuitive, human-friendly experience",
    impliedActivity: "Designing & Creating",
    Icon: Layout,
    tone: "rose",
  },
  {
    id: "Style:Structured Strategy & Execution",
    title: "Structured Strategy & Execution",
    description:
      "Break the goal into clear milestones, align resources, and drive delivery",
    impliedActivity: "Planning & Organizing",
    Icon: Target,
    tone: "amber",
  },
  {
    id: "Style:Deep Research & Compliance",
    title: "Deep Research & Investigation",
    description:
      "Investigate regulations, domain literature, or technical root causes thoroughly",
    impliedActivity: "Research & Investigation",
    Icon: Shield,
    tone: "indigo",
  },
  {
    id: "Style:Direct Advisory & Collaboration",
    title: "Direct Advisory & Collaboration",
    description:
      "Work directly with clients, students, or teams to guide and resolve their needs",
    impliedActivity: "Explaining & Communicating",
    Icon: Users,
    tone: "teal",
  },
];

const PRACTICAL_CAREER_PRIORITIES = [
  {
    id: "Priority:High Market Demand & Rapid Growth",
    title: "High Market Demand & Rapid Growth",
    description:
      "Fast-growing fields with strong hiring momentum and career mobility",
    Icon: TrendingUp,
    tone: "emerald",
  },
  {
    id: "Priority:Clear Technical Skill Progression",
    title: "Clear Technical Skill Progression",
    description:
      "Concrete, measurable technical skills, tools, and certifications",
    Icon: Award,
    tone: "purple",
  },
  {
    id: "Priority:Creative Freedom & Visual Output",
    title: "Creative Freedom & Tangible Output",
    description:
      "Room to experiment, design, and build a visible portfolio of work",
    Icon: Sparkles,
    tone: "rose",
  },
  {
    id: "Priority:Business & Financial Impact",
    title: "Business & Financial Impact",
    description:
      "Driving revenue, investments, operations, or organizational strategy",
    Icon: Rocket,
    tone: "blue",
  },
  {
    id: "Priority:Direct Social & Human Impact",
    title: "Direct Social & Human Impact",
    description:
      "Improving healthcare, education, legal fairness, or community wellbeing",
    Icon: Activity,
    tone: "teal",
  },
  {
    id: "Priority:Cross-Functional Variety",
    title: "Cross-Functional Variety",
    description:
      "Connecting technology, business, and people rather than one narrow task",
    Icon: Layers,
    tone: "indigo",
  },
];

const VALID_ACTIVITY_IDS = new Set(WORK_ACTIVITIES_OPTIONS.map((a) => a.id));
const VALID_STYLE_IDS = new Set(PRACTICAL_PROBLEM_STYLES.map((s) => s.id));
const VALID_PRIORITY_IDS = new Set(
  PRACTICAL_CAREER_PRIORITIES.map((p) => p.id)
);

const MAX_INTERESTS = 5;
const MAX_ACTIVITIES = 4;
const MAX_STYLES = 2;
const MAX_PRIORITIES = 2;

const CHOICE_LABELS = ["1st Choice", "2nd Choice", "3rd Choice"];

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
  const [selectedStyles, setSelectedStyles] = useState([]);
  const [selectedPriorities, setSelectedPriorities] = useState([]);

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
            setSelectedInterests(user.workInterests.slice(0, MAX_INTERESTS));
          }
          if (
            Array.isArray(user.workPreferences) &&
            user.workPreferences.length > 0
          ) {
            const validActivities = user.workPreferences.filter((p) =>
              VALID_ACTIVITY_IDS.has(p)
            );
            const validStyles = user.workPreferences.filter((p) =>
              VALID_STYLE_IDS.has(p)
            );
            const validPriorities = user.workPreferences.filter((p) =>
              VALID_PRIORITY_IDS.has(p)
            );
            setSelectedPreferences(validActivities.slice(0, MAX_ACTIVITIES));
            setSelectedStyles(validStyles.slice(0, MAX_STYLES));
            setSelectedPriorities(validPriorities.slice(0, MAX_PRIORITIES));
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
        setSelectedSubfields((prevSubs) =>
          prevSubs.filter((subId) => {
            const subObj = subfields.find(
              (s) => String(s._id) === String(subId)
            );
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

  // Step 3: Toggle Interest (up to 5), Activity (up to 4), Problem Style (up to 2), & Priority (up to 2)
  const toggleInterest = (interestId) => {
    setValidationError("");
    setSelectedInterests((prev) => {
      if (prev.includes(interestId)) {
        return prev.filter((i) => i !== interestId);
      }
      if (prev.length >= MAX_INTERESTS) {
        setValidationError(`You can select up to ${MAX_INTERESTS} interests.`);
        return prev;
      }
      return [...prev, interestId];
    });
  };

  const togglePreference = (activityId) => {
    setValidationError("");
    setSelectedPreferences((prev) => {
      if (prev.includes(activityId)) {
        return prev.filter((p) => p !== activityId);
      }
      if (prev.length >= MAX_ACTIVITIES) {
        setValidationError(
          `You can select up to ${MAX_ACTIVITIES} activities that sound interesting to you.`
        );
        return prev;
      }
      return [...prev, activityId];
    });
  };

  const toggleStyle = (styleId) => {
    setValidationError("");
    setSelectedStyles((prev) => {
      if (prev.includes(styleId)) {
        return prev.filter((s) => s !== styleId);
      }
      if (prev.length >= MAX_STYLES) {
        setValidationError(
          `You can select up to ${MAX_STYLES} problem-solving approaches.`
        );
        return prev;
      }
      return [...prev, styleId];
    });
  };

  const togglePriority = (priorityId) => {
    setValidationError("");
    setSelectedPriorities((prev) => {
      if (prev.includes(priorityId)) {
        return prev.filter((p) => p !== priorityId);
      }
      if (prev.length >= MAX_PRIORITIES) {
        setValidationError(
          `You can select up to ${MAX_PRIORITIES} practical career priorities.`
        );
        return prev;
      }
      return [...prev, priorityId];
    });
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
      setValidationError("Please select at least one interest (up to 5).");
      return;
    }
    if (selectedPreferences.length === 0) {
      setValidationError(
        "Please select at least one activity you would enjoy doing (up to 4)."
      );
      return;
    }

    setSubmitting(true);
    setValidationError("");

    const impliedActivities = selectedStyles
      .map(
        (sId) =>
          PRACTICAL_PROBLEM_STYLES.find((item) => item.id === sId)
            ?.impliedActivity
      )
      .filter(Boolean);

    const combinedActivities = Array.from(
      new Set([...selectedPreferences, ...impliedActivities])
    ).slice(0, MAX_ACTIVITIES);

    const combinedPreferences = [
      ...combinedActivities,
      ...selectedStyles,
      ...selectedPriorities,
    ];

    const assessmentPayload = {
      selectedFields,
      selectedSubfields,
      workInterests: selectedInterests,
      workPreferences: combinedPreferences,
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

  const selectedFieldNames = selectedFields
    .map((fId) => fields.find((f) => String(f._id) === String(fId))?.name)
    .filter(Boolean);

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

        {/* Creative Hero Banner + Interactive 3-Step Track */}
        <div className="pdf-assessment-header creative-assessment-hero">
          <span className="creative-hero-eyebrow">
            <Sparkles size={13} />
            <span>PERSONALISED CAREER DISCOVERY</span>
          </span>

          <h1>Tell us what interests you</h1>
          <p>
            Pick your top fields, specialisations, and work style. Your choices
            calculate your career match scores and tailor your roadmaps.
          </p>

          {/* 3-Step Interactive Pills with Live Badges */}
          <div className="pdf-step-pills creative-step-track">
            <button
              type="button"
              className={`pdf-step-pill creative-step-btn ${
                currentStep === 1 ? "active" : ""
              } ${selectedFields.length > 0 ? "done" : ""}`}
              onClick={() => setCurrentStep(1)}
            >
              <span className="step-num-dot">1</span>
              <span>Areas of interest</span>
              <span className="step-count-chip">{selectedFields.length}/3</span>
            </button>

            <button
              type="button"
              className={`pdf-step-pill creative-step-btn ${
                currentStep === 2 ? "active" : ""
              } ${selectedSubfields.length > 0 ? "done" : ""}`}
              onClick={() => {
                if (selectedFields.length > 0) setCurrentStep(2);
              }}
            >
              <span className="step-num-dot">2</span>
              <span>Subfields</span>
              <span className="step-count-chip">
                {selectedSubfields.length}
              </span>
            </button>

            <button
              type="button"
              className={`pdf-step-pill creative-step-btn ${
                currentStep === 3 ? "active" : ""
              } ${
                selectedInterests.length > 0 && selectedPreferences.length > 0
                  ? "done"
                  : ""
              }`}
              onClick={() => {
                if (selectedFields.length > 0 && selectedSubfields.length > 0) {
                  setCurrentStep(3);
                }
              }}
            >
              <span className="step-num-dot">3</span>
              <span>Interests &amp; activities</span>
              <span className="step-count-chip">
                {selectedInterests.length + selectedPreferences.length}
              </span>
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
            {/* ================= STEP 1: AREAS OF INTEREST ================= */}
            {currentStep === 1 && (
              <div className="pdf-step-section">
                <div className="pdf-step-subhead creative-section-head">
                  <div>
                    <h2>What areas interest you?</h2>
                    <p>
                      Pick up to 3 fields in order of preference (1st choice
                      carries the highest weight).
                    </p>
                  </div>
                  <span className="selection-counter-pill">
                    {selectedFields.length} of 3 selected
                  </span>
                </div>

                <div className="pdf-interest-cards-grid">
                  {fields.map((field) => {
                    const fId = String(field._id);
                    const choiceIdx = selectedFields.indexOf(fId);
                    const isSelected = choiceIdx !== -1;
                    const meta = getFieldMeta(field);
                    const FieldIcon = meta.Icon;

                    return (
                      <div
                        key={fId}
                        className={`pdf-selectable-card creative-field-card ${
                          isSelected ? "selected" : ""
                        }`}
                        onClick={() => toggleField(fId)}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="creative-card-row">
                          <span
                            className={`creative-theme-icon ${meta.tone}`}
                            aria-hidden="true"
                          >
                            <FieldIcon size={20} strokeWidth={2.1} />
                          </span>

                          <div className="creative-field-info">
                            <h3>{field.name}</h3>
                            <span className="creative-short-tag">
                              {meta.shortTag}
                            </span>
                          </div>

                          <div className="creative-card-right">
                            {isSelected && (
                              <span className="choice-rank-pill">
                                {CHOICE_LABELS[choiceIdx] || "Selected"}
                              </span>
                            )}
                            <span
                              className={`creative-check-circle ${
                                isSelected ? "selected" : ""
                              }`}
                            >
                              <Check size={14} strokeWidth={2.8} />
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ================= STEP 2: SUBFIELDS ================= */}
            {currentStep === 2 && (
              <div className="pdf-step-section">
                <div className="pdf-step-subhead creative-section-head">
                  <div>
                    <h2>Which subfields appeal to you?</h2>
                    <p>
                      Pick the specialisations that interest you within your
                      chosen fields.
                    </p>
                  </div>
                  <span className="selection-counter-pill">
                    {selectedSubfields.length} selected
                  </span>
                </div>

                <div className="pdf-subfields-groups">
                  {selectedFields.map((fieldId, idx) => {
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
                    const parentMeta = getFieldMeta(fieldObj);
                    const ParentIcon = parentMeta.Icon;

                    return (
                      <div
                        key={fieldId}
                        className="pdf-subfield-group creative-subfield-box"
                      >
                        <div className="pdf-subfield-group-head">
                          <div className="pdf-subfield-group-label">
                            <span
                              className={`creative-theme-icon tiny ${parentMeta.tone}`}
                            >
                              <ParentIcon size={14} strokeWidth={2.2} />
                            </span>
                            <span>
                              {(fieldObj?.name || "FIELD").toUpperCase()}
                            </span>
                            <span className="subfield-group-tag-pill">
                              {parentMeta.shortTag}
                            </span>
                          </div>
                          <span className="choice-rank-pill subtle">
                            {CHOICE_LABELS[idx] || `Field ${idx + 1}`}
                          </span>
                        </div>

                        <div className="pdf-interest-cards-grid">
                          {fieldSubs.map((sub) => {
                            const sId = String(sub._id);
                            const isSelected = selectedSubfields.includes(sId);
                            const subMeta = getSubfieldMeta(
                              sub,
                              fieldObj?.name || ""
                            );
                            const SubIcon = subMeta.Icon;

                            return (
                              <div
                                key={sId}
                                className={`pdf-selectable-card creative-field-card ${
                                  isSelected ? "selected" : ""
                                }`}
                                onClick={() => toggleSubfield(sId)}
                                role="button"
                                tabIndex={0}
                              >
                                <div className="creative-card-row">
                                  <span
                                    className={`creative-theme-icon ${subMeta.tone}`}
                                    aria-hidden="true"
                                  >
                                    <SubIcon size={19} strokeWidth={2.1} />
                                  </span>
                                  <div className="creative-field-info">
                                    <h3>{sub.name}</h3>
                                    <span className="creative-short-tag">
                                      {subMeta.shortTag}
                                    </span>
                                  </div>
                                  <span
                                    className={`creative-check-circle ${
                                      isSelected ? "selected" : ""
                                    }`}
                                  >
                                    <Check size={14} strokeWidth={2.8} />
                                  </span>
                                </div>
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

            {/* ================= STEP 3: INTERESTS & PRACTICAL ACTIVITIES ================= */}
            {currentStep === 3 && (
              <div className="pdf-step-section">
                {/* 1. Core Interests */}
                <div className="pdf-step-subhead creative-section-head">
                  <div>
                    <h2>What subjects or areas interest you?</h2>
                    <p>
                      Select up to {MAX_INTERESTS} core themes that attract you.
                    </p>
                  </div>
                  <span className="selection-counter-pill">
                    {selectedInterests.length} of {MAX_INTERESTS} selected
                  </span>
                </div>

                <div className="pdf-interest-cards-grid">
                  {WORK_INTERESTS_OPTIONS.map((item) => {
                    const isSelected = selectedInterests.includes(item.id);
                    const ItemIcon = item.Icon;
                    return (
                      <div
                        key={item.id}
                        className={`pdf-selectable-card creative-field-card ${
                          isSelected ? "selected" : ""
                        }`}
                        onClick={() => toggleInterest(item.id)}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="creative-card-row">
                          <span
                            className={`creative-theme-icon ${item.tone}`}
                            aria-hidden="true"
                          >
                            <ItemIcon size={19} strokeWidth={2.1} />
                          </span>
                          <div className="creative-field-info">
                            <h3>{item.label}</h3>
                            <span className="creative-short-tag">
                              {item.shortTag}
                            </span>
                          </div>
                          <span
                            className={`creative-check-circle ${
                              isSelected ? "selected" : ""
                            }`}
                          >
                            <Check size={14} strokeWidth={2.8} />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 2. Day-to-Day Work Activities (Theme Icons, No Emojis) */}
                <div className="pdf-step-subhead creative-section-head mt-8">
                  <div>
                    <h2>What kind of work do you enjoy?</h2>
                    <p>
                      Select up to {MAX_ACTIVITIES} practical day-to-day
                      activities you would enjoy doing.
                    </p>
                  </div>
                  <span className="selection-counter-pill">
                    {selectedPreferences.length} of {MAX_ACTIVITIES} selected
                  </span>
                </div>

                <div className="pdf-activities-grid">
                  {WORK_ACTIVITIES_OPTIONS.map((activity) => {
                    const isSelected = selectedPreferences.includes(
                      activity.id
                    );
                    const ActIcon = activity.Icon;
                    return (
                      <div
                        key={activity.id}
                        className={`pdf-selectable-card creative-activity-card ${
                          isSelected ? "selected" : ""
                        }`}
                        onClick={() => togglePreference(activity.id)}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="creative-card-row align-start">
                          <span
                            className={`creative-theme-icon ${activity.tone}`}
                            aria-hidden="true"
                          >
                            <ActIcon size={19} strokeWidth={2.1} />
                          </span>
                          <div className="creative-field-info">
                            <h3>{activity.title}</h3>
                            <p className="creative-activity-desc">
                              {activity.example}
                            </p>
                          </div>
                          <span
                            className={`creative-check-circle ${
                              isSelected ? "selected" : ""
                            }`}
                          >
                            <Check size={14} strokeWidth={2.8} />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 3. Practical Problem-Solving Approach */}
                <div className="pdf-step-subhead creative-section-head mt-8">
                  <div>
                    <h2>How do you prefer to solve a real-world problem?</h2>
                    <p>
                      Pick up to {MAX_STYLES} practical approaches that feel
                      most natural to you when tackling a project.
                    </p>
                  </div>
                  <span className="selection-counter-pill">
                    {selectedStyles.length} of {MAX_STYLES} selected
                  </span>
                </div>

                <div className="pdf-activities-grid">
                  {PRACTICAL_PROBLEM_STYLES.map((styleItem) => {
                    const isSelected = selectedStyles.includes(styleItem.id);
                    const StyleIcon = styleItem.Icon;
                    return (
                      <div
                        key={styleItem.id}
                        className={`pdf-selectable-card creative-activity-card ${
                          isSelected ? "selected" : ""
                        }`}
                        onClick={() => toggleStyle(styleItem.id)}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="creative-card-row align-start">
                          <span
                            className={`creative-theme-icon ${styleItem.tone}`}
                            aria-hidden="true"
                          >
                            <StyleIcon size={19} strokeWidth={2.1} />
                          </span>
                          <div className="creative-field-info">
                            <h3>{styleItem.title}</h3>
                            <p className="creative-activity-desc">
                              {styleItem.description}
                            </p>
                          </div>
                          <span
                            className={`creative-check-circle ${
                              isSelected ? "selected" : ""
                            }`}
                          >
                            <Check size={14} strokeWidth={2.8} />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 4. Practical Career Priorities */}
                <div className="pdf-step-subhead creative-section-head mt-8">
                  <div>
                    <h2>
                      What practical factors matter most to you in a career?
                    </h2>
                    <p>
                      Pick up to {MAX_PRIORITIES} outcomes that are most
                      important for your career direction.
                    </p>
                  </div>
                  <span className="selection-counter-pill">
                    {selectedPriorities.length} of {MAX_PRIORITIES} selected
                  </span>
                </div>

                <div className="pdf-activities-grid">
                  {PRACTICAL_CAREER_PRIORITIES.map((priorityItem) => {
                    const isSelected = selectedPriorities.includes(
                      priorityItem.id
                    );
                    const PrioIcon = priorityItem.Icon;
                    return (
                      <div
                        key={priorityItem.id}
                        className={`pdf-selectable-card creative-activity-card ${
                          isSelected ? "selected" : ""
                        }`}
                        onClick={() => togglePriority(priorityItem.id)}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="creative-card-row align-start">
                          <span
                            className={`creative-theme-icon ${priorityItem.tone}`}
                            aria-hidden="true"
                          >
                            <PrioIcon size={19} strokeWidth={2.1} />
                          </span>
                          <div className="creative-field-info">
                            <h3>{priorityItem.title}</h3>
                            <p className="creative-activity-desc">
                              {priorityItem.description}
                            </p>
                          </div>
                          <span
                            className={`creative-check-circle ${
                              isSelected ? "selected" : ""
                            }`}
                          >
                            <Check size={14} strokeWidth={2.8} />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Live Practical Profile Summary Box */}
                {(selectedInterests.length > 0 ||
                  selectedPreferences.length > 0 ||
                  selectedStyles.length > 0 ||
                  selectedPriorities.length > 0) && (
                  <div className="assessment-practical-summary-card mt-8">
                    <div className="assessment-summary-header">
                      <strong>Your Practical Interest Snapshot</strong>
                      <span>
                        Used to rank careers by field (40%), specialisation
                        (30%), interests (20%), and practical activities (10%)
                      </span>
                    </div>
                    <div className="assessment-summary-grid">
                      <div>
                        <span className="summary-label">Selected Fields</span>
                        <p>
                          {selectedFieldNames.length > 0
                            ? selectedFieldNames.join(", ")
                            : "None selected"}
                        </p>
                      </div>
                      <div>
                        <span className="summary-label">Core Interests</span>
                        <p>
                          {selectedInterests.length > 0
                            ? selectedInterests.join(", ")
                            : "Select at least 1 above"}
                        </p>
                      </div>
                      <div>
                        <span className="summary-label">
                          Preferred Work &amp; Problem Style
                        </span>
                        <p>
                          {[
                            ...selectedPreferences,
                            ...selectedStyles.map((s) =>
                              s.replace(/^Style:/, "")
                            ),
                          ].join(", ") || "Select at least 1 activity above"}
                        </p>
                      </div>
                      {selectedPriorities.length > 0 && (
                        <div>
                          <span className="summary-label">
                            Career Priorities
                          </span>
                          <p>
                            {selectedPriorities
                              .map((p) => p.replace(/^Priority:/, ""))
                              .join(", ")}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
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
                  <span>Continue</span>
                  <ArrowRight size={15} />
                </button>
              ) : (
                <button
                  type="button"
                  className="pdf-explore-btn large"
                  onClick={handleSubmitAssessment}
                  disabled={submitting}
                >
                  <span>
                    {submitting ? "Saving..." : "Save and see my matches"}
                  </span>
                  <ArrowRight size={15} />
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
