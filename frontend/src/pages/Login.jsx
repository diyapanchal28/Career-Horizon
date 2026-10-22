import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import Navbar from "../components/Navbar";
import {
  AlertCircle,
  Loader2,
  Lock,
  ArrowLeft,
  Mail,
  KeyRound,
  CheckCircle2,
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
};

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const loginMode = searchParams.get("role") === "admin" ? "admin" : "student";

  // View mode: "login" or "forgot"
  const [view, setView] = useState("login");

  // Login form state
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Forgot password form state
  const [forgotStep, setForgotStep] = useState(1); // 1 = Enter Email, 2 = Enter OTP & New Password
  const [forgotForm, setForgotForm] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [forgotErrors, setForgotErrors] = useState({});
  const [forgotTouched, setForgotTouched] = useState({});
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");
  const [devOtpNotice, setDevOtpNotice] = useState("");

  useEffect(() => {
    sessionStorage.removeItem("authGateMessage");
  }, []);

  // When changing login mode via URL param, return to login view
  useEffect(() => {
    setView("login");
    setError("");
    setErrors({});
    setTouched({});
  }, [loginMode]);

  /* ----------------- LOGIN VALIDATION ----------------- */
  const validateLoginField = (name, value) => {
    let msg = "";
    if (name === "email") {
      if (!value.trim()) {
        msg = "Email address is required.";
      } else if (!isValidEmail(value)) {
        msg = "Please enter a valid email address (e.g., student@example.com).";
      }
    } else if (name === "password") {
      if (!value) {
        msg = "Password is required.";
      } else if (value.length < 6) {
        msg = "Password must be at least 6 characters.";
      }
    }
    return msg;
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");

    if (touched[name]) {
      const fieldError = validateLoginField(name, value);
      setErrors((prev) => ({ ...prev, [name]: fieldError }));
    }
  };

  const handleLoginBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const fieldError = validateLoginField(name, value);
    setErrors((prev) => ({ ...prev, [name]: fieldError }));
  };

  const validateLoginForm = () => {
    const newErrors = {
      email: validateLoginField("email", form.email),
      password: validateLoginField("password", form.password),
    };
    setErrors(newErrors);
    setTouched({ email: true, password: true });
    return !newErrors.email && !newErrors.password;
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateLoginForm()) {
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

  /* ----------------- FORGOT PASSWORD VALIDATION & ACTIONS ----------------- */
  const validateForgotField = (name, value, allValues = forgotForm) => {
    let msg = "";
    if (name === "email") {
      if (!value.trim()) {
        msg = "Registered email is required.";
      } else if (!isValidEmail(value)) {
        msg = "Please enter a valid email address.";
      }
    } else if (name === "otp") {
      if (!value.trim()) {
        msg = "6-digit verification code is required.";
      } else if (!/^\d{6}$/.test(value.trim())) {
        msg = "Verification code must be exactly 6 digits.";
      }
    } else if (name === "newPassword") {
      if (!value) {
        msg = "New password is required.";
      } else if (value.length < 6) {
        msg = "Password must be at least 6 characters long.";
      }
    } else if (name === "confirmNewPassword") {
      if (!value) {
        msg = "Please confirm your new password.";
      } else if (value !== allValues.newPassword) {
        msg = "Passwords do not match.";
      }
    }
    return msg;
  };

  const handleForgotChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...forgotForm, [name]: value };
    setForgotForm(updated);
    if (forgotError) setForgotError("");

    if (forgotTouched[name]) {
      const fieldError = validateForgotField(name, value, updated);
      setForgotErrors((prev) => ({ ...prev, [name]: fieldError }));
    }
  };

  const handleForgotBlur = (e) => {
    const { name, value } = e.target;
    setForgotTouched((prev) => ({ ...prev, [name]: true }));
    const fieldError = validateForgotField(name, value, forgotForm);
    setForgotErrors((prev) => ({ ...prev, [name]: fieldError }));
  };

  // Step 1: Request OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setForgotError("");
    setForgotSuccess("");
    setDevOtpNotice("");

    const emailErr = validateForgotField("email", forgotForm.email);
    if (emailErr) {
      setForgotErrors({ email: emailErr });
      setForgotTouched({ email: true });
      return;
    }

    try {
      setForgotLoading(true);

      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotForm.email.trim() }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data.message || "Failed to process password reset request."
        );
      }

      setForgotSuccess(
        data.message || "A 6-digit verification code has been sent to your email."
      );

      // If dev OTP returned (when SMTP is not configured in .env)
      if (data.devOtp) {
        setDevOtpNotice(
          `Demo Notice: SMTP not configured in .env. Your reset code is: ${data.devOtp}`
        );
      }

      setForgotStep(2);
    } catch (err) {
      setForgotError(
        err.message || "Unable to send reset code. Please check your email."
      );
    } finally {
      setForgotLoading(false);
    }
  };

  // Step 2: Reset Password
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setForgotError("");
    setForgotSuccess("");

    const newErrors = {
      otp: validateForgotField("otp", forgotForm.otp),
      newPassword: validateForgotField("newPassword", forgotForm.newPassword),
      confirmNewPassword: validateForgotField(
        "confirmNewPassword",
        forgotForm.confirmNewPassword,
        forgotForm
      ),
    };

    setForgotErrors(newErrors);
    setForgotTouched({
      otp: true,
      newPassword: true,
      confirmNewPassword: true,
    });

    if (
      newErrors.otp ||
      newErrors.newPassword ||
      newErrors.confirmNewPassword
    ) {
      return;
    }

    try {
      setForgotLoading(true);

      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotForm.email.trim(),
          otp: forgotForm.otp.trim(),
          newPassword: forgotForm.newPassword,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Failed to reset password.");
      }

      // Success! Pre-fill the email on the login form and switch back
      setForm((prev) => ({ ...prev, email: forgotForm.email.trim() }));
      setForgotSuccess(
        "Password reset successfully! You can now sign in with your new password."
      );

      setTimeout(() => {
        setView("login");
        setForgotStep(1);
        setForgotForm({
          email: "",
          otp: "",
          newPassword: "",
          confirmNewPassword: "",
        });
        setForgotSuccess("");
      }, 2000);
    } catch (err) {
      setForgotError(
        err.message || "Unable to reset password. Please try again."
      );
    } finally {
      setForgotLoading(false);
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
              onClick={() => {
                if (view === "forgot") {
                  setView("login");
                  setForgotStep(1);
                  setForgotError("");
                } else {
                  navigate(-1);
                }
              }}
              className="pdf-back-btn"
              title="Go back"
            >
              <ArrowLeft size={15} />
              <span>{view === "forgot" ? "Back to Sign In" : "Back"}</span>
            </button>
          </div>

          {/* ================= LOGIN VIEW ================= */}
          {view === "login" && (
            <>
              <div className="pdf-auth-heading">
                <h1>
                  {loginMode === "admin"
                    ? "Administrator Sign In"
                    : "Student Sign In"}
                </h1>
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

              {forgotSuccess && (
                <div className="pdf-auth-alert-success" role="status">
                  <CheckCircle2 size={18} />
                  <span>{forgotSuccess}</span>
                </div>
              )}

              <div className="pdf-auth-card">
                <form
                  className="pdf-auth-form"
                  onSubmit={handleLoginSubmit}
                  noValidate
                  autoComplete="off"
                >
                  <div className="pdf-form-field">
                    <label htmlFor="email">
                      {loginMode === "admin" ? "Admin Email" : "Email"}{" "}
                      <span className="required-star">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleLoginChange}
                      onBlur={handleLoginBlur}
                      placeholder={
                        loginMode === "admin"
                          ? "admin@careerhorizon.com"
                          : "Enter your email"
                      }
                      className={
                        touched.email && errors.email ? "pdf-input-invalid" : ""
                      }
                      autoComplete="off"
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
                        onChange={handleLoginChange}
                        onBlur={handleLoginBlur}
                        placeholder="Enter your password"
                        autoComplete="new-password"
                        required
                      />
                    </div>
                    {touched.password && errors.password && (
                      <span className="pdf-field-error">
                        <AlertCircle size={13} /> {errors.password}
                      </span>
                    )}
                  </div>

                  {loginMode !== "admin" && (
                    <div className="pdf-forgot-password-row">
                      <button
                        type="button"
                        className="pdf-forgot-password-link"
                        onClick={() => {
                          setView("forgot");
                          setForgotStep(1);
                          setForgotError("");
                          setForgotSuccess("");
                          setForgotForm((prev) => ({
                            ...prev,
                            email: form.email,
                          }));
                        }}
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}

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
                        {loginMode === "admin"
                          ? "Sign in as Admin"
                          : "Sign in as Student"}
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
            </>
          )}

          {/* ================= FORGOT PASSWORD VIEW (STUDENT) ================= */}
          {view === "forgot" && (
            <>
              <div className="pdf-auth-heading">
                <h1>Reset your password</h1>
                <p>
                  {forgotStep === 1
                    ? "Enter your registered email address to receive a 6-digit password reset code."
                    : `Enter the 6-digit code sent to ${forgotForm.email} and your new password.`}
                </p>
              </div>

              {forgotError && (
                <div className="auth-error-banner" role="alert">
                  <AlertCircle size={18} className="error-icon" />
                  <div className="error-text">
                    <strong>Reset error</strong>
                    <span>{forgotError}</span>
                  </div>
                  <button
                    type="button"
                    className="error-dismiss"
                    onClick={() => setForgotError("")}
                    aria-label="Dismiss error"
                  >
                    ×
                  </button>
                </div>
              )}

              {forgotSuccess && (
                <div className="pdf-auth-alert-success" role="status">
                  <CheckCircle2 size={18} />
                  <span>{forgotSuccess}</span>
                </div>
              )}

              {devOtpNotice && (
                <div className="pdf-auth-alert-info" role="status">
                  <KeyRound size={18} />
                  <span>{devOtpNotice}</span>
                </div>
              )}

              <div className="pdf-auth-card">
                {forgotStep === 1 ? (
                  /* Step 1: Request OTP Form */
                  <form
                    className="pdf-auth-form"
                    onSubmit={handleRequestOtp}
                    noValidate
                  >
                    <div className="pdf-form-field">
                      <label htmlFor="forgotEmail">
                        Registered Email <span className="required-star">*</span>
                      </label>
                      <input
                        id="forgotEmail"
                        type="email"
                        name="email"
                        value={forgotForm.email}
                        onChange={handleForgotChange}
                        onBlur={handleForgotBlur}
                        placeholder="Enter your student email"
                        className={
                          forgotTouched.email && forgotErrors.email
                            ? "pdf-input-invalid"
                            : ""
                        }
                        autoComplete="off"
                        required
                      />
                      {forgotTouched.email && forgotErrors.email && (
                        <span className="pdf-field-error">
                          <AlertCircle size={13} /> {forgotErrors.email}
                        </span>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="pdf-auth-submit-btn"
                      disabled={forgotLoading}
                    >
                      {forgotLoading ? (
                        <>
                          <Loader2 size={18} className="spinner-icon" />
                          <span>Sending reset code...</span>
                        </>
                      ) : (
                        <span>Send Reset Code</span>
                      )}
                    </button>

                    <div className="pdf-auth-sub-actions">
                      <button
                        type="button"
                        className="pdf-forgot-password-link"
                        onClick={() => setView("login")}
                      >
                        Remember password? Sign in
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Step 2: Enter OTP & New Password Form */
                  <form
                    className="pdf-auth-form"
                    onSubmit={handleResetPasswordSubmit}
                    noValidate
                  >
                    <div className="pdf-form-field">
                      <label htmlFor="otp">
                        6-Digit Verification Code{" "}
                        <span className="required-star">*</span>
                      </label>
                      <div
                        className={`pdf-input-with-icon ${
                          forgotTouched.otp && forgotErrors.otp
                            ? "pdf-input-invalid"
                            : ""
                        }`}
                      >
                        <KeyRound
                          size={16}
                          className="pdf-input-icon"
                          aria-hidden="true"
                        />
                        <input
                          id="otp"
                          type="text"
                          name="otp"
                          maxLength={6}
                          value={forgotForm.otp}
                          onChange={handleForgotChange}
                          onBlur={handleForgotBlur}
                          placeholder="e.g. 123456"
                          autoComplete="one-time-code"
                          required
                        />
                      </div>
                      {forgotTouched.otp && forgotErrors.otp && (
                        <span className="pdf-field-error">
                          <AlertCircle size={13} /> {forgotErrors.otp}
                        </span>
                      )}
                    </div>

                    <div className="pdf-form-field">
                      <label htmlFor="newPassword">
                        New Password <span className="required-star">*</span>
                      </label>
                      <div
                        className={`pdf-input-with-icon ${
                          forgotTouched.newPassword && forgotErrors.newPassword
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
                          id="newPassword"
                          type="password"
                          name="newPassword"
                          value={forgotForm.newPassword}
                          onChange={handleForgotChange}
                          onBlur={handleForgotBlur}
                          placeholder="At least 6 characters"
                          autoComplete="new-password"
                          required
                        />
                      </div>
                      {forgotTouched.newPassword &&
                        forgotErrors.newPassword && (
                          <span className="pdf-field-error">
                            <AlertCircle size={13} />{" "}
                            {forgotErrors.newPassword}
                          </span>
                        )}
                    </div>

                    <div className="pdf-form-field">
                      <label htmlFor="confirmNewPassword">
                        Confirm New Password{" "}
                        <span className="required-star">*</span>
                      </label>
                      <div
                        className={`pdf-input-with-icon ${
                          forgotTouched.confirmNewPassword &&
                          forgotErrors.confirmNewPassword
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
                          id="confirmNewPassword"
                          type="password"
                          name="confirmNewPassword"
                          value={forgotForm.confirmNewPassword}
                          onChange={handleForgotChange}
                          onBlur={handleForgotBlur}
                          placeholder="Re-enter your new password"
                          autoComplete="new-password"
                          required
                        />
                      </div>
                      {forgotTouched.confirmNewPassword &&
                        forgotErrors.confirmNewPassword && (
                          <span className="pdf-field-error">
                            <AlertCircle size={13} />{" "}
                            {forgotErrors.confirmNewPassword}
                          </span>
                        )}
                    </div>

                    <button
                      type="submit"
                      className="pdf-auth-submit-btn"
                      disabled={forgotLoading}
                    >
                      {forgotLoading ? (
                        <>
                          <Loader2 size={18} className="spinner-icon" />
                          <span>Resetting password...</span>
                        </>
                      ) : (
                        <span>Reset Password</span>
                      )}
                    </button>

                    <div className="pdf-auth-sub-actions">
                      <button
                        type="button"
                        className="pdf-forgot-password-link"
                        onClick={() => {
                          setForgotStep(1);
                          setForgotError("");
                        }}
                      >
                        Change email / Resend code
                      </button>

                      <button
                        type="button"
                        className="pdf-forgot-password-link"
                        onClick={() => setView("login")}
                      >
                        Return to Sign In
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
