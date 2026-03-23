import { useEffect, useState } from "react";
import {
  getInternships,
  deleteInternship,
  updateInternship,
} from "../../api/myInternships";
import EditInternshipForm from "./EditInternshipForm";

export default function InternshipList({ studentId, onOpen, onAddNew }) {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingInternship, setEditingInternship] = useState(null); // holds internship being edited

  useEffect(() => {
    if (!studentId) return;
    getInternships(studentId)
      .then((res) => {
        const data = res.data;
        setInternships(data);
        data.forEach((intern) => {
          const progress = getProgress(intern);
          if (progress >= 100 && intern.status !== "completed") {
            updateInternship(intern._id, { status: "completed" })
              .then((updated) => {
                setInternships((prev) =>
                  prev.map((i) =>
                    i._id === updated.data._id ? updated.data : i,
                  ),
                );
              })
              .catch((err) => console.error("Status update failed:", err));
          }
        });
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [studentId]);

  const handleDelete = async (id) => {
    if (!confirm("Delete this internship?")) return;
    await deleteInternship(id);
    setInternships((prev) => prev.filter((i) => i._id !== id));
  };

  const getProgress = (intern) => {
    const start = new Date(intern.startDate);
    const end = intern.endDate ? new Date(intern.endDate) : new Date(start);
    if (!intern.endDate) end.setMonth(end.getMonth() + intern.duration);
    return Math.min(
      100,
      Math.max(0, Math.round(((new Date() - start) / (end - start)) * 100)),
    );
  };

  const getStatus = (intern) =>
    getProgress(intern) >= 100 ? "completed" : "ongoing";

  // ── Edit success: refresh the updated internship in list ──
  const handleEditSuccess = () => {
    getInternships(studentId)
      .then((res) => setInternships(res.data))
      .catch((err) => console.error(err));
    setEditingInternship(null);
  };

  if (loading)
    return (
      <div className="flex items-center gap-2 text-sm text-[#6B7280]">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#3B6FE8] border-t-transparent" />
        Loading...
      </div>
    );

  // ── Show edit form ──
  if (editingInternship) {
    return (
      <div>
        <button
          onClick={() => setEditingInternship(null)}
          className="mb-5 flex items-center gap-2 text-sm font-medium text-[#3B6FE8] hover:text-[#2D5CD4] transition-colors"
        >
          ← Back to My Internships
        </button>
        <EditInternshipForm
          internship={editingInternship}
          onSuccess={handleEditSuccess}
          onCancel={() => setEditingInternship(null)}
        />
      </div>
    );
  }

  return (
    <div>
      {/* Header row */}
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-[#1A1D27]">
          My Internships
        </h2>
        <button
          onClick={onAddNew}
          className="flex items-center gap-2 rounded-xl bg-[#3B6FE8] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2D5CD4] transition-colors"
        >
          + Add New Internship
        </button>
      </div>

      {/* Empty state */}
      {internships.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[#D4E0FA] bg-[#F7F8FA] p-10 text-center">
          <p className="text-base text-[#6B7280]">
            No internships yet. Click "Add New Internship" to get started.
          </p>
        </div>
      )}

      {/* Cards grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {internships.map((intern) => {
          const progress = getProgress(intern);
          const status = getStatus(intern);

          return (
            <div
              key={intern._id}
              className="rounded-2xl border border-[#E8EAF0] bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)] hover:border-[#D4E0FA] hover:shadow-[0_8px_32px_rgba(59,111,232,0.09)] transition-all"
            >
              {/* Title & name */}
              <div className="mb-4">
                <h3 className="font-semibold text-[#1A1D27]">{intern.title}</h3>
                <p className="text-sm text-[#6B7280]">{intern.studentName}</p>
              </div>

              {/* Badges */}
              <div className="mb-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-[#EEF2FD] px-3 py-1 text-xs font-semibold text-[#3B6FE8]">
                  {intern.specialization}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    status === "completed"
                      ? "bg-[#E8EAF0] text-[#6B7280]"
                      : "bg-[#DCFCE7] text-[#16A34A]"
                  }`}
                >
                  {status === "completed" ? "Completed" : "Ongoing"}
                </span>
              </div>

              {/* Progress bar */}
              <div className="mb-1 flex justify-between text-xs text-[#6B7280]">
                <span>Progress</span>
                <span
                  className={`font-semibold ${progress >= 100 ? "text-[#16A34A]" : "text-[#3B6FE8]"}`}
                >
                  {progress}%
                </span>
              </div>
              <div className="mb-4 h-2 rounded-full bg-[#EEF2FD]">
                <div
                  className={`h-2 rounded-full transition-all ${
                    progress >= 100
                      ? "bg-gradient-to-r from-[#16A34A] to-[#34D399]"
                      : "bg-gradient-to-r from-[#3B6FE8] to-[#6B9FFF]"
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Duration */}
              <p className="mb-4 text-xs text-[#6B7280]">
                Duration: {intern.duration} month
                {intern.duration > 1 ? "s" : ""}
              </p>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => onOpen(intern)}
                  className="flex-1 rounded-xl border border-[#3B6FE8] py-2 text-sm font-semibold text-[#3B6FE8] hover:bg-[#EEF2FD] transition-colors"
                >
                  Open Dashboard
                </button>
                {/* ── Edit button ── */}
                <button
                  onClick={() => setEditingInternship(intern)}
                  className="rounded-xl border border-[#E8EAF0] px-3 py-2 text-sm text-[#1A1D27] hover:bg-[#F7F8FA] transition-colors"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(intern._id)}
                  className="rounded-xl border border-[#E8EAF0] px-3 py-2 text-sm text-[#DC2626] hover:bg-[#FEE2E2] transition-colors"
                >
                  🗑
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
