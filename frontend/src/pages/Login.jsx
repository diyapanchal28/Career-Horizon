import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import Navbar from "../components/Navbar";
import { AlertCircle, Loader2, Lock, ArrowLeft } from "lucide-react";

const API_URL = "http://localhost:5000/api";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const loginMode = searchParams.get("role") === "admin" ? "admin" : "student";

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    sessionStorage.removeItem("authGateMessage");
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email.trim() || !form.password.trim()) {
      setError("Please enter both your email address and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Invalid credentials. Please verify your email and password."
        );
      }

      login(data.token, data.user);
      sessionStorage.removeItem("authGateMessage");

      // Redirect admin users or Admin Login mode directly to /admin
      if (data.user?.role === "admin" || loginMode === "admin") {
        sessionStorage.removeItem("returnAfterLogin");
        navigate("/admin");
        return;
      }

      // Check for return path or onboarding flow
      const returnTo = sessionStorage.getItem("returnAfterLogin");
      if (returnTo) {
        sessionStorage.removeItem("returnAfterLogin");
        navigate(returnTo);
      } else if (!data.user?.assessmentCompleted) {
        navigate("/profile?onboarding=1");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);
      if (
        err.message.includes("Failed to fetch") ||
        err.message.includes("NetworkError")
      ) {
        setError(
          "Unable to connect to the server. Please check your internet connection and make sure backend is running."
        );
      } else {
        setError(
          err.message ||
            "Login failed. Please check your credentials and try again."
        );
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
            <h1>{loginMode === "admin" ? "Administrator Sign In" : "Student Sign In"}</h1>
            <p>
              {loginMode === "admin"
                ? "Sign in to manage career pathways, industry fields, roadmaps and users."
                : "Sign in to see your matches, saved careers and roadmap progress."}
            </p>
          </div>

          {error && (
            <div className="auth-error-banner" role="alert">
              <AlertCircle size={18} className="error-icon" />
              <div className="error-text">
                <strong>Sign in error</strong>
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
            <form className="pdf-auth-form" onSubmit={handleSubmit} autoComplete="off">
              <div className="pdf-form-field">
                <label htmlFor="email">
                  {loginMode === "admin" ? "Admin Email" : "Email"}
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder={loginMode === "admin" ? "admin@careerhorizon.com" : "Enter your email"}
                  autoComplete="off"
                  required
                />
              </div>

              <div className="pdf-form-field">
                <label htmlFor="password">Password</label>
                <div className="pdf-input-with-icon">
                  <Lock size={16} className="pdf-input-icon" aria-hidden="true" />
                  <input
                    id="password"
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="pdf-auth-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="spinner-icon" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>
                    {loginMode === "admin" ? "Sign in as Admin" : "Sign in as Student"}
                  </span>
                )}
              </button>
            </form>
          </div>

          {loginMode === "admin" ? (
            <p className="pdf-auth-switch">
              Are you a student?{" "}
              <Link to="/login?role=student" className="pdf-auth-switch-link">
                Student Sign In
              </Link>
            </p>
          ) : (
            <p className="pdf-auth-switch">
              New to Career Horizon?{" "}
              <Link to="/register" className="pdf-auth-switch-link">
                Create a free account
              </Link>
            </p>
          )}
        </div>
      </main>
    </div>
  );
}