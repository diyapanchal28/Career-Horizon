import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import Navbar from "../components/Navbar";
import { ArrowLeft } from "lucide-react";

export default function About() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="about-page">
      <Navbar />

      <main className="page-container about-container">
        <div className="pdf-page-back-row">
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

        {/* Hero Header */}
        <section className="pdf-page-intro">
          <h1>How your match is calculated</h1>
          <p>
            Career Horizon does not guess. Your match percentage is calculated
            from a fixed set of rules applied to the fields, specialisations,
            interests, and activities you selected against the data stored for
            each career. Run it twice with the same answers and you get the same
            number both times.
          </p>
        </section>

        {/* 4 Dimension Cards (2x2 Grid) */}
        <section className="pdf-matching-cards-grid">
          <div className="pdf-match-rule-card">
            <div className="pdf-match-rule-top">
              <h3>Field Match</h3>
              <span className="pdf-pts-badge">40 pts</span>
            </div>
            <p>
              Does this career belong to one of your selected fields? Your first
              choice scores highest (1st = 40, 2nd = 30, 3rd = 20).
            </p>
          </div>

          <div className="pdf-match-rule-card">
            <div className="pdf-match-rule-top">
              <h3>Specialisation Match</h3>
              <span className="pdf-pts-badge">30 pts</span>
            </div>
            <p>
              Does this career match your selected subfield? A neighbouring or
              related specialisation earns partial credit.
            </p>
          </div>

          <div className="pdf-match-rule-card">
            <div className="pdf-match-rule-top">
              <h3>Interest Match</h3>
              <span className="pdf-pts-badge">20 pts</span>
            </div>
            <p>
              Does this career involve the things you said you are interested
              in?
            </p>
          </div>

          <div className="pdf-match-rule-card">
            <div className="pdf-match-rule-top">
              <h3>Activity Match</h3>
              <span className="pdf-pts-badge">10 pts</span>
            </div>
            <p>
              Does the actual day-to-day work include activities you enjoy?
            </p>
          </div>
        </section>

        {/* A worked example */}
        <section className="pdf-worked-example">
          <h2>A worked example</h2>
          <p>
            Someone selects <strong>Technology</strong> as their first field,{" "}
            <strong>Data &amp; Analytics</strong> as their specialisation, and
            enjoys{" "}
            <strong>working with data, problem solving and research</strong>.
            They also enjoy{" "}
            <strong>analyzing data and finding solutions</strong>. Against the{" "}
            <strong>Data Analyst</strong> record, that scores:
          </p>

          <div className="pdf-worked-table-wrap">
            <table className="pdf-worked-table">
              <thead>
                <tr>
                  <th>Component</th>
                  <th>Scored</th>
                  <th>Out of</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Field</td>
                  <td>40</td>
                  <td>40</td>
                </tr>
                <tr>
                  <td>Specialisation</td>
                  <td>30</td>
                  <td>30</td>
                </tr>
                <tr>
                  <td>Interests</td>
                  <td>18</td>
                  <td>20</td>
                </tr>
                <tr>
                  <td>Activities</td>
                  <td>8</td>
                  <td>10</td>
                </tr>
                <tr className="pdf-worked-total-row">
                  <td>Total Match</td>
                  <td>96%</td>
                  <td>100</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Disclaimer Box */}
        <section className="pdf-meaning-callout">
          <h3>What a percentage does not mean</h3>
          <p>
            A high match means a career lines up with what you said you enjoy. It
            does not measure your aptitude, predict whether you will get hired,
            or account for anything you did not tell us. Treat it as a shortlist
            for research, not a verdict. Salary and demand figures in this
            project are illustrative example data for an academic demonstration,
            not verified market research.
          </p>
        </section>

        {/* Bottom CTA Buttons */}
        <div className="pdf-about-actions">
          <Link to="/careers" className="pdf-explore-btn large">
            Browse careers
          </Link>
          {!isAuthenticated ? (
            <Link to="/register" className="pdf-outline-btn large">
              Create an account
            </Link>
          ) : (
            <Link to="/matches" className="pdf-outline-btn large">
              View my matches
            </Link>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container pdf-footer-grid">
          <div className="footer-brand">
            <Link to="/" className="brand" aria-label="Career Horizon">
              <img
                src="/logo.png"
                alt="Career Horizon"
                className="brand-logo-img"
              />
            </Link>
            <p>
              Explore careers, find the ones that fit your interests, and follow
              a roadmap to get there.
            </p>
          </div>
          <div className="footer-col">
            <strong>Explore</strong>
            <Link to="/careers">All careers</Link>
            <Link to="/fields">Career fields</Link>
            <Link to={isAuthenticated ? "/matches" : "/login"}>
              Compare careers
            </Link>
          </div>
          <div className="footer-col">
            <strong>Your account</strong>
            {!isAuthenticated ? (
              <>
                <Link to="/register">Create an account</Link>
                <Link to="/login">Log in</Link>
                <Link to="/login">Dashboard</Link>
              </>
            ) : (
              <>
                <Link to="/dashboard">Dashboard</Link>
                <Link to="/matches">My matches</Link>
                <Link to="/saved-careers">Saved careers</Link>
              </>
            )}
          </div>
          <div className="footer-col">
            <strong>About</strong>
            <Link to="/about">How matching works</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
