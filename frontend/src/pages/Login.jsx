import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import Navbar from "../components/Navbar";
import { AlertCircle, Loader2, Lock } from "lucide-react";

const API_URL = "http://localhost:5000/api";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [gateNotice] = useState(
    () => sessionStorage.getItem("authGateMessage") || ""
  );

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
          <div className="pdf-auth-heading">
            <h1>Welcome back</h1>
            <p>
              Sign in to see your matches, saved careers and roadmap progress.
            </p>
          </div>

          {gateNotice && (
            <div className="pdf-auth-gate-notice">
              <Lock size={16} />
              <span>{gateNotice}</span>
            </div>
          )}

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
            <form className="pdf-auth-form" onSubmit={handleSubmit}>
              <div className="pdf-form-field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="kavya123@gmail.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="pdf-form-field">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••••"
                  autoComplete="current-password"
                  required
                />
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
                  <span>Sign in</span>
                )}
              </button>
            </form>
          </div>

          <p className="pdf-auth-switch">
            New to Career Horizon?{" "}
            <Link to="/register" className="pdf-auth-switch-link">
              Create a free account
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}