import { useEffect, useState, useMemo } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  getReports,
  addReport,
  updateReport,
  deleteReport,
} from "../../api/myInternships";
import { confirm as swalConfirm } from '../../utils/swal'

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 8 }, (_, i) => currentYear - 5 + i);

const EMPTY = {
  monthName: "",
  monthYear: String(currentYear),
  weekSummary: { week01: "", week02: "", week03: "", week04: "" },
  skillsLearned: "",
};

function generatePDF(report, studentName, studentId) {
  const doc = new jsPDF();

  doc.setFillColor(59, 111, 232);
  doc.rect(0, 0, 210, 30, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(17);
  doc.setFont("helvetica", "bold");
  doc.text("Monthly Internship Report", 14, 13);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("InternConnect — Intelligence Career Guidance System", 14, 22);

  doc.setTextColor(26, 29, 39);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Student Information", 14, 42);
  doc.setDrawColor(232, 234, 240);
  doc.setLineWidth(0.5);
  doc.line(14, 44, 196, 44);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(107, 114, 128);
  doc.text("Student Name", 14, 52);
  doc.text("Student ID", 110, 52);
  doc.text("Report Month", 14, 64);

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(26, 29, 39);
  doc.text(studentName || "—", 14, 58);
  doc.text(studentId || "—", 110, 58);
  doc.text(report.month || "—", 14, 70);

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(26, 29, 39);
  doc.text("Weekly Summary", 14, 84);
  doc.setDrawColor(232, 234, 240);
  doc.line(14, 86, 196, 86);

  const weekRows = ["week01", "week02", "week03", "week04"].map((wk, i) => [
    `Week ${i + 1}`,
    report.weekSummary?.[wk] || "—",
  ]);

  autoTable(doc, {
    startY: 90,
    head: [["Week", "Summary of Activities"]],
    body: weekRows,
    theme: "grid",
    headStyles: {
      fillColor: [59, 111, 232],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 10,
      cellPadding: 5,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [26, 29, 39],
      cellPadding: 5,
      minCellHeight: 14,
    },
    alternateRowStyles: { fillColor: [247, 248, 250] },
    columnStyles: {
      0: { cellWidth: 28, fontStyle: "bold", halign: "center" },
      1: { cellWidth: 154 },
    },
    margin: { left: 14, right: 14 },
  });

  const afterTable = doc.lastAutoTable.finalY + 12;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(26, 29, 39);
  doc.text("Skills Learned", 14, afterTable);
  doc.setDrawColor(232, 234, 240);
  doc.line(14, afterTable + 2, 196, afterTable + 2);

  if (report.skillsLearned?.length > 0) {
    let chipX = 14,
      chipY = afterTable + 12;
    const chipH = 7;
    doc.setFontSize(9);
    report.skillsLearned.forEach((skill) => {
      const textW = doc.getTextWidth(skill);
      const chipW = textW + 8;
      if (chipX + chipW > 196) {
        chipX = 14;
        chipY += chipH + 4;
      }
      doc.setFillColor(238, 242, 253);
      doc.roundedRect(chipX, chipY - 5, chipW, chipH, 2, 2, "F");
      doc.setTextColor(59, 111, 232);
      doc.setFont("helvetica", "bold");
      doc.text(skill, chipX + 4, chipY);
      chipX += chipW + 4;
    });
  } else {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    doc.text("No skills recorded for this month.", 14, afterTable + 12);
  }

  doc.setDrawColor(232, 234, 240);
  doc.line(14, 280, 196, 280);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(107, 114, 128);
  doc.text(
    `Generated on ${new Date().toLocaleDateString("en-MY", { year: "numeric", month: "long", day: "numeric" })}`,
    14,
    286,
  );
  doc.text("InternConnect", 163, 286);

  return doc;
}

export default function MonthlyReport({
  internshipId,
  supervisorEmail,
  supervisorName,
}) {
  const [reports, setReports] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pdfStatus, setPdfStatus] = useState({});
  const [monthError, setMonthError] = useState("");

  // ── Email state — tracked per report ID ──
  const [emailBox, setEmailBox] = useState({});
  const [emailInputs, setEmailInputs] = useState({});
  const [emailSent, setEmailSent] = useState({});

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilter, setShowFilter] = useState(false);

  const studentData = JSON.parse(localStorage.getItem("student"));
  const studentName =
    `${studentData?.firstName ?? ""} ${studentData?.lastName ?? ""}`.trim();
  const studentId = studentData?.studentId ?? "";

  useEffect(() => {
    getReports(internshipId)
      .then((res) => setReports(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [internshipId]);

  const handleChange = (e) => {
    setMonthError("");
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleWeekChange = (e) =>
    setForm((prev) => ({
      ...prev,
      weekSummary: { ...prev.weekSummary, [e.target.name]: e.target.value },
    }));

  const openAdd = () => {
    setForm(EMPTY);
    setEditId(null);
    setMonthError("");
    setShowForm(true);
  };

  const openEdit = (report) => {
    const parts = report.month?.split(" ") ?? [];
    const monthName = parts[0] ?? "";
    const monthYear = parts[1] ?? String(currentYear);
    setForm({
      monthName,
      monthYear,
      weekSummary: report.weekSummary ?? {
        week01: "",
        week02: "",
        week03: "",
        week04: "",
      },
      skillsLearned: report.skillsLearned?.join(", ") ?? "",
    });
    setEditId(report._id);
    setMonthError("");
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMonthError("");

    if (!form.monthName) {
      setMonthError("Please select a month.");
      return;
    }

    const combinedMonth = `${form.monthName} ${form.monthYear}`;
    const isDuplicate = reports.some(
      (r) => r.month === combinedMonth && r._id !== editId,
    );
    if (isDuplicate) {
      setMonthError(`A report for ${combinedMonth} already exists.`);
      return;
    }

    const payload = {
      internship: internshipId,
      month: combinedMonth,
      weekSummary: form.weekSummary,
      skillsLearned: form.skillsLearned
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };
    try {
      if (editId) {
        const res = await updateReport(editId, payload);
        setReports((prev) =>
          prev.map((r) => (r._id === editId ? res.data : r)),
        );
      } else {
        const res = await addReport(payload);
        setReports((prev) => [...prev, res.data]);
      }
      setShowForm(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    const ok = await swalConfirm('Delete this report?')
    if (!ok) return
    await deleteReport(id);
    setReports((prev) => prev.filter((r) => r._id !== id));
  };

  const handleDownloadPDF = (report) => {
    setPdfStatus((prev) => ({ ...prev, [report._id]: "generating" }));
    try {
      const doc = generatePDF(report, studentName, studentId);
      const filename = `Monthly_Report_${report.month.replace(/\s+/g, "_")}.pdf`;
      doc.save(filename);
      setPdfStatus((prev) => ({ ...prev, [report._id]: "done" }));
      setTimeout(
        () => setPdfStatus((prev) => ({ ...prev, [report._id]: null })),
        2500,
      );
    } catch (err) {
      console.error("PDF generation error:", err);
      setPdfStatus((prev) => ({ ...prev, [report._id]: null }));
    }
  };

  //  Toggle email box per report
  const toggleEmailBox = (id) => {
    setEmailBox((prev) => ({ ...prev, [id]: !prev[id] }));
    // Pre-fill supervisor email when opening
    if (!emailBox[id]) {
      setEmailInputs((prev) => ({ ...prev, [id]: supervisorEmail || "" }));
    }
  };

  // ── Send via mailto per report ──
  const handleSendEmail = (report) => {
    const email = emailInputs[report._id]?.trim();
    if (!email) return;

    // Download PDF first
    const doc = generatePDF(report, studentName, studentId);
    const filename = `Monthly_Report_${report.month.replace(/\s+/g, "_")}.pdf`;
    doc.save(filename);

    // Build mailto
    const subject = encodeURIComponent(
      `Monthly Internship Report — ${report.month} | ${studentName}`,
    );
    const body = encodeURIComponent(
      `Dear ${supervisorName || "Supervisor"},\n\nPlease find attached my Monthly Internship Report for ${report.month}.\n\nThis report was submitted via InternConnect.\n\nBest regards,\n${studentName}\n${studentId}`,
    );

    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;

    setEmailSent((prev) => ({ ...prev, [report._id]: true }));
    setEmailBox((prev) => ({ ...prev, [report._id]: false }));
    setTimeout(
      () => setEmailSent((prev) => ({ ...prev, [report._id]: false })),
      4000,
    );
  };

  const clearFilters = () => {
    setSearch("");
    setSortBy("newest");
  };
  const hasActiveFilters = search || sortBy !== "newest";

  const filteredReports = useMemo(() => {
    let result = [...reports];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.month?.toLowerCase().includes(q) ||
          Object.values(r.weekSummary || {}).some((w) =>
            w?.toLowerCase().includes(q),
          ) ||
          r.skillsLearned?.some((s) => s.toLowerCase().includes(q)),
      );
    }
    if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === "oldest") {
      result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === "mostSkills") {
      result.sort(
        (a, b) =>
          (b.skillsLearned?.length ?? 0) - (a.skillsLearned?.length ?? 0),
      );
    }
    return result;
  }, [reports, search, sortBy]);

  const totalSkills = useMemo(
    () => [...new Set(reports.flatMap((r) => r.skillsLearned ?? []))].length,
    [reports],
  );

  const selectCls =
    "w-full rounded-xl border border-[#E8EAF0] bg-white px-4 py-2.5 text-sm text-[#1A1D27] outline-none focus:border-[#3B6FE8] transition-colors cursor-pointer";
  const selectErrCls =
    "w-full rounded-xl border border-[#DC2626] bg-white px-4 py-2.5 text-sm text-[#1A1D27] outline-none transition-colors cursor-pointer";
  const inputCls =
    "w-full rounded-xl border border-[#E8EAF0] bg-white px-4 py-2.5 text-sm text-[#1A1D27] outline-none focus:border-[#3B6FE8] transition-colors";
  const labelCls = "mb-1 block text-xs font-semibold text-[#1A1D27]";

  if (loading)
    return (
      <div className="flex items-center gap-2 text-sm text-[#6B7280]">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#3B6FE8] border-t-transparent" />
        Loading reports...
      </div>
    );

  return (
    <div>
      {/* ── Header ── */}
      <div className="mb-5 flex items-center justify-between">
        <h3 className="font-display text-xl font-bold text-[#1A1D27]">
          Monthly Reports
        </h3>
        <button
          onClick={openAdd}
          className="rounded-xl bg-[#3B6FE8] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2D5CD4] transition-colors"
        >
          + Add Report
        </button>
      </div>

      {/* ── Stats row ── */}
      {reports.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-3">
          <div className="rounded-xl border border-[#E8EAF0] bg-white px-4 py-2.5">
            <p className="text-xs text-[#6B7280]">Total Reports</p>
            <p className="text-lg font-bold text-[#1A1D27]">{reports.length}</p>
          </div>
          <div className="rounded-xl border border-[#E8EAF0] bg-white px-4 py-2.5">
            <p className="text-xs text-[#6B7280]">Unique Skills</p>
            <p className="text-lg font-bold text-[#3B6FE8]">{totalSkills}</p>
          </div>
          <div className="rounded-xl border border-[#E8EAF0] bg-white px-4 py-2.5">
            <p className="text-xs text-[#6B7280]">Weeks Logged</p>
            <p className="text-lg font-bold text-[#7C3AED]">
              {reports.reduce(
                (sum, r) =>
                  sum +
                  Object.values(r.weekSummary || {}).filter(Boolean).length,
                0,
              )}
            </p>
          </div>
        </div>
      )}

      {/* ── Search & Filter bar ── */}
      {reports.length > 0 && (
        <div className="mb-5 space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280]"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search by month, week summary or skill..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-[#E8EAF0] bg-white py-2.5 pl-10 pr-9 text-sm text-[#1A1D27] outline-none focus:border-[#3B6FE8] transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1A1D27]"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilter((prev) => !prev)}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${
                showFilter || hasActiveFilters
                  ? "border-[#3B6FE8] bg-[#EEF2FD] text-[#3B6FE8]"
                  : "border-[#E8EAF0] bg-white text-[#6B7280] hover:bg-[#F7F8FA]"
              }`}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
              Sort
              {hasActiveFilters && (
                <span className="flex h-2 w-2 rounded-full bg-[#3B6FE8]" />
              )}
            </button>
          </div>

          {showFilter && (
            <div className="rounded-2xl border border-[#E8EAF0] bg-white p-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
              <div>
                <label className={labelCls}>Sort By</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "newest", label: "Newest First" },
                    { value: "oldest", label: "Oldest First" },
                    { value: "mostSkills", label: "Most Skills" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSortBy(opt.value)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                        sortBy === opt.value
                          ? "border-[#3B6FE8] bg-[#3B6FE8] text-white"
                          : "border-[#E8EAF0] bg-white text-[#6B7280] hover:bg-[#F7F8FA]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              {hasActiveFilters && (
                <div className="mt-3 border-t border-[#E8EAF0] pt-3">
                  <button
                    onClick={clearFilters}
                    className="text-xs font-semibold text-[#DC2626] hover:underline"
                  >
                    ✕ Clear all
                  </button>
                </div>
              )}
            </div>
          )}

          {search && (
            <p className="text-xs text-[#6B7280]">
              Showing{" "}
              <span className="font-semibold text-[#1A1D27]">
                {filteredReports.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-[#1A1D27]">
                {reports.length}
              </span>{" "}
              reports
            </p>
          )}
        </div>
      )}

      {/* ── Add / Edit Form ── */}
      {showForm && (
        <div className="mb-6 rounded-2xl border border-[#E8EAF0] bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
          <h4 className="mb-5 font-semibold text-[#1A1D27]">
            {editId ? "Edit Report" : "New Monthly Report"}
          </h4>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className={labelCls}>Report Month</label>
              <div className="flex gap-3">
                <div className="flex-1">
                  <select
                    name="monthName"
                    value={form.monthName}
                    onChange={handleChange}
                    className={monthError ? selectErrCls : selectCls}
                  >
                    <option value="">Select month</option>
                    {MONTHS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ width: "120px" }}>
                  <select
                    name="monthYear"
                    value={form.monthYear}
                    onChange={handleChange}
                    className={selectCls}
                  >
                    {YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {monthError && (
                <div className="mt-2 flex items-center gap-2 rounded-xl border border-[#DC2626] bg-[#FEE2E2] px-4 py-2.5">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#DC2626"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <p className="text-xs font-semibold text-[#DC2626]">
                    {monthError}
                  </p>
                </div>
              )}
              {form.monthName && (
                <p className="mt-1.5 text-xs text-[#6B7280]">
                  Report will be saved as:{" "}
                  <span className="font-semibold text-[#1A1D27]">
                    {form.monthName} {form.monthYear}
                  </span>
                </p>
              )}
            </div>

            <p className="mb-2 text-xs font-semibold text-[#1A1D27]">
              Week Summaries
            </p>
            <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              {["week01", "week02", "week03", "week04"].map((wk, i) => (
                <div key={wk}>
                  <label className={labelCls}>Week {i + 1}</label>
                  <textarea
                    name={wk}
                    value={form.weekSummary[wk]}
                    onChange={handleWeekChange}
                    rows={3}
                    className={inputCls}
                    placeholder={`What did you do in week ${i + 1}?`}
                  />
                </div>
              ))}
            </div>

            <div className="mb-5">
              <label className={labelCls}>
                Skills Learned (comma-separated)
              </label>
              <input
                name="skillsLearned"
                value={form.skillsLearned}
                onChange={handleChange}
                className={inputCls}
                placeholder="React, Node.js, REST APIs, Agile"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="rounded-xl bg-[#3B6FE8] px-5 py-2 text-sm font-semibold text-white hover:bg-[#2D5CD4] transition-colors"
              >
                {editId ? "Update Report" : "Save Report"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setMonthError("");
                }}
                className="rounded-xl border border-[#E8EAF0] px-5 py-2 text-sm font-semibold text-[#6B7280] hover:bg-[#F7F8FA] transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Empty state ── */}
      {reports.length === 0 && !showForm && (
        <div className="rounded-2xl border border-dashed border-[#D4E0FA] bg-[#F7F8FA] p-10 text-center">
          <p className="text-sm text-[#6B7280]">
            No monthly reports yet. Click "+ Add Report" to create one.
          </p>
        </div>
      )}

      {/* ── No results ── */}
      {reports.length > 0 && filteredReports.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[#D4E0FA] bg-[#F7F8FA] p-8 text-center">
          <p className="text-sm font-semibold text-[#1A1D27]">
            No reports found
          </p>
          <p className="mt-1 text-xs text-[#6B7280]">
            Try a different search term
          </p>
          <button
            onClick={clearFilters}
            className="mt-3 text-xs font-semibold text-[#3B6FE8] hover:underline"
          >
            Clear search
          </button>
        </div>
      )}

      {/* ── Report cards ── */}
      <div className="flex flex-col gap-4">
        {filteredReports.map((r) => (
          <div
            key={r._id}
            className="rounded-2xl border border-[#E8EAF0] bg-white p-6 transition-all hover:border-[#D4E0FA] hover:shadow-[0_4px_16px_rgba(59,111,232,0.07)]"
          >
            {/* Card header */}
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-[#1A1D27]">{r.month}</h4>
                <p className="mt-0.5 text-xs text-[#6B7280]">
                  {r.skillsLearned?.length > 0
                    ? `${r.skillsLearned.length} skill${r.skillsLearned.length > 1 ? "s" : ""} recorded`
                    : "No skills recorded"}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(r)}
                  className="rounded-lg border border-[#E8EAF0] px-3 py-1.5 text-xs font-medium text-[#1A1D27] hover:bg-[#F7F8FA] transition-colors"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDelete(r._id)}
                  className="rounded-lg border border-[#E8EAF0] px-3 py-1.5 text-xs font-medium text-[#DC2626] hover:bg-[#FEE2E2] transition-colors"
                >
                  🗑️
                </button>
              </div>
            </div>

            {/* Week summaries */}
            <div className="mb-4 grid grid-cols-1 gap-2 md:grid-cols-2">
              {["week01", "week02", "week03", "week04"].map((wk, i) =>
                r.weekSummary?.[wk] ? (
                  <div key={wk} className="rounded-xl bg-[#F7F8FA] p-3">
                    <p className="mb-1 text-xs font-semibold text-[#3B6FE8]">
                      Week {i + 1}
                    </p>
                    <p className="text-xs leading-relaxed text-[#6B7280]">
                      {r.weekSummary[wk]}
                    </p>
                  </div>
                ) : null,
              )}
            </div>

            {/* Skills chips */}
            {r.skillsLearned?.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-1.5">
                {r.skillsLearned.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-[#EEF2FD] px-2.5 py-0.5 text-xs font-semibold text-[#3B6FE8]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}

            {/* ── Action buttons ── */}
            <div className="flex flex-wrap gap-2 border-t border-[#E8EAF0] pt-4">
              {/* Download PDF */}
              <button
                onClick={() => handleDownloadPDF(r)}
                disabled={pdfStatus[r._id] === "generating"}
                className="flex items-center gap-2 rounded-xl bg-[#FEE2E2] px-4 py-2 text-sm font-semibold text-[#DC2626] hover:bg-[#FECACA] disabled:opacity-60 transition-colors"
              >
                {pdfStatus[r._id] === "generating" ? (
                  <>
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#3B6FE8] border-t-transparent" />{" "}
                    Generating...
                  </>
                ) : pdfStatus[r._id] === "done" ? (
                  <>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>{" "}
                    Downloaded!
                  </>
                ) : (
                  <>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="12" y1="18" x2="12" y2="12" />
                      <polyline points="9 15 12 18 15 15" />
                    </svg>{" "}
                    Download PDF
                  </>
                )}
              </button>

              {/* Send to Supervisor */}
              <button
                onClick={() => toggleEmailBox(r._id)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                  emailSent[r._id]
                    ? "bg-[#DCFCE7] text-[#16A34A]"
                    : emailBox[r._id]
                      ? "bg-[#3B6FE8] text-white"
                      : "border border-[#D1FAE5] bg-[#D1FAE5] text-[#059669] hover:bg-[#A7F3D0]"
                }`}
              >
                {emailSent[r._id] ? (
                  <>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>{" "}
                    Email Client Opened!
                  </>
                ) : (
                  <>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>{" "}
                    Send to Supervisor
                  </>
                )}
              </button>
            </div>

            {/* ── Email input box per card ── */}
            {emailBox[r._id] && (
              <div className="mt-3 rounded-2xl border border-[#E8EAF0] bg-[#F7F8FA] p-4">
                <p className="mb-1 text-sm font-semibold text-[#1A1D27]">
                  Send {r.month} Report to Supervisor
                </p>
                <p className="mb-3 text-xs text-[#6B7280]">
                  This will download the PDF and open your email app with the
                  address pre-filled. Attach the downloaded PDF before sending.
                </p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={emailInputs[r._id] ?? ""}
                    onChange={(e) =>
                      setEmailInputs((prev) => ({
                        ...prev,
                        [r._id]: e.target.value,
                      }))
                    }
                    placeholder="supervisor@company.com"
                    className="flex-1 rounded-xl border border-[#E8EAF0] bg-white px-4 py-2.5 text-sm text-[#1A1D27] outline-none focus:border-[#3B6FE8] transition-colors"
                  />
                  <button
                    onClick={() => handleSendEmail(r)}
                    disabled={!emailInputs[r._id]?.trim()}
                    className="flex items-center gap-2 rounded-xl bg-[#3B6FE8] px-5 py-2 text-sm font-semibold text-white hover:bg-[#2D5CD4] disabled:opacity-50 transition-colors"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                    Open Email
                  </button>
                  <button
                    onClick={() =>
                      setEmailBox((prev) => ({ ...prev, [r._id]: false }))
                    }
                    className="rounded-xl border border-[#E8EAF0] px-4 py-2 text-sm font-semibold text-[#6B7280] hover:bg-[#F7F8FA] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
