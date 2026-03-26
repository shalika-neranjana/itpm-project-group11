const formatCaMark = (value) => {
  const numericValue = Number(value)

  if (!Number.isFinite(numericValue)) {
    return 'N/A'
  }

  return Number.isInteger(numericValue)
    ? numericValue.toString()
    : numericValue.toFixed(2).replace(/\.?0+$/, '')
}

function ExamResultsSection({ student, examResults = [] }) {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[#E8EAF0] bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
        <h2 className="font-display text-2xl font-bold text-[#1A1D27]">Exam Results</h2>
        <p className="mt-1 text-sm text-[#6B7280]">
          Viewing academic results for {student.name}
          {student.studentId ? ` (${student.studentId})` : ''}
        </p>
      </section>

      {examResults.length === 0 && (
        <section className="rounded-[28px] border border-[#E8EAF0] bg-white p-8 text-center shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
          <h3 className="text-lg font-bold text-[#1A1D27]">No exam results available</h3>
          <p className="mt-2 text-sm text-[#6B7280]">
            Your results will appear here once they are available in the system.
          </p>
        </section>
      )}

      {examResults.map((semester) => (
        <section
          key={`${semester.year}-${semester.semester}`}
          className="overflow-hidden rounded-[28px] border border-[#E8EAF0] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04)]"
        >
          <div className="bg-[#2E3470] px-5 py-4 text-white">
            <h3 className="text-xl font-bold">
              Year {semester.year} | Semester {semester.semester}
            </h3>
          </div>

          <div className="overflow-x-auto px-3 py-3 md:px-5 md:py-4">
            <table className="min-w-full border-separate border-spacing-0 text-left">
              <thead>
                <tr className="text-[#1A1D27]">
                  <th className="border-b border-[#D6DCE8] px-3 py-3 text-sm font-bold md:text-base">Subject Code</th>
                  <th className="border-b border-[#D6DCE8] px-3 py-3 text-sm font-bold md:text-base">Subject</th>
                  <th className="border-b border-[#D6DCE8] px-3 py-3 text-sm font-bold md:text-base">Credits</th>
                  <th className="border-b border-[#D6DCE8] px-3 py-3 text-sm font-bold md:text-base">CA %</th>
                  <th className="border-b border-[#D6DCE8] px-3 py-3 text-sm font-bold md:text-base">Grade</th>
                </tr>
              </thead>
              <tbody>
                {semester.subjects.map((subject, index) => (
                  <tr key={subject.resultId || `${semester.year}-${semester.semester}-${subject.subjectCode}-${index}`}>
                    <td className="border-b border-[#E8EAF0] px-3 py-3 text-sm text-[#1A1D27]">{subject.subjectCode}</td>
                    <td className="border-b border-[#E8EAF0] px-3 py-3 text-sm text-[#1A1D27]">{subject.subject}</td>
                    <td className="border-b border-[#E8EAF0] px-3 py-3 text-sm text-[#1A1D27]">{subject.credits}</td>
                    <td className="border-b border-[#E8EAF0] px-3 py-3 text-sm text-[#1A1D27]">{formatCaMark(subject.caPercentage)}</td>
                    <td className="border-b border-[#E8EAF0] px-3 py-3 text-sm font-semibold text-[#1A1D27]">{subject.grade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  )
}

export default ExamResultsSection
