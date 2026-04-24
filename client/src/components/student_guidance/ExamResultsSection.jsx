import { useMemo, useState } from 'react'

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
  const [searchTerm, setSearchTerm] = useState('')
  const [yearFilter, setYearFilter] = useState('all')
  const [semesterFilter, setSemesterFilter] = useState('all')
  const [gradeFilter, setGradeFilter] = useState('all')

  const yearOptions = useMemo(
    () => [...new Set(examResults.map((semester) => String(semester.year)))],
    [examResults],
  )

  const semesterOptions = useMemo(
    () => [...new Set(examResults.map((semester) => String(semester.semester)))],
    [examResults],
  )

  const gradeOptions = useMemo(
    () => [...new Set(examResults.flatMap((semester) => semester.subjects.map((subject) => String(subject.grade || 'N/A'))))],
    [examResults],
  )

  const filteredExamResults = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    return examResults
      .filter((semester) => (yearFilter === 'all' ? true : String(semester.year) === yearFilter))
      .filter((semester) =>
        semesterFilter === 'all' ? true : String(semester.semester) === semesterFilter,
      )
      .map((semester) => {
        const subjects = semester.subjects.filter((subject) => {
          const subjectCode = String(subject.subjectCode || '').toLowerCase()
          const subjectName = String(subject.subject || '').toLowerCase()
          const subjectGrade = String(subject.grade || 'N/A')

          const matchesSearch =
            !query ||
            subjectCode.includes(query) ||
            subjectName.includes(query) ||
            subjectGrade.toLowerCase().includes(query)
          const matchesGrade = gradeFilter === 'all' || subjectGrade === gradeFilter

          return matchesSearch && matchesGrade
        })

        return {
          ...semester,
          subjects,
        }
      })
      .filter((semester) => semester.subjects.length > 0)
  }, [examResults, gradeFilter, searchTerm, semesterFilter, yearFilter])

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[#E8EAF0] bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
        <h2 className="font-display text-2xl font-bold text-[#1A1D27]">Academic Performance</h2>
        <p className="mt-1 text-sm text-[#6B7280]">
          Viewing academic results for {student.name}
          {student.studentId ? ` (${student.studentId})` : ''}
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search subject code/name/grade..."
            className="rounded-[10px] border border-[#E8EAF0] bg-white px-3 py-2 text-sm text-[#1A1D27] outline-none transition placeholder:text-[#9CA3AF] hover:border-[#CAD8F5] focus:border-[#3B6FE8] focus-visible:ring-2 focus-visible:ring-[#BFD4FF]"
          />

          <select
            value={yearFilter}
            onChange={(event) => setYearFilter(event.target.value)}
            className="rounded-[10px] border border-[#E8EAF0] bg-white px-3 py-2 text-sm text-[#1A1D27] outline-none transition hover:border-[#CAD8F5] focus:border-[#3B6FE8] focus-visible:ring-2 focus-visible:ring-[#BFD4FF]"
          >
            <option value="all">All Years</option>
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                Year {year}
              </option>
            ))}
          </select>

          <select
            value={semesterFilter}
            onChange={(event) => setSemesterFilter(event.target.value)}
            className="rounded-[10px] border border-[#E8EAF0] bg-white px-3 py-2 text-sm text-[#1A1D27] outline-none transition hover:border-[#CAD8F5] focus:border-[#3B6FE8] focus-visible:ring-2 focus-visible:ring-[#BFD4FF]"
          >
            <option value="all">All Semesters</option>
            {semesterOptions.map((semester) => (
              <option key={semester} value={semester}>
                Semester {semester}
              </option>
            ))}
          </select>

          <select
            value={gradeFilter}
            onChange={(event) => setGradeFilter(event.target.value)}
            className="rounded-[10px] border border-[#E8EAF0] bg-white px-3 py-2 text-sm text-[#1A1D27] outline-none transition hover:border-[#CAD8F5] focus:border-[#3B6FE8] focus-visible:ring-2 focus-visible:ring-[#BFD4FF]"
          >
            <option value="all">All Grades</option>
            {gradeOptions.map((grade) => (
              <option key={grade} value={grade}>
                {grade}
              </option>
            ))}
          </select>
        </div>
      </section>

      {examResults.length === 0 && (
        <section className="rounded-[28px] border border-[#E8EAF0] bg-white p-8 text-center shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
          <h3 className="text-lg font-bold text-[#1A1D27]">No academic performance data available</h3>
          <p className="mt-2 text-sm text-[#6B7280]">
            Your results will appear here once they are available in the system.
          </p>
        </section>
      )}

      {filteredExamResults.map((semester) => (
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

      {examResults.length > 0 && filteredExamResults.length === 0 && (
        <section className="rounded-[28px] border border-dashed border-[#D4E0FA] bg-[#F7F8FA] p-8 text-center shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
          <h3 className="text-lg font-bold text-[#1A1D27]">No matching academic results</h3>
          <p className="mt-2 text-sm text-[#6B7280]">
            Try a different search keyword or adjust the selected filters.
          </p>
        </section>
      )}
    </div>
  )
}

export default ExamResultsSection
