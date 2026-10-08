import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import Navbar from "../components/Navbar";

const API_URL = "http://localhost:5000/api";

export default function CareerFields() {
  const { isAuthenticated } = useAuth();
  const [fields, setFields] = useState([]);
  const [subfields, setSubfields] = useState([]);
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fieldRes, subfieldRes, careerRes] = await Promise.all([
          fetch(`${API_URL}/fields`),
          fetch(`${API_URL}/subfields`),
          fetch(`${API_URL}/careers`),
        ]);

        const fieldData = fieldRes.ok ? await fieldRes.json() : [];
        const subfieldData = subfieldRes.ok ? await subfieldRes.json() : [];
        const careerData = careerRes.ok ? await careerRes.json() : [];

        setFields(Array.isArray(fieldData) ? fieldData : fieldData.fields || []);
        setSubfields(
          Array.isArray(subfieldData) ? subfieldData : subfieldData.subfields || []
        );
        setCareers(
          Array.isArray(careerData) ? careerData : careerData.careers || []
        );
      } catch (err) {
        console.error("Failed to load fields data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getSubfieldsForField = (fieldId) => {
    return subfields.filter(
      (sub) =>
        sub.fieldId === fieldId ||
        sub.fieldId?._id === fieldId ||
        sub.field === fieldId ||
        sub.field?._id === fieldId
    );
  };

  const getCareerCountForField = (fieldId) => {
    return careers.filter(
      (c) =>
        c.fieldId === fieldId ||
        c.fieldId?._id === fieldId ||
        c.field === fieldId
    ).length;
  };

  return (
    <div className="fields-page">
      <Navbar />

      <main className="page-container fields-container">
        <div className="pdf-page-intro">
          <h1>Career fields</h1>
          <p>
            Every career on Career Horizon sits inside a field and a
            specialisation within it. Browsing from the top down is a good way
            to find roles you did not know existed.
          </p>
        </div>

        {loading ? (
          <div className="saved-loading-state">
            <div className="loading-spinner-dot"></div>
            <p>Loading career fields and specialisations...</p>
          </div>
        ) : (
          <section className="pdf-fields-stack">
            {fields.map((field) => {
              const fieldSubs = getSubfieldsForField(field._id);
              const careerCount = getCareerCountForField(field._id);

              return (
                <div key={field._id} className="pdf-field-block">
                  <div className="pdf-field-block-header">
                    <div>
                      <h3>{field.name}</h3>
                      {field.description && <p>{field.description}</p>}
                    </div>
                    <Link
                      to={`/careers?fieldId=${field._id}`}
                      className="pdf-field-count-badge"
                    >
                      {careerCount} {careerCount === 1 ? "career" : "careers"}
                    </Link>
                  </div>

                  {fieldSubs.length > 0 && (
                    <div className="pdf-subfields-grid">
                      {fieldSubs.map((sub) => (
                        <Link
                          key={sub._id}
                          to={`/careers?fieldId=${field._id}&subfieldId=${sub._id}`}
                          className="pdf-subfield-item"
                        >
                          <strong>{sub.name}</strong>
                          <span>
                            {sub.description ||
                              `Explore roles in ${sub.name}`}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </section>
        )}
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
