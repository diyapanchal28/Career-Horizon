import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import Navbar from "../components/Navbar";

export default function About() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="about-page">
      <Navbar />

      <main className="page-container about-container">
        {/* Hero Header */}
        <section className="pdf-page-intro">
          <h1>How matching works</h1>
          <p>
            Career Horizon does not guess. Your match percentage is calculated
            from a fixed set of rules applied to the interests you selected and
            the data stored against each career. Run it twice with the same
            answers and you get the same number both times.
          </p>
        </section>

        {/* 4 Dimension Cards (2x2 Grid matching PDF Page 2) */}
        <section className="pdf-matching-cards-grid">
          <div className="pdf-match-rule-card">
            <div className="pdf-match-rule-top">
              <h3>Field match</h3>
              <span className="pdf-pts-badge">40 pts</span>
            </div>
            <p>
              Does this career sit in a field you picked? Your first pick scores
              highest.
            </p>
          </div>

          <div className="pdf-match-rule-card">
            <div className="pdf-match-rule-top">
              <h3>Specialisation match</h3>
              <span className="pdf-pts-badge">30 pts</span>
            </div>
            <p>
              Does it sit in a subfield you picked? A neighbouring subfield
              earns partial credit.
            </p>
          </div>

          <div className="pdf-match-rule-card">
            <div className="pdf-match-rule-top">
              <h3>Work interest match</h3>
              <span className="pdf-pts-badge">20 pts</span>
            </div>
            <p>
              How many of the kinds of work you enjoy does this role involve day
              to day?
            </p>
          </div>

          <div className="pdf-match-rule-card">
            <div className="pdf-match-rule-top">
              <h3>Work style match</h3>
              <span className="pdf-pts-badge">10 pts</span>
            </div>
            <p>
              Does the way you prefer to work fit how this role is usually
              structured?
            </p>
          </div>
        </section>

        {/* A worked example */}
        <section className="pdf-worked-example">
          <h2>A worked example</h2>
          <p>
            Someone picks Technology as their first field, Data &amp; Analytics
            as a specialisation, and says they enjoy working with data and
            problem solving. Against the Data Analyst record, that scores:
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
                  <td>Work interests</td>
                  <td>20</td>
                  <td>20</td>
                </tr>
                <tr>
                  <td>Work style</td>
                  <td>10</td>
                  <td>10</td>
                </tr>
                <tr className="pdf-worked-total-row">
                  <td>Total</td>
                  <td>100%</td>
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
            <Link to="/" className="brand">
              <div className="brand-icon">
                <span className="brand-letter">C</span>
              </div>
              <span className="brand-title-text">Career Horizon</span>
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
