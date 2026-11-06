import { useState, useEffect, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import Navbar from "../../components/Navbar";
import {
  FileText,
  Calendar,
  Download,
  Printer,
  RefreshCw,
  Search,
  BarChart3,
  AlertTriangle,
  Briefcase,
  Layers,
  Compass,
  Users,
  Shield,
  Lightbulb,
  FileSpreadsheet,
} from "lucide-react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";

import { API_URL } from "../../config/api";
import "./adminReports.css";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const REPORT_OPTIONS = [
  { id: "overall_platform", label: "Overall Platform Activity Report" },
  { id: "user_registration", label: "User Registration Report" },
  { id: "career_assessment", label: "Career Assessment Report" },
  { id: "career_recommendation", label: "Career Recommendation Report" },
  { id: "career_interest", label: "Career Interest Analysis Report" },
  { id: "roadmap_progress", label: "Career Roadmap Progress Report" },
  { id: "chatbot_usage", label: "AI Chatbot Usage Report" },
];

const DATE_RANGE_OPTIONS = [
  { id: "all", label: "All Time" },
  { id: "today", label: "Today" },
  { id: "7days", label: "Last 7 Days" },
  { id: "30days", label: "Last 30 Days" },
  { id: "this_month", label: "This Month" },
  { id: "last_month", label: "Last Month" },
  { id: "custom", label: "Custom Date Range" },
];

export default function AdminReports() {
  const navigate = useNavigate();
  const { isAuthenticated, user, token } = useAuth();
  const authToken = token || localStorage.getItem("token");

  // Selection states
  const [selectedReport, setSelectedReport] = useState("overall_platform");
  const [dateFilter, setDateFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Data & status states
  const [loading, setLoading] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [tableSearch, setTableSearch] = useState("");

  // Check admin authorization
  const isAdmin = user?.role === "admin";

  // Fetch report data
  const handleGenerateReport = async () => {
    // Validate custom dates
    if (dateFilter === "custom") {
      if (!startDate || !endDate) {
        setErrorMessage("Please select both a Start Date and an End Date.");
        return;
      }
      if (new Date(startDate) > new Date(endDate)) {
        setErrorMessage("Start Date cannot be later than End Date.");
        return;
      }
    }

    setErrorMessage("");
    setLoading(true);

    try {
      let endpoint = "overview";
      if (selectedReport === "user_registration") endpoint = "users";
      else if (selectedReport === "career_assessment") endpoint = "assessments";
      else if (selectedReport === "career_recommendation") endpoint = "recommendations";
      else if (selectedReport === "career_interest") endpoint = "interests";
      else if (selectedReport === "roadmap_progress") endpoint = "roadmaps";
      else if (selectedReport === "chatbot_usage") endpoint = "chatbot";

      const queryParams = new URLSearchParams({
        filter: dateFilter,
        ...(dateFilter === "custom" ? { startDate, endDate } : {}),
      });

      const res = await fetch(`${API_URL}/admin/reports/${endpoint}?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to load report data.");
      }

      setReportData(data);
    } catch (err) {
      console.error("Report fetch error:", err);
      setErrorMessage(err.message || "An unexpected error occurred while fetching report data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Initial report load
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      handleGenerateReport();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isAdmin]);

  // Export Excel
  const handleExportExcel = async () => {
    try {
      setExportingExcel(true);
      const queryParams = new URLSearchParams({
        type: selectedReport,
        filter: dateFilter,
        ...(dateFilter === "custom" ? { startDate, endDate } : {}),
      });

      const res = await fetch(`${API_URL}/admin/reports/export/excel?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to generate Excel file.");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const dateStamp = new Date().toISOString().split("T")[0];
      a.download = `CareerHorizon_${selectedReport}_${dateStamp}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Excel export error:", err);
      alert(err.message || "Could not export Excel file.");
    } finally {
      setExportingExcel(false);
    }
  };

  // Export PDF
  const handleExportPdf = async () => {
    try {
      setExportingPdf(true);
      const queryParams = new URLSearchParams({
        type: selectedReport,
        filter: dateFilter,
        ...(dateFilter === "custom" ? { startDate, endDate } : {}),
      });

      const res = await fetch(`${API_URL}/admin/reports/export/pdf?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to generate PDF file.");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const dateStamp = new Date().toISOString().split("T")[0];
      a.download = `CareerHorizon_${selectedReport}_${dateStamp}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("PDF export error:", err);
      alert(err.message || "Could not export PDF report.");
    } finally {
      setExportingPdf(false);
    }
  };

  // Print Report
  const handlePrint = () => {
    window.print();
  };

  // Filter table rows by local search
  const filteredTableRows = useMemo(() => {
    if (!reportData?.table?.rows) return [];
    if (!tableSearch.trim()) return reportData.table.rows;

    const term = tableSearch.toLowerCase();
    return reportData.table.rows.filter((row) =>
      Object.values(row).some((val) =>
        String(val || "").toLowerCase().includes(term)
      )
    );
  }, [reportData, tableSearch]);

  // Insights generation based on actual data
  const insights = useMemo(() => {
    if (!reportData || !reportData.summary) return [];
    const s = reportData.summary;
    const list = [];

    if (selectedReport === "user_registration") {
      list.push(`Total student registrations on Career Horizon stand at ${s.totalRegisteredUsers || 0}.`);
      list.push(`${s.newRegistrations || 0} user registrations occurred within the selected period (${reportData.periodLabel}).`);
      list.push(`Active accounts account for ${s.activePercentage || 100}% of registrations in this scope.`);
    } else if (selectedReport === "career_assessment") {
      list.push(`${s.completedAssessments || 0} out of ${s.totalStudents || 0} students (${s.completionPercentage || 0}%) completed the career interests assessment.`);
      if (s.notCompletedAssessments > 0) {
        list.push(`${s.notCompletedAssessments} students have registered but not yet finished interest evaluation.`);
      }
    } else if (selectedReport === "career_recommendation") {
      list.push(`Generated ${s.totalRecommendationsGenerated || 0} matched career recommendations across ${s.uniqueCareersRecommended || 0} pathways.`);
      if (s.mostRecommendedCareer && s.mostRecommendedCareer !== "N/A") {
        list.push(`"${s.mostRecommendedCareer}" emerges as the most frequently matched career path.`);
      }
      list.push(`Platform-wide average compatibility score sits at ${s.averageMatchPercentage || 0}%.`);
    } else if (selectedReport === "career_interest") {
      if (s.mostSelectedField && s.mostSelectedField !== "N/A") {
        list.push(`"${s.mostSelectedField}" is the top preferred industry field among students.`);
      }
      if (s.mostSelectedSubfield && s.mostSelectedSubfield !== "N/A") {
        list.push(`Top specializing subfield choice is "${s.mostSelectedSubfield}".`);
      }
      if (s.topWorkInterest && s.topWorkInterest !== "N/A") {
        list.push(`"${s.topWorkInterest}" is the most commonly selected work interest.`);
      }
    } else if (selectedReport === "roadmap_progress") {
      list.push(`${s.totalStudentsUsingRoadmaps || 0} learners have engaged with career roadmaps, starting ${s.totalRoadmapsStarted || 0} total roadmaps.`);
      list.push(`${s.totalRoadmapsCompleted || 0} roadmaps have reached 100% step completion.`);
      list.push(`Overall roadmap progress averages ${s.averageCompletionPercentage || 0}% across all enrolled students.`);
    } else if (selectedReport === "chatbot_usage") {
      list.push(`AI Career Assistant handled ${s.totalConversations || 0} student conversations and ${s.totalUserMessages || 0} user prompts.`);
      list.push(`${s.uniqueStudents || 0} individual students sought interactive career guidance.`);
      list.push(`Average interaction depth is ${s.averageMessagesPerConversation || 0} messages per dialogue.`);
    } else {
      list.push(`Active student body includes ${s.totalRegisteredStudents || 0} registered learners.`);
      list.push(`${s.assessmentCompletions || 0} assessments completed, unlocking customized recommendations.`);
      list.push(`${s.roadmapsStarted || 0} career roadmaps initiated with ${s.roadmapsCompleted || 0} full completions.`);
      list.push(`${s.chatbotConversations || 0} AI guidance queries addressed.`);
    }

    return list;
  }, [reportData, selectedReport]);

  if (!isAdmin) {
    return (
      <div className="admin-page">
        <Navbar />
        <main className="page-container admin-container">
          <div className="admin-error-alert" style={{ marginTop: "3rem" }}>
            <AlertTriangle size={20} />
            <span>Administrator privileges required to access Reporting &amp; Analytics.</span>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <Navbar />

      <main className="reports-page-container">
        {/* Header Bar */}
        <section className="reports-header-bar">
          <div className="reports-badge">
            <Shield size={14} />
            <span>ADMIN REPORTING SYSTEM</span>
          </div>
          <div className="reports-title-box">
            <h1>Reports &amp; Analytics</h1>
            <p>Generate, analyze, and export Career Horizon platform reports.</p>
          </div>
        </section>

        {/* Admin Navigation Tabs */}
        <nav className="reports-admin-nav" aria-label="Admin Navigation">
          <Link to="/admin" className="reports-nav-btn">
            <Briefcase size={16} />
            <span>Careers</span>
          </Link>
          <Link to="/admin" className="reports-nav-btn">
            <Layers size={16} />
            <span>Fields &amp; Subfields</span>
          </Link>
          <Link to="/admin" className="reports-nav-btn">
            <Compass size={16} />
            <span>Roadmaps</span>
          </Link>
          <Link to="/admin" className="reports-nav-btn">
            <Users size={16} />
            <span>Users</span>
          </Link>
          <div className="reports-nav-btn active">
            <BarChart3 size={16} />
            <span>Reports</span>
          </div>
        </nav>

        {/* Error Banner */}
        {errorMessage && (
          <div className="admin-error-alert" role="alert" style={{ marginBottom: "1.5rem" }}>
            <AlertTriangle size={18} />
            <span>{errorMessage}</span>
            <button type="button" onClick={() => setErrorMessage("")}>
              ×
            </button>
          </div>
        )}

        {/* Report Generation & Filter Controls */}
        <section className="reports-controls-card">
          <div className="controls-grid">
            {/* Report Type Dropdown */}
            <div className="control-field">
              <label htmlFor="report-type-select">
                <FileText size={15} />
                <span>Select Report Type</span>
              </label>
              <select
                id="report-type-select"
                className="control-select"
                value={selectedReport}
                onChange={(e) => setSelectedReport(e.target.value)}
              >
                {REPORT_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Filter */}
            <div className="control-field">
              <label htmlFor="date-range-select">
                <Calendar size={15} />
                <span>Date Range Filter</span>
              </label>
              <select
                id="date-range-select"
                className="control-select"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                {DATE_RANGE_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Custom Date Range Pickers */}
          {dateFilter === "custom" && (
            <div className="custom-date-row">
              <div className="control-field">
                <label>Start Date</label>
                <input
                  type="date"
                  className="control-input"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="control-field">
                <label>End Date</label>
                <input
                  type="date"
                  className="control-input"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Action Buttons Bar */}
          <div className="controls-actions-bar">
            <div className="actions-left">
              <button
                type="button"
                className="btn-generate"
                onClick={handleGenerateReport}
                disabled={loading}
              >
                <RefreshCw size={16} className={loading ? "report-spinner" : ""} />
                <span>{loading ? "Generating Report..." : "Generate Report"}</span>
              </button>
            </div>

            <div className="actions-right">
              <button
                type="button"
                className="btn-action-outline btn-pdf"
                onClick={handleExportPdf}
                disabled={loading || exportingPdf || !reportData}
                title="Download report in formatted PDF"
              >
                <Download size={15} />
                <span>{exportingPdf ? "Exporting PDF..." : "Export PDF"}</span>
              </button>

              <button
                type="button"
                className="btn-action-outline btn-excel"
                onClick={handleExportExcel}
                disabled={loading || exportingExcel || !reportData}
                title="Download data as Excel (.xlsx)"
              >
                <FileSpreadsheet size={15} />
                <span>{exportingExcel ? "Exporting Excel..." : "Export Excel"}</span>
              </button>

              <button
                type="button"
                className="btn-action-outline"
                onClick={handlePrint}
                disabled={loading || !reportData}
                title="Open browser print interface"
              >
                <Printer size={15} />
                <span>Print</span>
              </button>
            </div>
          </div>
        </section>

        {/* Loading Spinner State */}
        {loading && (
          <div className="report-state-box">
            <div className="report-spinner" />
            <p>Querying MongoDB and calculating real analytics...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && (!reportData || (reportData.table?.rows?.length === 0 && Object.keys(reportData.summary || {}).length === 0)) && (
          <div className="report-state-box">
            <FileText size={42} style={{ color: "var(--text-subtle)", marginBottom: "1rem" }} />
            <p>No data available for the selected report and date range.</p>
          </div>
        )}

        {/* ================= REPORT PREVIEW SECTION ================= */}
        {!loading && reportData && (
          <section className="report-preview-sheet" id="report-printable-area">
            {/* Report Header */}
            <div className="report-sheet-header">
              <div className="report-meta-box" style={{ width: "100%", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                  <div className="report-meta-title" style={{ fontSize: "1.35rem", marginBottom: "0.25rem" }}>
                    {reportData.reportName}
                  </div>
                  <div className="report-meta-detail">
                    Selected Period: <strong>{reportData.periodLabel || "All Time"}</strong>
                  </div>
                </div>
                <div className="report-meta-detail">
                  <strong>Generated On:</strong> {new Date(reportData.generatedAt).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Statistical Summary KPI Cards */}
            <div className="report-summary-grid">
              {Object.entries(reportData.summary || {}).map(([key, value]) => {
                const label = key
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (s) => s.toUpperCase());
                return (
                  <div key={key} className="summary-kpi-card">
                    <div className="kpi-label">{label}</div>
                    <div className="kpi-value">{String(value)}</div>
                    <div className="kpi-caption">Verified MongoDB record</div>
                  </div>
                );
              })}
            </div>

            {/* Dynamic Charts Visualization */}
            {renderCharts(selectedReport, reportData)}

            {/* Detailed Data Table */}
            <div className="report-table-card">
              <div className="report-table-header-bar">
                <h3>Detailed Report Records ({filteredTableRows.length} items)</h3>
                <div className="table-filter-input">
                  <Search size={14} color="var(--text-muted)" />
                  <input
                    type="text"
                    placeholder="Search table rows..."
                    value={tableSearch}
                    onChange={(e) => setTableSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="report-table-container">
                <table className="report-data-table">
                  <thead>
                    <tr>
                      {reportData.table?.columns?.map((col) => (
                        <th key={col.key}>{col.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTableRows.length > 0 ? (
                      filteredTableRows.map((row, rIdx) => (
                        <tr key={rIdx}>
                          {reportData.table?.columns?.map((col) => {
                            const val = row[col.key];
                            return (
                              <td key={col.key}>
                                {renderTableCell(col.key, val)}
                              </td>
                            );
                          })}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={reportData.table?.columns?.length || 1}
                          style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}
                        >
                          No records match your table search query.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Key Findings / Insights Based on Real Data */}
            {insights.length > 0 && (
              <div className="report-insights-card">
                <div className="insights-header">
                  <Lightbulb size={18} />
                  <span>Key Findings &amp; Summary Insights</span>
                </div>
                <ul className="insights-list">
                  {insights.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Report Footer */}
            <div className="report-sheet-footer">
              <span>Generated by Career Horizon – Admin Reporting System</span>
              <span>Official Platform Documentation • {new Date().toLocaleDateString()}</span>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

/**
 * Render table cell with status badges where appropriate
 */
function renderTableCell(key, val) {
  if (val === null || val === undefined) return "—";

  const str = String(val);

  if (key === "accountStatus" || key === "status" || key === "assessmentStatus") {
    let badgeClass = "badge-status-pill";
    const lower = str.toLowerCase();
    if (lower === "active" || lower === "completed") {
      badgeClass += " active";
    } else if (lower === "in progress") {
      badgeClass += " in-progress";
    } else {
      badgeClass += " inactive";
    }
    return <span className={badgeClass}>{str}</span>;
  }

  // Format dates
  if (key.toLowerCase().includes("date") && str !== "N/A" && !isNaN(Date.parse(str))) {
    return new Date(str).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  return str;
}

/**
 * Render visual charts based on report type
 */
function renderCharts(reportId, data) {
  if (!data?.charts) return null;
  const c = data.charts;

  // 1. User Registration Report Charts
  if (reportId === "user_registration" && c.monthlyRegistrations) {
    const labels = c.monthlyRegistrations.map((m) => m.month);
    const counts = c.monthlyRegistrations.map((m) => m.count);

    const chartData = {
      labels: labels.length > 0 ? labels : ["No data"],
      datasets: [
        {
          label: "New Registrations",
          data: counts.length > 0 ? counts : [0],
          backgroundColor: "#632cd6",
          borderRadius: 8,
        },
      ],
    };

    return (
      <div className="report-charts-grid">
        <div className="chart-panel-card">
          <div className="chart-panel-header">
            <h3>Monthly Registration Trends</h3>
          </div>
          <div className="chart-wrapper-box">
            <Bar
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { beginAtZero: true, ticks: { precision: 0 } },
                },
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  // 2. Career Assessment Report Charts
  if (reportId === "career_assessment") {
    const statusData = {
      labels: (c.statusBreakdown || []).map((s) => s.name),
      datasets: [
        {
          data: (c.statusBreakdown || []).map((s) => s.value),
          backgroundColor: ["#10b981", "#ec4899"],
          borderWidth: 2,
          borderColor: "#ffffff",
        },
      ],
    };

    const monthlyTrends = c.monthlyTrends || [];
    const barData = {
      labels: monthlyTrends.map((m) => m.month),
      datasets: [
        {
          label: "Completed Assessments",
          data: monthlyTrends.map((m) => m.count),
          backgroundColor: "#8b5cf6",
          borderRadius: 8,
        },
      ],
    };

    return (
      <div className="report-charts-grid two-cols">
        <div className="chart-panel-card">
          <div className="chart-panel-header">
            <h3>Assessment Status Ratio</h3>
          </div>
          <div className="chart-wrapper-box">
            <Doughnut
              data={statusData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: "bottom" } },
              }}
            />
          </div>
        </div>

        <div className="chart-panel-card">
          <div className="chart-panel-header">
            <h3>Monthly Completion Volume</h3>
          </div>
          <div className="chart-wrapper-box">
            <Bar
              data={barData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { beginAtZero: true, ticks: { precision: 0 } },
                },
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  // 3. Career Recommendation Report Charts
  if (reportId === "career_recommendation") {
    const topCareers = c.topFiveCareers || [];
    const horizData = {
      labels: topCareers.map((c) => c.name),
      datasets: [
        {
          label: "Times Recommended",
          data: topCareers.map((c) => c.count),
          backgroundColor: "#632cd6",
          borderRadius: 6,
        },
      ],
    };

    const distData = {
      labels: (c.distribution || []).map((d) => d.name),
      datasets: [
        {
          data: (c.distribution || []).map((d) => d.value),
          backgroundColor: [
            "#632cd6",
            "#8b5cf6",
            "#ec4899",
            "#f59e0b",
            "#10b981",
            "#06b6d4",
            "#3b82f6",
            "#a855f7",
          ],
        },
      ],
    };

    return (
      <div className="report-charts-grid two-cols">
        <div className="chart-panel-card">
          <div className="chart-panel-header">
            <h3>Top Recommended Career Pathways</h3>
          </div>
          <div className="chart-wrapper-box">
            <Bar
              data={horizData}
              options={{
                indexAxis: "y",
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: { beginAtZero: true, ticks: { precision: 0 } },
                },
              }}
            />
          </div>
        </div>

        <div className="chart-panel-card">
          <div className="chart-panel-header">
            <h3>Recommendation Distribution</h3>
          </div>
          <div className="chart-wrapper-box">
            <Doughnut
              data={distData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: "bottom" } },
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  // 4. Career Interest Analysis Report Charts
  if (reportId === "career_interest") {
    const fields = c.fieldsBarChart || [];
    const subfields = c.subfieldsHorizontalChart || [];
    const prefs = c.workPreferencesChart || [];

    const fieldChart = {
      labels: fields.map((f) => f.name),
      datasets: [
        {
          label: "Students Interested",
          data: fields.map((f) => f.students),
          backgroundColor: "#8b5cf6",
          borderRadius: 8,
        },
      ],
    };

    const subfieldChart = {
      labels: subfields.map((s) => s.name),
      datasets: [
        {
          label: "Students Selecting Subfield",
          data: subfields.map((s) => s.students),
          backgroundColor: "#ec4899",
          borderRadius: 6,
        },
      ],
    };

    const prefChart = {
      labels: prefs.map((p) => p.name),
      datasets: [
        {
          data: prefs.map((p) => p.value),
          backgroundColor: [
            "#632cd6",
            "#3b82f6",
            "#10b981",
            "#f59e0b",
            "#ec4899",
            "#8b5cf6",
            "#06b6d4",
          ],
        },
      ],
    };

    return (
      <div className="report-charts-grid">
        <div className="chart-panel-card">
          <div className="chart-panel-header">
            <h3>Top Career Fields Preferred by Students</h3>
          </div>
          <div className="chart-wrapper-box">
            <Bar
              data={fieldChart}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
              }}
            />
          </div>
        </div>

        <div className="report-charts-grid two-cols" style={{ marginBottom: 0 }}>
          <div className="chart-panel-card">
            <div className="chart-panel-header">
              <h3>Specialized Subfield Distribution</h3>
            </div>
            <div className="chart-wrapper-box">
              <Bar
                data={subfieldChart}
                options={{
                  indexAxis: "y",
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: { x: { beginAtZero: true, ticks: { precision: 0 } } },
                }}
              />
            </div>
          </div>

          <div className="chart-panel-card">
            <div className="chart-panel-header">
              <h3>Work Preferences &amp; Styles</h3>
            </div>
            <div className="chart-wrapper-box">
              <Doughnut
                data={prefChart}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: "bottom" } },
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 5. Roadmap Progress Report Charts
  if (reportId === "roadmap_progress") {
    const statusData = {
      labels: (c.statusDistribution || []).map((s) => s.name),
      datasets: [
        {
          data: (c.statusDistribution || []).map((s) => s.value),
          backgroundColor: ["#10b981", "#3b82f6", "#f59e0b"],
        },
      ],
    };

    const roadmaps = c.topRoadmapsBarChart || [];
    const barData = {
      labels: roadmaps.map((r) => r.name),
      datasets: [
        {
          label: "Enrolled Students",
          data: roadmaps.map((r) => r.count),
          backgroundColor: "#632cd6",
          borderRadius: 8,
        },
      ],
    };

    return (
      <div className="report-charts-grid two-cols">
        <div className="chart-panel-card">
          <div className="chart-panel-header">
            <h3>Roadmap Completion Status</h3>
          </div>
          <div className="chart-wrapper-box">
            <Doughnut
              data={statusData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: "bottom" } },
              }}
            />
          </div>
        </div>

        <div className="chart-panel-card">
          <div className="chart-panel-header">
            <h3>Most Frequently Pursued Roadmaps</h3>
          </div>
          <div className="chart-wrapper-box">
            <Bar
              data={barData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  // 6. Chatbot Usage Report Charts
  if (reportId === "chatbot_usage" && c.usageTrend) {
    const lineData = {
      labels: c.usageTrend.map((t) => t.date),
      datasets: [
        {
          label: "Conversations",
          data: c.usageTrend.map((t) => t.conversations),
          borderColor: "#632cd6",
          backgroundColor: "rgba(99, 44, 214, 0.1)",
          fill: true,
          tension: 0.3,
        },
        {
          label: "User Prompts",
          data: c.usageTrend.map((t) => t.userMessages),
          borderColor: "#ec4899",
          backgroundColor: "rgba(236, 72, 153, 0.1)",
          fill: true,
          tension: 0.3,
        },
      ],
    };

    return (
      <div className="report-charts-grid">
        <div className="chart-panel-card">
          <div className="chart-panel-header">
            <h3>AI Guidance Assistant Usage Over Time</h3>
          </div>
          <div className="chart-wrapper-box">
            <Line
              data={lineData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  // 7. Overall Platform Activity Report Charts
  if (reportId === "overall_platform") {
    const trend = c.monthlyActivity || [];
    const lineData = {
      labels: trend.map((t) => t.month),
      datasets: [
        {
          label: "New Registrations",
          data: trend.map((t) => t.newUsers),
          borderColor: "#632cd6",
          backgroundColor: "rgba(99, 44, 214, 0.15)",
          fill: true,
          tension: 0.3,
        },
        {
          label: "Platform Engagement Events",
          data: trend.map((t) => t.engagementEvents),
          borderColor: "#10b981",
          backgroundColor: "rgba(16, 185, 129, 0.15)",
          fill: true,
          tension: 0.3,
        },
      ],
    };

    const kpiData = {
      labels: (c.kpiBreakdown || []).map((k) => k.name),
      datasets: [
        {
          data: (c.kpiBreakdown || []).map((k) => k.value),
          backgroundColor: ["#632cd6", "#ec4899", "#3b82f6", "#10b981"],
        },
      ],
    };

    return (
      <div className="report-charts-grid two-cols">
        <div className="chart-panel-card">
          <div className="chart-panel-header">
            <h3>Monthly Platform Growth &amp; Engagement</h3>
          </div>
          <div className="chart-wrapper-box">
            <Line
              data={lineData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
              }}
            />
          </div>
        </div>

        <div className="chart-panel-card">
          <div className="chart-panel-header">
            <h3>Activity Distribution</h3>
          </div>
          <div className="chart-wrapper-box">
            <Doughnut
              data={kpiData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: "bottom" } },
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
}
