import { useState } from "react";
import { addInternship } from "../../api/myInternships";

const SPECIALIZATIONS = [
  "Computer Science",
  "Data Science",
  "Multimedia",
  "Software Engineering",
  "Information Technology",
  "Cybersecurity",
];

export default function AddInternshipForm({ onSuccess, onCancel }) {
  const [form, setForm] = useState({
    title:           "",
    specialization:  "",
    supervisorName:  "",
    supervisorEmail: "",
    startDate:       "",
    duration:        "",
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Get student info from session
      const studentData     = JSON.parse(localStorage.getItem("student"));
      const studentIdNumber = studentData?.studentId;
      const studentName     = `${studentData?.firstName} ${studentData?.lastName}`;

      if (!studentIdNumber) {
        setError("Session expired. Please log in again.");
        setLoading(false);
        return;
      }

      // Auto-calculate endDate
      const start   = new Date(form.startDate);
      const endDate = new Date(start);
      endDate.setMonth(endDate.getMonth() + Number(form.duration));

      await addInternship({
        studentIdNumber,              
        studentName,                  
        title:           form.title,
        specialization:  form.specialization,
        supervisorName:  form.supervisorName,
        supervisorEmail: form.supervisorEmail,
        startDate:       form.startDate,
        duration:        Number(form.duration),
        endDate:         endDate.toISOString(),
      });

      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full rounded-xl border border-[#E8EAF0] bg-white px-4 py-3 text-sm text-[#1A1D27] outline-none focus:border-[#3B6FE8] transition-colors";
  const labelCls = "mb-1.5 block text-xs font-semibold text-[#1A1D27]";

  // Show logged-in student info at top of form
  const studentData = JSON.parse(localStorage.getItem("student"));

  return (
    <div className="rounded-2xl border border-[#E8EAF0] bg-white p-8 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
      <h3 className="font-display mb-6 text-xl font-bold text-[#1A1D27]">
        Add New Internship
      </h3>

      {/* Auto-filled student info — read only display */}
      <div className="mb-6 rounded-xl border border-[#E8EAF0] bg-[#F7F8FA] px-5 py-4">
        <p className="mb-1 text-xs font-semibold text-[#6B7280]">Submitting as</p>
        <p className="text-sm font-semibold text-[#1A1D27]">
          {studentData?.firstName} {studentData?.lastName}
        </p>
        <p className="text-xs text-[#6B7280]">{studentData?.studentId}</p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-[#FEE2E2] px-4 py-3 text-sm text-[#DC2626]">
          {error}
        </div>
      )}

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
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
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
              className={inputCls}
              type="email"
              placeholder="supervisor@company.com"
            />
          </div>

          <div>
            <label className={labelCls}>Start Date</label>
            <input
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
              required
              className={inputCls}
              type="date"
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
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                <option key={n} value={n}>
                  {n} Month{n > 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </div>

        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-[#3B6FE8] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#2D5CD4] disabled:opacity-60"
          >
            {loading ? "Saving..." : "Add Internship"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-[#E8EAF0] px-6 py-2.5 text-sm font-semibold text-[#6B7280] hover:bg-[#F7F8FA]"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}