import { useMemo, useState } from 'react'

const normalizeScore = (value) => {
  const parsed = Number.parseInt(String(value).replace(/[^\d]/g, ''), 10)
  if (Number.isNaN(parsed)) {
    return 0
  }
  return Math.min(100, Math.max(0, parsed))
}

const getScoreTone = (score) => {
  if (score >= 80) {
    return {
      badge: 'bg-[#E8F7EE] text-[#127A3A]',
      bar: 'from-[#1E9A52] to-[#38C172]',
      accent: 'border-l-[#21A365] bg-gradient-to-br from-white to-[#F4FBF7]',
      label: 'Strong match',
    }
  }

  if (score >= 60) {
    return {
      badge: 'bg-[#FFF5E8] text-[#A15C06]',
      bar: 'from-[#D9932E] to-[#F2B44A]',
      accent: 'border-l-[#D9932E] bg-gradient-to-br from-white to-[#FFF9F0]',
      label: 'Promising fit',
    }
  }

  return {
    badge: 'bg-[#F2F4F8] text-[#4B5563]',
    bar: 'from-[#8B97A9] to-[#AAB4C2]',
    accent: 'border-l-[#8B97A9] bg-gradient-to-br from-white to-[#F8FAFC]',
    label: 'Needs growth',
  }
}

function CareerSuggestionsSection({ aspirations, interests, skills }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('scoreHigh')
  const [selectedCareer, setSelectedCareer] = useState(null)

  const effectiveCareerSuggestions = useMemo(
    () => [
      {
        title: 'Web Developer',
        summary: 'Build responsive and accessible websites with modern frontend and backend technologies.',
        nextStep: 'Create and deploy one portfolio website with API integration and responsive layouts.',
        matchScore: 80,
        matchedAreas: ['Software Engineering', 'JavaScript', 'React'],
        comprehensiveDescription:
          'Web development combines interface design, frontend engineering, backend services, and deployment workflows. You will build products that run across browsers, optimize performance, and ensure security and accessibility standards are met.',
        guidelines: [
          'Master HTML, CSS, JavaScript, and responsive design fundamentals.',
          'Build reusable UI components and connect them to REST APIs.',
          'Learn backend basics (Node.js/Express), authentication, and database CRUD operations.',
          'Apply accessibility checks, performance optimization, and cross-browser testing.',
          'Deploy projects to cloud platforms and document architecture decisions in your portfolio.',
        ],
        roadmap: [
          {
            phase: 'Phase 1 (Weeks 1-2): Foundation',
            outcome: 'Complete core web basics and build static responsive pages.',
          },
          {
            phase: 'Phase 2 (Weeks 3-5): Frontend Projects',
            outcome: 'Build component-based interfaces with state and routing.',
          },
          {
            phase: 'Phase 3 (Weeks 6-8): Backend Integration',
            outcome: 'Connect frontend to APIs, auth, and persistent storage.',
          },
          {
            phase: 'Phase 4 (Weeks 9-10): Quality and Delivery',
            outcome: 'Apply testing, accessibility, optimization, and deploy a full project.',
          },
        ],
      },
      {
        title: 'Mobile Apps Developer',
        summary: 'Develop smooth, user-friendly mobile applications with strong performance and usability.',
        nextStep: 'Build one mobile app prototype and implement core screens with navigation and state management.',
        matchScore: 15,
        matchedAreas: ['Software Engineering', 'React', 'UI/UX Design'],
        comprehensiveDescription:
          'Mobile app development focuses on building applications for Android and iOS with native-like performance and intuitive user experiences. It requires understanding mobile UI patterns, state management, offline handling, and app lifecycle behavior.',
        guidelines: [
          'Start with React Native or Flutter and understand project structure and navigation.',
          'Design mobile-first interfaces with consistent spacing, typography, and touch targets.',
          'Implement local storage, API integration, and network error handling.',
          'Measure app performance and reduce heavy renders and unnecessary state updates.',
          'Practice publishing flows, versioning, and release notes for production readiness.',
        ],
        roadmap: [
          {
            phase: 'Phase 1 (Weeks 1-2): Mobile Fundamentals',
            outcome: 'Set up framework, navigation, and reusable mobile UI components.',
          },
          {
            phase: 'Phase 2 (Weeks 3-5): Feature Development',
            outcome: 'Build main app flows with state management and form handling.',
          },
          {
            phase: 'Phase 3 (Weeks 6-8): Data and Reliability',
            outcome: 'Add APIs, offline storage, and graceful error states.',
          },
          {
            phase: 'Phase 4 (Weeks 9-10): Performance and Release',
            outcome: 'Optimize rendering, test on devices, and prepare release builds.',
          },
        ],
      },
      {
        title: 'Desktop App Developer',
        summary: 'Create stable desktop applications for productivity workflows and system-level utilities.',
        nextStep: 'Develop one desktop utility app with file handling, validation, and error logging.',
        matchScore: 5,
        matchedAreas: ['Programming', 'Database', 'Problem Solving'],
        comprehensiveDescription:
          'Desktop development emphasizes reliable applications with rich UI, local resource integration, and long-running stability. You work closely with file systems, native capabilities, and robust exception handling to deliver dependable tools.',
        guidelines: [
          'Choose a desktop framework such as Electron, .NET, JavaFX, or Qt based on your stack.',
          'Design clear workflows for local files, settings, and data persistence.',
          'Implement structured logging, validation rules, and recoverable error handling.',
          'Create installer-ready builds and validate behavior on target operating systems.',
          'Document architecture and support troubleshooting with clear user guides.',
        ],
        roadmap: [
          {
            phase: 'Phase 1 (Weeks 1-2): Platform Setup',
            outcome: 'Set up desktop framework and build core window/navigation structure.',
          },
          {
            phase: 'Phase 2 (Weeks 3-5): Core Utility Features',
            outcome: 'Implement local file workflows, forms, and persistent settings.',
          },
          {
            phase: 'Phase 3 (Weeks 6-8): Stability and Diagnostics',
            outcome: 'Add validation, structured logging, and robust error recovery.',
          },
          {
            phase: 'Phase 4 (Weeks 9-10): Packaging and Support',
            outcome: 'Create installers, verify cross-OS behavior, and prepare user documentation.',
          },
        ],
      },
    ],
    [],
  )

  const topScore = effectiveCareerSuggestions.length
    ? Math.max(...effectiveCareerSuggestions.map((career) => normalizeScore(career.matchScore)))
    : 0

  const visibleSuggestions = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    return [...effectiveCareerSuggestions]
      .filter((career) => {
        const score = normalizeScore(career.matchScore)
        const tone = getScoreTone(score).label
        const matchesSearch =
          !query ||
          career.title.toLowerCase().includes(query) ||
          String(career.summary || '').toLowerCase().includes(query) ||
          career.matchedAreas.some((area) => area.toLowerCase().includes(query))
        const matchesStatus = statusFilter === 'all' || tone === statusFilter

        return matchesSearch && matchesStatus
      })
      .sort((a, b) => {
        const scoreA = normalizeScore(a.matchScore)
        const scoreB = normalizeScore(b.matchScore)

        if (sortBy === 'scoreLow') {
          return scoreA - scoreB
        }

        if (sortBy === 'titleAsc') {
          return a.title.localeCompare(b.title)
        }

        if (sortBy === 'titleDesc') {
          return b.title.localeCompare(a.title)
        }

        return scoreB - scoreA
      })
  }, [effectiveCareerSuggestions, searchTerm, sortBy, statusFilter])

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-[#DCE6FB] bg-gradient-to-br from-[#F6FAFF] via-[#FFFFFF] to-[#EEF4FF] p-6 shadow-[0_8px_24px_rgba(42,87,173,0.08)]">
        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#CFE1FF]/50 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-12 left-16 h-32 w-32 rounded-full bg-[#D8F3E6]/40 blur-2xl" />

        <div className="relative z-10">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#3B6FE8]">AI Recommendation Engine</p>
              <h2 className="mt-2 font-display text-2xl font-bold text-[#1A1D27]">Career Suggestions</h2>
              <p className="mt-2 text-sm text-[#5A6678]">
                Personalized role recommendations generated from your interests, skills, and academic performance.
              </p>
            </div>
            <div className="rounded-xl border border-[#D9E6FF] bg-white/90 px-4 py-3 text-right shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6B7280]">Best Match</p>
              <p className="mt-1 text-2xl font-bold text-[#1A1D27]">{topScore}%</p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-[#E3EAF8] bg-white/90 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6B7280]">Interests</p>
              <p className="mt-2 text-2xl font-bold text-[#1A1D27]">{interests.length}</p>
              <p className="mt-1 text-xs text-[#6B7280]">Signals used in recommendation ranking</p>
            </div>
            <div className="rounded-xl border border-[#E3EAF8] bg-white/90 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6B7280]">Skills</p>
              <p className="mt-2 text-2xl font-bold text-[#1A1D27]">{skills.length}</p>
              <p className="mt-1 text-xs text-[#6B7280]">Capability evidence from your profile</p>
            </div>
            <div className="rounded-xl border border-[#E3EAF8] bg-white/90 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6B7280]">Goal Focus</p>
              <p className="mt-2 line-clamp-2 text-sm font-semibold text-[#1A1D27]">
                {aspirations || 'Add your aspiration note for stronger AI targeting.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {effectiveCareerSuggestions.length > 0 ? (
        <section className="rounded-2xl border border-[#E8EAF0] bg-white p-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search roles or keywords..."
              className="rounded-[10px] border border-[#E8EAF0] bg-white px-3 py-2 text-sm text-[#1A1D27] outline-none transition placeholder:text-[#9CA3AF] hover:border-[#CAD8F5] focus:border-[#3B6FE8] focus-visible:ring-2 focus-visible:ring-[#BFD4FF]"
            />

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-[10px] border border-[#E8EAF0] bg-white px-3 py-2 text-sm text-[#1A1D27] outline-none transition hover:border-[#CAD8F5] focus:border-[#3B6FE8] focus-visible:ring-2 focus-visible:ring-[#BFD4FF]"
            >
              <option value="all">All statuses</option>
              <option value="Strong match">Strong match</option>
              <option value="Promising fit">Promising fit</option>
              <option value="Needs growth">Needs growth</option>
            </select>

            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="rounded-[10px] border border-[#E8EAF0] bg-white px-3 py-2 text-sm text-[#1A1D27] outline-none transition hover:border-[#CAD8F5] focus:border-[#3B6FE8] focus-visible:ring-2 focus-visible:ring-[#BFD4FF]"
            >
              <option value="scoreHigh">Sort: Match score (high to low)</option>
              <option value="scoreLow">Sort: Match score (low to high)</option>
              <option value="titleAsc">Sort: Role title (A-Z)</option>
              <option value="titleDesc">Sort: Role title (Z-A)</option>
            </select>

            <div className="rounded-[10px] border border-[#E3EAF8] bg-[#F7FAFF] px-3 py-2 text-sm text-[#5F6C80]">
              Showing <span className="font-semibold text-[#1A1D27]">{visibleSuggestions.length}</span> of{' '}
              <span className="font-semibold text-[#1A1D27]">{effectiveCareerSuggestions.length}</span> roles
            </div>
          </div>
        </section>
      ) : null}

      {effectiveCareerSuggestions.length > 0 ? (
        <div className="grid gap-5 xl:grid-cols-3">
          {visibleSuggestions.map((career) => {
            const score = normalizeScore(career.matchScore)
            const tone = getScoreTone(score)

            return (
              <article
                key={career.title}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedCareer(career)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    setSelectedCareer(career)
                  }
                }}
                className={`cursor-pointer rounded-2xl border border-l-4 border-[#E8EAF0] p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_18px_rgba(22,34,57,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8DB2FF] focus-visible:ring-offset-2 ${tone.accent}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-xl font-bold text-[#1A1D27]">{career.title}</h3>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone.badge}`}>
                    {tone.label}
                  </span>
                </div>

                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.12em] text-[#6B7280]">
                    <span>Match Score</span>
                    <span className="text-[#1A1D27]">{score}%</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#E8EEF7]">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${tone.bar}`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>

                <p className="mt-4 text-sm leading-6 text-[#5F6C80]">{career.summary}</p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#6B7280]">
                  Click card for full guideline
                </p>

                <div className="mt-5">
                  <p className="text-sm font-semibold text-[#1A1D27]">Why the AI recommends this</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {career.matchedAreas.map((area) => (
                      <span key={area} className="rounded-full border border-[#DCE6FB] bg-[#F6F9FF] px-3 py-1 text-xs font-medium text-[#355188]">
                        {area}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-[#E5ECFA] bg-[#FAFCFF] p-4">
                  <p className="text-sm font-semibold text-[#1A1D27]">Recommended next step</p>
                  <p className="mt-2 text-sm leading-6 text-[#5F6C80]">{career.nextStep}</p>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <section className="rounded-2xl border border-dashed border-[#D4E0FA] bg-[#F7F8FA] p-10 text-center">
          <h3 className="font-display text-xl font-bold text-[#1A1D27]">No AI suggestions yet</h3>
          <p className="mt-2 text-sm text-[#6B7280]">
            Add interests, skills, and aspiration notes to unlock personalized career recommendations.
          </p>
        </section>
      )}

      {effectiveCareerSuggestions.length > 0 && visibleSuggestions.length === 0 && (
        <section className="rounded-2xl border border-dashed border-[#D4E0FA] bg-[#F7F8FA] p-10 text-center">
          <h3 className="font-display text-xl font-bold text-[#1A1D27]">No matching career suggestions</h3>
          <p className="mt-2 text-sm text-[#6B7280]">
            Try changing the search text, status filter, or sorting option.
          </p>
        </section>
      )}

      {selectedCareer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1D27]/45 px-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-2xl font-bold text-[#1A1D27]">{selectedCareer.title}</h3>
                <p className="mt-1 text-sm text-[#6B7280]">Comprehensive description and guideline</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCareer(null)}
                className="rounded-[10px] border border-[#E8EAF0] px-3 py-2 text-sm font-semibold text-[#6B7280] transition hover:border-[#CAD8F5] hover:bg-[#F7F8FA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CAD8F5] focus-visible:ring-offset-2"
              >
                Close
              </button>
            </div>

            <div className="mt-5 rounded-xl border border-[#E8EAF0] bg-[#FAFCFF] p-4">
              <p className="text-sm font-semibold text-[#1A1D27]">Description</p>
              <p className="mt-2 text-sm leading-7 text-[#5F6C80]">{selectedCareer.comprehensiveDescription}</p>
            </div>

            <div className="mt-4 rounded-xl border border-[#E8EAF0] bg-white p-4">
              <p className="text-sm font-semibold text-[#1A1D27]">Guideline</p>
              <ol className="mt-2 space-y-2 text-sm leading-7 text-[#5F6C80]">
                {selectedCareer.guidelines.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-[#3B6FE8]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-4 rounded-xl border border-[#E8EAF0] bg-[#FAFCFF] p-4">
              <p className="text-sm font-semibold text-[#1A1D27]">Roadmap</p>
              <div className="mt-3 space-y-3">
                {selectedCareer.roadmap.map((step) => (
                  <div key={step.phase} className="rounded-lg border border-[#E3EAF8] bg-white p-3">
                    <p className="text-sm font-semibold text-[#1A1D27]">{step.phase}</p>
                    <p className="mt-1 text-sm leading-6 text-[#5F6C80]">{step.outcome}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CareerSuggestionsSection
