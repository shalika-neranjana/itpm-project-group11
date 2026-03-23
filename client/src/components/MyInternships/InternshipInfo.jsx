export default function InternshipInfo({ internship }) {
  const fmt = (dateStr) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString("en-MY", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "—";

  // Progress calculation
  const start = new Date(internship.startDate);
  const end   = internship.endDate ? new Date(internship.endDate) : new Date(start);
  if (!internship.endDate) end.setMonth(end.getMonth() + internship.duration);
  const progress = Math.min(100, Math.max(0,
    Math.round(((new Date() - start) / (end - start)) * 100)
  ));

  // ── Derive status from progress ──
  const isCompleted = progress >= 100

  const fields = [
    ["Student Name",     internship.studentName],
    ["Student ID",       internship.studentIdNumber],
    ["Internship Title", internship.title],
    ["Specialization",   internship.specialization],
    ["Supervisor",       internship.supervisorName],
    ["Supervisor Email", internship.supervisorEmail || "—"],
    ["Start Date",       fmt(internship.startDate)],
    ["End Date",         fmt(internship.endDate)],
    ["Duration",         `${internship.duration} month${internship.duration > 1 ? "s" : ""}`],
    ["Status",           isCompleted ? "completed" : "ongoing"],  
  ];

  return (
    <div className="rounded-2xl border border-[#E8EAF0] bg-white p-8 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
      <h3 className="font-display mb-6 text-xl font-bold text-[#1A1D27]">
        Internship Information
      </h3>

      <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
        {fields.map(([label, value]) => (
          <div key={label} className="border-b border-[#E8EAF0] pb-4">
            <p className="mb-1 text-xs text-[#6B7280]">{label}</p>

            {/* Status field gets a coloured badge instead of plain text */}
            {label === 'Status' ? (
              <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                isCompleted
                  ? 'bg-[#E8EAF0] text-[#6B7280]'
                  : 'bg-[#DCFCE7] text-[#16A34A]'
              }`}>
                {isCompleted ? 'Completed' : 'Ongoing'}
              </span>
            ) : (
              <p className="font-semibold text-[#1A1D27]">{value}</p>
            )}
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="mt-6">
        <div className="mb-1.5 flex justify-between text-xs text-[#6B7280]">
          <span>Internship Progress</span>
          {/* ── % turns green when complete ── */}
          <span className={`font-semibold ${isCompleted ? 'text-[#16A34A]' : 'text-[#3B6FE8]'}`}>
            {progress}%
          </span>
        </div>
        <div className="h-2 rounded-full bg-[#EEF2FD]">
          {/* ── Bar turns green when complete ── */}
          <div
            className={`h-2 rounded-full transition-all ${
              isCompleted
                ? 'bg-gradient-to-r from-[#16A34A] to-[#34D399]'
                : 'bg-gradient-to-r from-[#3B6FE8] to-[#6B9FFF]'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}