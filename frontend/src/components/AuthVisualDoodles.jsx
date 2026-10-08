import { Link } from "react-router-dom";
import {
  Sparkles,
  TrendingUp,
  Award,
  CheckCircle2,
  Compass,
} from "lucide-react";

export default function AuthVisualDoodles({ mode = "login" }) {
  const isLogin = mode === "login";

  return (
    <section className="auth-visual">
      {/* Brand */}
      <Link to="/" className="auth-brand" title="Return to Home">
        <div className="auth-brand-icon">
          <Sparkles size={20} />
        </div>
        <span>Career Horizon</span>
      </Link>

      {/* Main Narrative */}
      <div className="auth-visual-content">
        <div className="auth-visual-badge">
          <Compass size={14} />
          <span>{isLogin ? "Welcome back, explorer" : "Unlock your true potential"}</span>
        </div>

        <h1>
          {isLogin ? (
            <>
              Your career path <br />
              <span>awaits you.</span>
            </>
          ) : (
            <>
              Discover where <br />
              <span>your skills shine.</span>
            </>
          )}
        </h1>

        <p>
          {isLogin
            ? "Pick up right where you left off. Access your saved career paths, milestone roadmaps, and personalized guidance."
            : "Explore 100+ curated career roadmaps, salary insights, and industry demand across technology, business, and healthcare."}
        </p>
      </div>

      {/* Modern Career Doodles & SVG Canvas */}
      <div className="auth-doodles-stage">
        {/* SVG Doodle Elements Layer */}
        <svg
          className="doodle-svg-canvas"
          viewBox="0 0 540 380"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="gradPath" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#c084fc" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="glowDoodle" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f472b6" />
              <stop offset="100%" stopColor="#fbbf24" />
            </linearGradient>
          </defs>

          {/* S-curved Career Roadmap Path */}
          <path
            d="M 40 280 C 130 320, 160 180, 260 210 C 340 230, 390 120, 490 140"
            stroke="url(#gradPath)"
            strokeWidth="3.5"
            strokeDasharray="6 6"
            strokeLinecap="round"
          />

          {/* Milestone Step Nodes */}
          <circle cx="40" cy="280" r="7" fill="#818cf8" stroke="#ffffff" strokeWidth="2.5" />
          <circle cx="160" cy="205" r="7" fill="#c084fc" stroke="#ffffff" strokeWidth="2.5" />
          <circle cx="260" cy="210" r="7" fill="#f472b6" stroke="#ffffff" strokeWidth="2.5" />
          <circle cx="370" cy="155" r="7" fill="#38bdf8" stroke="#ffffff" strokeWidth="2.5" />
          <circle cx="490" cy="140" r="9" fill="#34d399" stroke="#ffffff" strokeWidth="3" />

          {/* Graduation Cap Doodle */}
          <g transform="translate(430, 45) scale(0.9)" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="rgba(255,255,255,0.12)">
            <polygon points="40,10 75,25 40,40 5,25" />
            <path d="M 20 32 L 20 52 C 20 62, 60 62, 60 52 L 60 32" />
            <path d="M 75 25 L 82 45 C 83 48, 80 50, 78 48" />
          </g>

          {/* Lightbulb Innovation Doodle */}
          <g transform="translate(45, 95) scale(0.85)" stroke="#fde047" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="rgba(253, 224, 71, 0.18)">
            <path d="M 30 10 A 18 18 0 0 1 48 28 C 48 36, 42 42, 38 48 L 22 48 C 18 42, 12 36, 12 28 A 18 18 0 0 1 30 10 Z" />
            <line x1="22" y1="53" x2="38" y2="53" stroke="#ffffff" strokeWidth="2.5" />
            <line x1="25" y1="58" x2="35" y2="58" stroke="#ffffff" strokeWidth="2" />
            {/* Glow rays */}
            <line x1="30" y1="2" x2="30" y2="6" stroke="#fbbf24" strokeWidth="2" />
            <line x1="12" y1="12" x2="8" y2="8" stroke="#fbbf24" strokeWidth="2" />
            <line x1="48" y1="12" x2="52" y2="8" stroke="#fbbf24" strokeWidth="2" />
          </g>

          {/* Code brackets doodle */}
          <g transform="translate(250, 45)" stroke="#67e8f9" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M 14 8 L 4 18 L 14 28" />
            <path d="M 24 8 L 34 18 L 24 28" />
            <line x1="21" y1="6" x2="17" y2="30" stroke="#a5f3fc" strokeWidth="2" />
          </g>

          {/* Rocket Launch Doodle */}
          <g transform="translate(455, 230) rotate(-35) scale(0.9)" stroke="#fb7185" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" fill="rgba(251, 113, 133, 0.2)">
            <path d="M 25 5 C 40 20, 40 45, 35 60 L 15 60 C 10 45, 10 20, 25 5 Z" />
            <circle cx="25" cy="30" r="5" fill="#ffffff" />
            {/* Fins */}
            <path d="M 12 45 L 2 55 L 14 58" />
            <path d="M 38 45 L 48 55 L 36 58" />
            {/* Flames */}
            <path d="M 18 64 C 20 74, 25 78, 25 78 C 25 78, 30 74, 32 64" stroke="#fbbf24" strokeWidth="2.5" />
          </g>

          {/* Sparkles & Star Doodles */}
          <g stroke="#ffffff" strokeWidth="2" strokeLinecap="round">
            {/* Star 1 */}
            <path d="M 170 85 L 170 95 M 165 90 L 175 90" />
            {/* Star 2 */}
            <path d="M 390 95 L 390 107 M 384 101 L 396 101" />
            {/* Star 3 */}
            <path d="M 90 220 L 90 228 M 86 224 L 94 224" stroke="#f472b6" />
            {/* Star 4 */}
            <path d="M 330 260 L 330 270 M 325 265 L 335 265" stroke="#38bdf8" />
          </g>

          {/* Target / Bullseye Doodle */}
          <g transform="translate(70, 300) scale(0.85)" stroke="#34d399" strokeWidth="2.2">
            <circle cx="20" cy="20" r="16" fill="rgba(52, 211, 153, 0.1)" />
            <circle cx="20" cy="20" r="9" stroke="#ffffff" />
            <circle cx="20" cy="20" r="3" fill="#34d399" />
          </g>
        </svg>

        {/* Floating Glassmorphic Roadmap Card 1 */}
        <div className="doodle-card top-left-card">
          <div className="doodle-card-header">
            <div className="doodle-badge-icon purple">
              <CheckCircle2 size={16} />
            </div>
            <div>
              <strong>Skill Matching</strong>
              <span>Smart Analysis</span>
            </div>
          </div>
          <div className="doodle-match-score">
            <span>94%</span> Match for Tech & Design
          </div>
          <div className="doodle-mini-progress">
            <div style={{ width: "94%" }}></div>
          </div>
        </div>

        {/* Floating Glassmorphic Roadmap Card 2 */}
        <div className="doodle-card bottom-right-card">
          <div className="doodle-card-header">
            <div className="doodle-badge-icon blue">
              <TrendingUp size={16} />
            </div>
            <div>
              <strong>High Growth Careers</strong>
              <span>+32% Industry Demand</span>
            </div>
          </div>
          <div className="doodle-tags-row">
            <span className="doodle-pill">AI & ML</span>
            <span className="doodle-pill">Data Science</span>
            <span className="doodle-pill">Cloud Arch</span>
          </div>
        </div>

        {/* Floating Mini Badge */}
        <div className="doodle-mini-badge">
          <Award size={15} />
          <span>Curated Career Roadmaps</span>
        </div>
      </div>

      {/* Decorative Orbs */}
      <div className="auth-orb orb-primary" />
      <div className="auth-orb orb-secondary" />
      <div className="auth-orb orb-tertiary" />
    </section>
  );
}
