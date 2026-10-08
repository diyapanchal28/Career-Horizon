import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import {
  Compass,
  Bookmark,
  LogOut,
  User as UserIcon,
  Menu,
  X,
  Sparkles,
  Layers,
  LayoutDashboard,
  Shield,
  HelpCircle,
  Bell,
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

export default function Navbar() {
  const { isAuthenticated, user, token, logout, savedCareerIds } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Notifications dropdown state
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notifRef = useRef(null);

  const savedCount = savedCareerIds ? savedCareerIds.size : 0;
  const isAdmin = user?.role === "admin";
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Fetch notifications when signed in
  useEffect(() => {
    let ignore = false;
    async function loadNotifs() {
      const authToken = token || localStorage.getItem("token");
      if (!isAuthenticated || !authToken) {
        setNotifications([]);
        return;
      }
      try {
        const res = await fetch(`${API_URL}/notifications`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (res.ok && !ignore) {
          const data = await res.json();
          setNotifications(Array.isArray(data) ? data : []);
        }
      } catch {
        // Silent fallback
      }
    }
    loadNotifs();
    return () => {
      ignore = true;
    };
  }, [isAuthenticated, token, location.pathname]);

  // Close notification dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      const authToken = token || localStorage.getItem("token");
      await fetch(`${API_URL}/notifications/read-all`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Failed to mark notifications read:", err);
    }
  };

  const handleSignOut = () => {
    logout();
    setMobileMenuOpen(false);
    setNotifOpen(false);
    navigate("/");
  };

  return (
    <header className="navbar">
      <div className="nav-container">
        {/* Brand Logo */}
        <Link
          to={isAuthenticated ? "/dashboard" : "/"}
          className="brand"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div className="brand-icon">
            <span className="brand-letter">C</span>
          </div>
          <span className="brand-title-text">Career Horizon</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="nav-links">
          {isAuthenticated ? (
            /* Authenticated Links (Matches PDF Pages 3–8) */
            <>
              <Link
                to="/dashboard"
                className={location.pathname === "/dashboard" ? "nav-link active" : "nav-link"}
              >
                <span>Dashboard</span>
              </Link>
              <Link
                to="/careers"
                className={
                  location.pathname.startsWith("/careers") ? "nav-link active" : "nav-link"
                }
              >
                <span>Explore careers</span>
              </Link>
              <Link
                to="/matches"
                className={location.pathname === "/matches" ? "nav-link active" : "nav-link"}
              >
                <span>My matches</span>
              </Link>
              <Link
                to="/saved-careers"
                className={
                  location.pathname === "/saved-careers"
                    ? "nav-link active nav-link-saved"
                    : "nav-link nav-link-saved"
                }
              >
                <span>Saved</span>
                {savedCount > 0 && (
                  <span className="nav-badge" title={`${savedCount} saved careers`}>
                    {savedCount}
                  </span>
                )}
              </Link>
            </>
          ) : (
            /* Public Guest Links (Matches PDF Pages 1, 2, 3, 9) */
            <>
              <Link
                to="/"
                className={location.pathname === "/" ? "nav-link active" : "nav-link"}
              >
                Home
              </Link>
              <Link
                to="/careers"
                className={location.pathname === "/careers" ? "nav-link active" : "nav-link"}
              >
                Explore careers
              </Link>
              <Link
                to="/fields"
                className={location.pathname === "/fields" ? "nav-link active" : "nav-link"}
              >
                Career fields
              </Link>
              <Link
                to="/about"
                className={location.pathname === "/about" ? "nav-link active" : "nav-link"}
              >
                About
              </Link>
            </>
          )}
        </nav>

        {/* Top-Right Action Area */}
        <div className="nav-actions">
          {isAuthenticated ? (
            /* USER IS SIGNED IN */
            <div className="user-profile-bar">
              {isAdmin && (
                <Link
                  to="/admin"
                  className="admin-nav-pill-btn"
                  title="Administrator Panel"
                >
                  <Shield size={14} />
                  <span>Admin</span>
                </Link>
              )}

              {/* Notification Bell Dropdown */}
              <div className="nav-notif-wrapper" ref={notifRef}>
                <button
                  type="button"
                  className="nav-bell-btn"
                  onClick={() => setNotifOpen((prev) => !prev)}
                  title="Notifications"
                  aria-label="Notifications"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="nav-bell-badge">{unreadCount}</span>
                  )}
                </button>

                {notifOpen && (
                  <div className="nav-notif-dropdown">
                    <div className="nav-notif-header">
                      <strong>Notifications</strong>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          className="nav-notif-read-btn"
                          onClick={handleMarkAllRead}
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="nav-notif-body">
                      {notifications.length > 0 ? (
                        notifications.slice(0, 6).map((n, i) => (
                          <div
                            key={n._id || i}
                            className={`nav-notif-item ${n.isRead ? "read" : "unread"}`}
                          >
                            <div className="nav-notif-title">{n.title}</div>
                            <div className="nav-notif-msg">{n.message}</div>
                          </div>
                        ))
                      ) : (
                        <div className="nav-notif-empty">No notifications yet.</div>
                      )}
                    </div>
                    <div className="nav-notif-footer">
                      <Link
                        to="/dashboard"
                        onClick={() => setNotifOpen(false)}
                      >
                        View dashboard
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile Name Pill */}
              <Link
                to="/profile"
                className={
                  location.pathname === "/profile"
                    ? "nav-user-name-pill active"
                    : "nav-user-name-pill"
                }
                title="Your profile"
              >
                <span>{user?.name || "Student"}</span>
              </Link>

              <button
                type="button"
                onClick={handleSignOut}
                className="nav-logout-link-btn"
                title="Log out"
              >
                <span>Log out</span>
              </button>
            </div>
          ) : (
            /* USER IS NOT SIGNED IN */
            <div className="guest-actions">
              <Link to="/login" className="signin-btn">
                Log in
              </Link>
              <Link to="/register" className="get-started-btn">
                <span>Create account</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer">
          <div className="mobile-nav-inner">
            {isAuthenticated ? (
              <>
                <div className="mobile-user-card">
                  <div className="user-avatar-circle large">
                    {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon size={18} />}
                  </div>
                  <div>
                    <strong className="mobile-user-name">{user?.name || "Student"}</strong>
                    <span className="mobile-user-email">{user?.email}</span>
                  </div>
                </div>

                <Link
                  to="/dashboard"
                  className="mobile-nav-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LayoutDashboard size={18} />
                  <span>Dashboard</span>
                </Link>

                <Link
                  to="/careers"
                  className="mobile-nav-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Compass size={18} />
                  <span>Explore careers</span>
                </Link>

                <Link
                  to="/matches"
                  className="mobile-nav-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Sparkles size={18} />
                  <span>My matches</span>
                </Link>

                <Link
                  to="/saved-careers"
                  className="mobile-nav-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Bookmark size={18} />
                  <span>Saved ({savedCount})</span>
                </Link>

                <Link
                  to="/profile"
                  className="mobile-nav-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <UserIcon size={18} />
                  <span>Your profile</span>
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin"
                    className="mobile-nav-link"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Shield size={18} />
                    <span>Admin Panel</span>
                  </Link>
                )}

                <button
                  type="button"
                  className="mobile-signout-btn"
                  onClick={handleSignOut}
                >
                  <LogOut size={16} />
                  <span>Log out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/"
                  className="mobile-nav-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Compass size={18} />
                  <span>Home</span>
                </Link>
                <Link
                  to="/careers"
                  className="mobile-nav-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Sparkles size={18} />
                  <span>Explore careers</span>
                </Link>
                <Link
                  to="/fields"
                  className="mobile-nav-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Layers size={18} />
                  <span>Career fields</span>
                </Link>
                <Link
                  to="/about"
                  className="mobile-nav-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <HelpCircle size={18} />
                  <span>About</span>
                </Link>

                <div className="mobile-guest-buttons">
                  <Link
                    to="/login"
                    className="mobile-signin-btn"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    className="mobile-getstarted-btn"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Create account
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
