import { useState } from "react";
import Swal from "sweetalert2";
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

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const studentData     = JSON.parse(localStorage.getItem("student"));
      const studentIdNumber = studentData?.studentId;
      const studentName     = `${studentData?.firstName} ${studentData?.lastName}`;

      if (!studentIdNumber) {
        Swal.fire({
          icon: "warning",
          title: "Session Expired",
          text: "Please log in again to continue.",
          confirmButtonColor: "#3B6FE8",
        });
        setLoading(false);
        return;
      }

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

      await Swal.fire({
        icon: "success",
        title: "Internship Added!",
        text: `"${form.title}" has been successfully added.`,
        confirmButtonColor: "#3B6FE8",
        timer: 2500,
        timerProgressBar: true,
      });

      onSuccess();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Something Went Wrong",
        text: err.response?.data?.message || "Unable to add internship. Please try again.",
        confirmButtonColor: "#3B6FE8",
      });
    } finally {
      setLoading(false);
    }
  };

  // Confirm before cancelling if form has any filled fields
  const handleCancel = async () => {
    const hasData = Object.values(form).some((v) => v !== "");

    if (hasData) {
      const result = await Swal.fire({
        icon: "question",
        title: "Discard Changes?",
        text: "You have unsaved data. Are you sure you want to cancel?",
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

  const studentData = JSON.parse(localStorage.getItem("student"));

  return (
    <div className="rounded-2xl border border-[#E8EAF0] bg-white p-8 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
      <h3 className="font-display mb-6 text-xl font-bold text-[#1A1D27]">
        Add New Internship
      </h3>

      <div className="mb-6 rounded-xl border border-[#E8EAF0] bg-[#F7F8FA] px-5 py-4">
        <p className="mb-1 text-xs font-semibold text-[#6B7280]">Submitting as</p>
        <p className="text-sm font-semibold text-[#1A1D27]">
          {studentData?.firstName} {studentData?.lastName}
        </p>
        <p className="text-xs text-[#6B7280]">{studentData?.studentId}</p>
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
                <option key={n} value={n}>{n} Month{n > 1 ? "s" : ""}</option>
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
            onClick={handleCancel}
            className="rounded-xl border border-[#E8EAF0] px-6 py-2.5 text-sm font-semibold text-[#6B7280] hover:bg-[#F7F8FA]"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}