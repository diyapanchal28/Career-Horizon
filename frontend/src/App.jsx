import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

// Pages
import Home from "./pages/Home";
import Careers from "./pages/Careers";
import CareerDetails from "./pages/CareerDetails";
import CareerFields from "./pages/CareerFields";
import About from "./pages/About";
import Assessment from "./pages/Assessment";
import Recommendations from "./pages/Recommendations";
import Roadmap from "./pages/Roadmap";
import Dashboard from "./pages/Dashboard";
import SavedCareers from "./pages/SavedCareers";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/admin/AdminDashboard";

import "./App.css";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Discovery Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/careers/:id" element={<CareerDetails />} />
          <Route path="/fields" element={<CareerFields />} />
          <Route path="/about" element={<About />} />

          {/* Assessment & Personalized Guidance */}
          <Route path="/assessment" element={<Assessment />} />
          <Route path="/matches" element={<Recommendations />} />
          <Route path="/recommendations" element={<Navigate to="/matches" replace />} />

          {/* Roadmap Milestones */}
          <Route path="/roadmaps/:careerId" element={<Roadmap />} />

          {/* User Account & Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/saved-careers" element={<SavedCareers />} />
          <Route path="/saved" element={<Navigate to="/saved-careers" replace />} />
          <Route path="/profile" element={<Profile />} />

          {/* Authentication (Preserved per User Request) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin Panel */}
          <Route path="/admin" element={<AdminDashboard />} />

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;