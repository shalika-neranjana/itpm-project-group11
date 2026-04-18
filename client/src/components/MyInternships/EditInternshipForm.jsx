import { useState } from "react";
import Swal from "sweetalert2";
import { updateInternship } from "../../api/myInternships";

const SPECIALIZATIONS = [
  "Computer Science",
  "Data Science",
  "Multimedia",
  "Software Engineering",
  "Information Technology",
  "Cybersecurity",
];

export default function EditInternshipForm({ internship, onSuccess, onCancel }) {
  const [form, setForm] = useState({
    title:           internship.title           || "",
    specialization:  internship.specialization  || "",
    supervisorName:  internship.supervisorName  || "",
    supervisorEmail: internship.supervisorEmail || "",
    startDate:       internship.startDate ? internship.startDate.split("T")[0] : "",
    duration:        internship.duration        || "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const start   = new Date(form.startDate);
      const endDate = new Date(start);
      endDate.setMonth(endDate.getMonth() + Number(form.duration));

      await updateInternship(internship._id, {
        title:           form.title,
        specialization:  form.specialization,
        supervisorName:  form.supervisorName,
        supervisorEmail: form.supervisorEmail,
        startDate:       form.startDate,
        duration:        Number(form.duration),
        endDate:         endDate.toISOString(),
      });

      await Swal.fire({
        icon: "success",
        title: "Changes Saved!",
        text: `"${form.title}" has been updated successfully.`,
        confirmButtonColor: "#3B6FE8",
        timer: 2500,
        timerProgressBar: true,
      });

      onSuccess();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: err.response?.data?.message || "Something went wrong. Please try again.",
        confirmButtonColor: "#3B6FE8",
      });
    } finally {
      setLoading(false);
    }
  };

  // Detect if any field changed from the original internship values
  const hasChanges =
    form.title           !== (internship.title           || "") ||
    form.specialization  !== (internship.specialization  || "") ||
    form.supervisorName  !== (internship.supervisorName  || "") ||
    form.supervisorEmail !== (internship.supervisorEmail || "") ||
    form.startDate       !== (internship.startDate ? internship.startDate.split("T")[0] : "") ||
    String(form.duration) !== String(internship.duration || "");

  const handleCancel = async () => {
    if (hasChanges) {
      const result = await Swal.fire({
        icon: "question",
        title: "Discard Changes?",
        text: "You have unsaved changes. Are you sure you want to cancel?",
        showCancelButton: true,
        confirmButtonText: "Yes, discard",
        cancelButtonText: "Keep editing",
        confirmButtonColor: "#DC2626",
        cancelButtonColor: "#3B6FE8",
      });
      if (result.isConfirmed) onCancel();
    } else {
      onCancel();
    }
  };

  const inputCls =
    "w-full rounded-xl border border-[#E8EAF0] bg-white px-4 py-3 text-sm text-[#1A1D27] outline-none focus:border-[#3B6FE8] transition-colors";
  const labelCls = "mb-1.5 block text-xs font-semibold text-[#1A1D27]";

  return (
    <div className="rounded-2xl border border-[#E8EAF0] bg-white p-8 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">

      {/* Header */}
      <div className="mb-6">
        <h3 className="font-display text-xl font-bold text-[#1A1D27]">Edit Internship</h3>
        <p className="mt-1 text-sm text-[#6B7280]">Update your internship details below</p>
      </div>

      {/* Read-only student info */}
      <div className="mb-6 rounded-xl border border-[#E8EAF0] bg-[#F7F8FA] px-5 py-4">
        <p className="mb-1 text-xs font-semibold text-[#6B7280]">Student</p>
        <p className="text-sm font-semibold text-[#1A1D27]">{internship.studentName}</p>
        <p className="text-xs text-[#6B7280]">{internship.studentIdNumber}</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

          <div>
            <label className={labelCls}>Internship Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className={inputCls}
              placeholder="e.g. Frontend Developer Intern"
            />
          </div>

          <div>
            <label className={labelCls}>Specialization</label>
            <select
              name="specialization"
              value={form.specialization}
              onChange={handleChange}
              required
              className={inputCls}
            >
              <option value="">Select specialization</option>
              {SPECIALIZATIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <div className="mb-3 flex items-center gap-2">
              <div className="h-px flex-1 bg-[#E8EAF0]" />
              <span className="text-xs font-semibold text-[#6B7280]">Supervisor Details</span>
              <div className="h-px flex-1 bg-[#E8EAF0]" />
            </div>
          </div>

          <div>
            <label className={labelCls}>Supervisor Name</label>
            <input
              name="supervisorName"
              value={form.supervisorName}
              onChange={handleChange}
              required
              className={inputCls}
              placeholder="e.g. Dr. Gayani Perera"
            />
          </div>

          <div>
            <label className={labelCls}>Supervisor Email</label>
            <input
              name="supervisorEmail"
              value={form.supervisorEmail}
              onChange={handleChange}
              type="email"
              className={inputCls}
              placeholder="supervisor@company.com"
            />
          </div>

          <div className="md:col-span-2">
            <div className="mb-3 flex items-center gap-2">
              <div className="h-px flex-1 bg-[#E8EAF0]" />
              <span className="text-xs font-semibold text-[#6B7280]">Duration Details</span>
              <div className="h-px flex-1 bg-[#E8EAF0]" />
            </div>
          </div>

          <div>
            <label className={labelCls}>Start Date</label>
            <input
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
              required
              type="date"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Duration (Months)</label>
            <select
              name="duration"
              value={form.duration}
              onChange={handleChange}
              required
              className={inputCls}
            >
              <option value="">Select duration</option>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>{n} Month{n > 1 ? "s" : ""}</option>
              ))}
            </select>
          </div>

        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-[#3B6FE8] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#2D5CD4] disabled:opacity-60 transition-colors"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-xl border border-[#E8EAF0] px-6 py-2.5 text-sm font-semibold text-[#6B7280] hover:bg-[#F7F8FA] transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}