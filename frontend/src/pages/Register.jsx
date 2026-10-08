import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import Navbar from "../components/Navbar";
import { AlertCircle, Loader2, Lock } from "lucide-react";

const API_URL = "http://localhost:5000/api";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
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

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.password.trim() ||
      !form.confirmPassword.trim()
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
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
          <div className="pdf-auth-heading">
            <h1>Create your free account</h1>
            <p>
              Save careers, get personalised matches and track your roadmap
              progress.
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
            <form className="pdf-auth-form" onSubmit={handleSubmit}>
              <div className="pdf-form-field">
                <label htmlFor="name">Full name</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Kavya"
                  autoComplete="name"
                  required
                />
              </div>

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
                  autoComplete="new-password"
                  required
                />
                <span className="pdf-field-hint">At least 6 characters</span>
              </div>

              <div className="pdf-form-field">
                <label htmlFor="confirmPassword">Confirm password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••••"
                  autoComplete="new-password"
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