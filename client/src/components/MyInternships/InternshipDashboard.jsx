import { useState } from "react";
import InternshipInfo from "./InternshipInfo";
import DailyDiary from "./DailyDiary";
import MyTasks from "./MyTasks";
import MonthlyReport from "./MonthlyReport";
import FinalReport from "./FinalReport";

const SUB_TABS = [
  { id: "info", label: "Internship Info" },
  { id: "diary", label: "Daily Diary" },
  { id: "tasks", label: "My Tasks" },
  { id: "monthly", label: "Monthly Report" },
  { id: "final", label: "Final Report" },
];

export default function InternshipDashboard({ internship, onBack }) {
  const [activeSubTab, setActiveSubTab] = useState("info");

  const panels = {
    info: <InternshipInfo internship={internship} />,
    diary: <DailyDiary internshipId={internship._id} />,
    tasks: <MyTasks internshipId={internship._id} />,
    monthly: (
      <MonthlyReport
        internshipId={internship._id}
        supervisorEmail={internship.supervisorEmail}
        supervisorName={internship.supervisorName}
      />
    ),
    final: (
      <FinalReport
        internshipId={internship._id}
        internshipTitle={internship.title}
        supervisorEmail={internship.supervisorEmail}
        supervisorName={internship.supervisorName}
      />
    ),
  };

  return (
    <div>
      {/* Back button */}
      <button
        onClick={onBack}
        className="mb-5 flex items-center gap-2 text-sm font-medium text-[#3B6FE8] hover:text-[#2D5CD4] transition-colors"
      >
        ← Back to My Internships
      </button>

      {/* Internship heading */}
      <div className="mb-5 rounded-2xl border border-[#E8EAF0] bg-white px-6 py-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
        <h2 className="font-display text-xl font-bold text-[#1A1D27]">
          {internship.title}
        </h2>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <p className="text-sm text-[#6B7280]">{internship.studentName}</p>
          <span className="text-[#E8EAF0]">|</span>
          <p className="text-sm text-[#6B7280]">{internship.specialization}</p>
          <span className="text-[#E8EAF0]">|</span>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              internship.status === "ongoing"
                ? "bg-[#DCFCE7] text-[#16A34A]"
                : "bg-[#E8EAF0] text-[#6B7280]"
            }`}
          >
            {internship.status === "ongoing" ? "Ongoing" : "Completed"}
          </span>
        </div>
      </div>

      {/* Sub-tab bar */}
      <div className="mb-6 flex flex-wrap gap-2">
        {SUB_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`rounded-xl border-2 px-4 py-2 text-sm font-semibold transition-all ${
              activeSubTab === tab.id
                ? "border-[#3B6FE8] bg-[#3B6FE8] text-white"
                : "border-white bg-white/20 text-[#6B7280] hover:bg-white/30"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active panel */}
      <div>{panels[activeSubTab]}</div>
    </div>
  );
}
