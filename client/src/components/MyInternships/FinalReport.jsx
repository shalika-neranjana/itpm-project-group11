import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  getFinalReport,
  addFinalReport,
  updateFinalReport,
  deleteFinalReport,
} from "../../api/myInternships";

const EMPTY = {
  executiveSummary: "",
  keyAccomplishments: "",
  skillsAcquired: "",
  conclusionRecommendations: "",
  status: "draft",
};

function generateFinalPDF(report, studentName, studentId, internshipTitle) {
  const doc = new jsPDF();

  doc.setFillColor(59, 111, 232);
  doc.rect(0, 0, 210, 32, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Final Internship Report", 14, 14);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("InternConnect — Intelligence Career Guidance System", 14, 23);

  const statusColor =
    report.status === "submitted" ? [22, 163, 74] : [217, 119, 6];
  doc.setFillColor(...statusColor);
  doc.roundedRect(152, 8, 44, 10, 2, 2, "F");
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text(report.status === "submitted" ? "SUBMITTED" : "DRAFT", 174, 14.5, {
    align: "center",
  });

  doc.setTextColor(26, 29, 39);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Student Information", 14, 46);
  doc.setDrawColor(232, 234, 240);
  doc.setLineWidth(0.5);
  doc.line(14, 48, 196, 48);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(107, 114, 128);
  doc.text("Student Name", 14, 56);
  doc.text("Student ID", 110, 56);
  doc.text("Internship Title", 14, 68);

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(26, 29, 39);
  doc.text(studentName || "—", 14, 62);
  doc.text(studentId || "—", 110, 62);

  const titleLines = doc.splitTextToSize(internshipTitle || "—", 180);
  doc.text(titleLines, 14, 74);

  const afterStudentInfo = 74 + (titleLines.length - 1) * 6 + 12;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(26, 29, 39);
  doc.text("Executive Summary", 14, afterStudentInfo);
  doc.setDrawColor(232, 234, 240);
  doc.line(14, afterStudentInfo + 2, 196, afterStudentInfo + 2);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(26, 29, 39);
  const summaryLines = doc.splitTextToSize(report.executiveSummary || "—", 180);
  doc.text(summaryLines, 14, afterStudentInfo + 10);

  const afterSummary = afterStudentInfo + 10 + summaryLines.length * 5 + 8;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(26, 29, 39);
  doc.text("Key Accomplishments", 14, afterSummary);
  doc.setDrawColor(232, 234, 240);
  doc.line(14, afterSummary + 2, 196, afterSummary + 2);

  const accomplishmentRows =
    report.keyAccomplishments?.length > 0
      ? report.keyAccomplishments.map((a, i) => [`${i + 1}.`, a])
      : [["—", "No accomplishments recorded"]];

  autoTable(doc, {
    startY: afterSummary + 6,
    head: [["#", "Accomplishment"]],
    body: accomplishmentRows,
    theme: "grid",
    headStyles: {
      fillColor: [59, 111, 232],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 9,
      cellPadding: 4,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [26, 29, 39],
      cellPadding: 4,
      minCellHeight: 10,
    },
    alternateRowStyles: { fillColor: [247, 248, 250] },
    columnStyles: {
      0: { cellWidth: 12, halign: "center", fontStyle: "bold" },
      1: { cellWidth: 170 },
    },
    margin: { left: 14, right: 14 },
  });

  const afterAccomplishments = doc.lastAutoTable.finalY + 12;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(26, 29, 39);
  doc.text("Skills Acquired", 14, afterAccomplishments);
  doc.setDrawColor(232, 234, 240);
  doc.line(14, afterAccomplishments + 2, 196, afterAccomplishments + 2);

  if (report.skillsAcquired?.length > 0) {
    let chipX = 14,
      chipY = afterAccomplishments + 12;
    const chipH = 7;
    doc.setFontSize(9);
    report.skillsAcquired.forEach((skill) => {
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
    var afterSkills = chipY + chipH + 8;
  } else {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    doc.text("No skills recorded.", 14, afterAccomplishments + 10);
    var afterSkills = afterAccomplishments + 20;
  }

  if (afterSkills > 240) {
    doc.addPage();
    afterSkills = 20;
  }

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(26, 29, 39);
  doc.text("Conclusion & Recommendations", 14, afterSkills);
  doc.setDrawColor(232, 234, 240);
  doc.line(14, afterSkills + 2, 196, afterSkills + 2);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(26, 29, 39);
  const conclusionLines = doc.splitTextToSize(
    report.conclusionRecommendations || "—",
    180,
  );
  doc.text(conclusionLines, 14, afterSkills + 10);

  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
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
    doc.text(`Page ${i} of ${pageCount}`, 155, 286);
    doc.text("InternConnect", 174, 292);
  }

  return doc;
}

export default function FinalReport({
  internshipId,
  internshipTitle,
  supervisorEmail,
  supervisorName,
}) {
  const [report, setReport] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pdfStatus, setPdfStatus] = useState(null);
  const [emailSent, setEmailSent] = useState(false);
  const [showEmailBox, setShowEmailBox] = useState(false);
  const [emailInput, setEmailInput] = useState("");

  const studentData = JSON.parse(localStorage.getItem("student"));
  const studentName =
    `${studentData?.firstName ?? ""} ${studentData?.lastName ?? ""}`.trim();
  const studentId = studentData?.studentId ?? "";

  useEffect(() => {
    getFinalReport(internshipId)
      .then((res) => {
        if (res.data) {
          setReport(res.data);
          setForm({
            executiveSummary: res.data.executiveSummary ?? "",
            keyAccomplishments: res.data.keyAccomplishments?.join(", ") ?? "",
            skillsAcquired: res.data.skillsAcquired?.join(", ") ?? "",
            conclusionRecommendations: res.data.conclusionRecommendations ?? "",
            status: res.data.status ?? "draft",
          });
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [internshipId]);

  // Pre-fill email input from supervisorEmail prop when box opens
  useEffect(() => {
    if (showEmailBox) {
      setEmailInput(supervisorEmail || "");
    }
  }, [showEmailBox, supervisorEmail]);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const buildPayload = (status) => ({
    internship: internshipId,
    executiveSummary: form.executiveSummary,
    conclusionRecommendations: form.conclusionRecommendations,
    keyAccomplishments: form.keyAccomplishments
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    skillsAcquired: form.skillsAcquired
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    status,
  });

  const handleSaveDraft = async () => {
    try {
      const payload = buildPayload("draft");
      if (report) {
        const res = await updateFinalReport(report._id, payload);
        setReport(res.data);
      } else {
        const res = await addFinalReport(payload);
        setReport(res.data);
      }
      setEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async () => {
    try {
      const payload = buildPayload("submitted");
      if (report) {
        const res = await updateFinalReport(report._id, payload);
        setReport(res.data);
      } else {
        const res = await addFinalReport(payload);
        setReport(res.data);
      }
      setEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete final report?")) return;
    try {
      await deleteFinalReport(report._id);
      setReport(null);
      setForm(EMPTY);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadPDF = () => {
    setPdfStatus("generating");
    try {
      const doc = generateFinalPDF(
        report,
        studentName,
        studentId,
        internshipTitle,
      );
      const filename = `Final_Report_${studentId}_${(internshipTitle || "Internship").replace(/\s+/g, "_")}.pdf`;
      doc.save(filename);
      setPdfStatus("done");
      setTimeout(() => setPdfStatus(null), 2500);
    } catch (err) {
      console.error("PDF error:", err);
      setPdfStatus(null);
    }
  };

  // ── Send via mailto ────────────────────────────────────
  const handleSendEmail = () => {
    if (!emailInput.trim()) return;

    // First download the PDF so user has it ready to attach
    const doc = generateFinalPDF(
      report,
      studentName,
      studentId,
      internshipTitle,
    );
    const filename = `Final_Report_${studentId}_${(internshipTitle || "Internship").replace(/\s+/g, "_")}.pdf`;
    doc.save(filename);

    // Build mailto link
    const subject = encodeURIComponent(
      `Final Internship Report — ${internshipTitle} | ${studentName}`,
    );
    const body = encodeURIComponent(
      `Dear ${supervisorName || "Supervisor"},\n\nPlease find attached my Final Internship Report for the position of ${internshipTitle}.\n\nThis report has been submitted via InternConnect.\n\nBest regards,\n${studentName}\n${studentId}`,
    );

    // Open email client with pre-filled fields
    window.location.href = `mailto:${emailInput.trim()}?subject=${subject}&body=${body}`;

    setEmailSent(true);
    setShowEmailBox(false);
    setTimeout(() => setEmailSent(false), 4000);
  };

  const inputCls =
    "w-full rounded-xl border border-[#E8EAF0] bg-white px-4 py-2.5 text-sm text-[#1A1D27] outline-none focus:border-[#3B6FE8] transition-colors";
  const labelCls = "mb-1 block text-xs font-semibold text-[#1A1D27]";
  const showForm = !report || editing;

  if (loading)
    return (
      <div className="flex items-center gap-2 text-sm text-[#6B7280]">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#3B6FE8] border-t-transparent" />
        Loading report...
      </div>
    );

  return (
    <div>
      {/* ── Header ── */}
      <div className="mb-5 flex items-center justify-between">
        <h3 className="font-display text-xl font-bold text-[#1A1D27]">
          Final Report
        </h3>
        {report && !editing && (
          <div className="flex flex-wrap gap-2">
            {/* Download PDF */}
            <button
              onClick={handleDownloadPDF}
              disabled={pdfStatus === "generating"}
              className="flex items-center gap-2 rounded-xl bg-[#FEE2E2] px-4 py-2 text-sm font-semibold text-[#DC2626] hover:bg-[#FECACA] disabled:opacity-60 transition-colors"
            >
              {pdfStatus === "generating" ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#3B6FE8] border-t-transparent" />{" "}
                  Generating...
                </>
              ) : pdfStatus === "done" ? (
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
              onClick={() => setShowEmailBox((prev) => !prev)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                emailSent
                  ? "bg-[#DCFCE7] text-[#16A34A]"
                  : showEmailBox
                    ? "bg-[#3B6FE8] text-white"
                    : "border border-[#D1FAE5] bg-[#D1FAE5] text-[#059669] hover:bg-[#A7F3D0]"
              }`}
            >
              {emailSent ? (
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

            <button
              onClick={() => setEditing(true)}
              className="rounded-xl border border-[#E8EAF0] px-4 py-2 text-sm font-semibold text-[#1A1D27] hover:bg-[#F7F8FA] transition-colors"
            >
              ✏️ Edit
            </button>
            <button
              onClick={handleDelete}
              className="rounded-xl border border-[#E8EAF0] px-4 py-2 text-sm font-semibold text-[#DC2626] hover:bg-[#FEE2E2] transition-colors"
            >
              🗑️ Delete
            </button>
          </div>
        )}
      </div>

      {/* ── Email input box ── */}
      {showEmailBox && report && !editing && (
        <div className="mb-5 rounded-2xl border border-[#E8EAF0] bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
          <p className="mb-1 text-sm font-semibold text-[#1A1D27]">
            Send to Supervisor
          </p>
          <p className="mb-4 text-xs text-[#6B7280]">
            This will download the PDF and open your email app with the
            supervisor's address pre-filled. Attach the downloaded PDF before
            sending.
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="supervisor@company.com"
              className="flex-1 rounded-xl border border-[#E8EAF0] bg-white px-4 py-2.5 text-sm text-[#1A1D27] outline-none focus:border-[#3B6FE8] transition-colors"
            />
            <button
              onClick={handleSendEmail}
              disabled={!emailInput.trim()}
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
              onClick={() => setShowEmailBox(false)}
              className="rounded-xl border border-[#E8EAF0] px-4 py-2 text-sm font-semibold text-[#6B7280] hover:bg-[#F7F8FA] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── View mode ── */}
      {report && !editing && (
        <div className="space-y-5 rounded-2xl border border-[#E8EAF0] bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                report.status === "submitted"
                  ? "bg-[#DCFCE7] text-[#16A34A]"
                  : "bg-[#FEF3C7] text-[#D97706]"
              }`}
            >
              {report.status === "submitted" ? "✅ Submitted" : "📝 Draft"}
            </span>
          </div>

          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
              Executive Summary
            </p>
            <p className="text-sm leading-relaxed text-[#1A1D27]">
              {report.executiveSummary || "—"}
            </p>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
              Key Accomplishments
            </p>
            {report.keyAccomplishments?.length > 0 ? (
              <ul className="space-y-1.5">
                {report.keyAccomplishments.map((a, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-[#1A1D27]"
                  >
                    <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-[#EEF2FD] text-[10px] font-bold text-[#3B6FE8]">
                      {i + 1}
                    </span>
                    {a}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[#6B7280]">—</p>
            )}
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
              Skills Acquired
            </p>
            {report.skillsAcquired?.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {report.skillsAcquired.map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-[#EEF2FD] px-2.5 py-0.5 text-xs font-semibold text-[#3B6FE8]"
                  >
                    {s}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#6B7280]">—</p>
            )}
          </div>

          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
              Conclusion &amp; Recommendations
            </p>
            <p className="text-sm leading-relaxed text-[#1A1D27]">
              {report.conclusionRecommendations || "—"}
            </p>
          </div>
        </div>
      )}

      {/* ── Form mode ── */}
      {showForm && (
        <div className="rounded-2xl border border-[#E8EAF0] bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Executive Summary</label>
              <textarea
                name="executiveSummary"
                value={form.executiveSummary}
                onChange={handleChange}
                rows={4}
                className={inputCls}
                placeholder="Write a summary of your overall internship experience..."
              />
            </div>
            <div>
              <label className={labelCls}>
                Key Accomplishments (comma-separated)
              </label>
              <textarea
                name="keyAccomplishments"
                value={form.keyAccomplishments}
                onChange={handleChange}
                rows={3}
                className={inputCls}
                placeholder="Built login system, Deployed to AWS, Reduced load time by 40%"
              />
            </div>
            <div>
              <label className={labelCls}>
                Skills Acquired (comma-separated)
              </label>
              <input
                name="skillsAcquired"
                value={form.skillsAcquired}
                onChange={handleChange}
                className={inputCls}
                placeholder="React, Node.js, Docker, Agile"
              />
            </div>
            <div>
              <label className={labelCls}>
                Conclusion &amp; Recommendations
              </label>
              <textarea
                name="conclusionRecommendations"
                value={form.conclusionRecommendations}
                onChange={handleChange}
                rows={4}
                className={inputCls}
                placeholder="Your conclusion and recommendations for future interns..."
              />
            </div>
          </div>
          <div className="mt-5 flex gap-2">
            <button
              onClick={handleSaveDraft}
              className="rounded-xl bg-[#3B6FE8] px-5 py-2 text-sm font-semibold text-white hover:bg-[#2D5CD4] transition-colors"
            >
              Save Draft
            </button>
            <button
              onClick={handleSubmit}
              className="rounded-xl bg-[#16A34A] px-5 py-2 text-sm font-semibold text-white hover:bg-[#15803D] transition-colors"
            >
              Submit Final Report
            </button>
            {editing && (
              <button
                onClick={() => setEditing(false)}
                className="rounded-xl border border-[#E8EAF0] px-5 py-2 text-sm font-semibold text-[#6B7280] hover:bg-[#F7F8FA] transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Empty state ── */}
      {!report && !showForm && (
        <div className="rounded-2xl border border-dashed border-[#D4E0FA] bg-[#F7F8FA] p-10 text-center">
          <p className="text-sm text-[#6B7280]">
            No final report yet. Click "Create Report" to get started.
          </p>
        </div>
      )}
    </div>
  );
}
