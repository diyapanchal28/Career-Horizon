import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import Navbar from "../components/Navbar";
import { AlertCircle, Loader2, Lock, ArrowLeft, User, Mail } from "lucide-react";

const API_URL = "http://localhost:5000/api";

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
};

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    sessionStorage.removeItem("authGateMessage");
  }, []);

  const validateField = (name, value, allValues = form) => {
    let msg = "";
    if (name === "name") {
      if (!value.trim()) {
        msg = "Full name is required.";
      } else if (value.trim().length < 2) {
        msg = "Full name must be at least 2 characters.";
      }
    } else if (name === "email") {
      if (!value.trim()) {
        msg = "Email address is required.";
      } else if (!isValidEmail(value)) {
        msg = "Please enter a valid email address (e.g., student@example.com).";
      }
    } else if (name === "password") {
      if (!value) {
        msg = "Password is required.";
      } else if (value.length < 6) {
        msg = "Password must be at least 6 characters long.";
      }
    } else if (name === "confirmPassword") {
      if (!value) {
        msg = "Please confirm your password.";
      } else if (value !== allValues.password) {
        msg = "Passwords do not match. Please re-enter.";
      }
    }
    return msg;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };
    setForm(updated);
    if (error) setError("");

    if (touched[name]) {
      const fieldError = validateField(name, value, updated);
      setErrors((prev) => ({ ...prev, [name]: fieldError }));
    }

    // If typing password and confirmPassword was already touched, re-validate confirmPassword
    if (name === "password" && touched.confirmPassword) {
      const confirmErr = validateField(
        "confirmPassword",
        form.confirmPassword,
        updated
      );
      setErrors((prev) => ({ ...prev, confirmPassword: confirmErr }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const fieldError = validateField(name, value, form);
    setErrors((prev) => ({ ...prev, [name]: fieldError }));
  };

  const validateAll = () => {
    const newErrors = {
      name: validateField("name", form.name),
      email: validateField("email", form.email),
      password: validateField("password", form.password),
      confirmPassword: validateField(
        "confirmPassword",
        form.confirmPassword,
        form
      ),
    };

    setErrors(newErrors);
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    return !Object.values(newErrors).some((msg) => Boolean(msg));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateAll()) {
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Unable to complete registration. Please try again."
        );
      }

      sessionStorage.removeItem("authGateMessage");

      // Automatically log in the newly registered user and start Step 1 of 2 (Profile -> Interests)
      if (data.token) {
        login(data.token, data.user);
        navigate("/profile?onboarding=1");
        return;
      }

      // Fallback if token was not returned
      const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
        }),
      });
      if (loginRes.ok) {
        const loginData = await loginRes.json();
        login(loginData.token, loginData.user);
        navigate("/profile?onboarding=1");
      } else {
        navigate("/login");
      }
    } catch (err) {
      console.error("Registration error:", err);
      if (
        err.message.includes("Failed to fetch") ||
        err.message.includes("NetworkError")
      ) {
        setError(
          "Unable to connect to the server. Please check backend connection."
        );
      } else {
        setError(err.message || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pdf-auth-page-shell">
      <Navbar />

      <main className="pdf-auth-main">
        <div className="pdf-auth-container">
          <div className="pdf-page-back-row auth-back-row">
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

          <div className="pdf-auth-heading">
            <h1>Create your free account</h1>
            <p>
              Save careers, get personalised matches and track your roadmap
              progress.
            </p>
          </div>

          {error && (
            <div className="auth-error-banner" role="alert">
              <AlertCircle size={18} className="error-icon" />
              <div className="error-text">
                <strong>Registration error</strong>
                <span>{error}</span>
              </div>
              <button
                type="button"
                className="error-dismiss"
                onClick={() => setError("")}
                aria-label="Dismiss error"
              >
                ×
              </button>
            </div>
          )}

          <div className="pdf-auth-card">
            <form
              className="pdf-auth-form"
              onSubmit={handleSubmit}
              noValidate
              autoComplete="off"
            >
              <div className="pdf-form-field">
                <label htmlFor="name">
                  Full name <span className="required-star">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter your full name"
                  className={
                    touched.name && errors.name ? "pdf-input-invalid" : ""
                  }
                  autoComplete="name"
                  required
                />
                {touched.name && errors.name && (
                  <span className="pdf-field-error">
                    <AlertCircle size={13} /> {errors.name}
                  </span>
                )}
              </div>

              <div className="pdf-form-field">
                <label htmlFor="email">
                  Email <span className="required-star">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter your email"
                  className={
                    touched.email && errors.email ? "pdf-input-invalid" : ""
                  }
                  autoComplete="email"
                  required
                />
                {touched.email && errors.email && (
                  <span className="pdf-field-error">
                    <AlertCircle size={13} /> {errors.email}
                  </span>
                )}
              </div>

              <div className="pdf-form-field">
                <label htmlFor="password">
                  Password <span className="required-star">*</span>
                </label>
                <div
                  className={`pdf-input-with-icon ${
                    touched.password && errors.password
                      ? "pdf-input-invalid"
                      : ""
                  }`}
                >
                  <Lock
                    size={16}
                    className="pdf-input-icon"
                    aria-hidden="true"
                  />
                  <input
                    id="password"
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter password (min 6 characters)"
                    autoComplete="new-password"
                    required
                  />
                </div>
                {touched.password && errors.password ? (
                  <span className="pdf-field-error">
                    <AlertCircle size={13} /> {errors.password}
                  </span>
                ) : (
                  <span className="pdf-field-hint">At least 6 characters</span>
                )}
              </div>

              <div className="pdf-form-field">
                <label htmlFor="confirmPassword">
                  Confirm password <span className="required-star">*</span>
                </label>
                <div
                  className={`pdf-input-with-icon ${
                    touched.confirmPassword && errors.confirmPassword
                      ? "pdf-input-invalid"
                      : ""
                  }`}
                >
                  <Lock
                    size={16}
                    className="pdf-input-icon"
                    aria-hidden="true"
                  />
                  <input
                    id="confirmPassword"
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Re-enter password"
                    autoComplete="new-password"
                    required
                  />
                </div>
                {touched.confirmPassword && errors.confirmPassword && (
                  <span className="pdf-field-error">
                    <AlertCircle size={13} /> {errors.confirmPassword}
                  </span>
                )}
              </div>

              <button
                type="submit"
                className="pdf-auth-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="spinner-icon" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <span>Create account</span>
                )}
              </button>
            </form>
          </div>

          <p className="pdf-auth-switch">
            Already registered?{" "}
            <Link to="/login" className="pdf-auth-switch-link">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
