import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

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

const createCareerIdentifier = (career, index = 0) => {
  if (typeof career?.id === 'string' && career.id.trim()) {
    return career.id.trim()
  }

  const titleSlug = String(career?.title || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  return titleSlug || `career-${index + 1}`
}

function CareerSuggestionsSection({ aspirations, interests, skills, careerSuggestions, onRefresh, refreshing }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('scoreHigh')
  const effectiveCareerSuggestions = useMemo(
    () => (Array.isArray(careerSuggestions) ? careerSuggestions : []),
    [careerSuggestions]
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
          (career.matchedAreas || []).some((area) => area.toLowerCase().includes(query))
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
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onRefresh}
                disabled={refreshing}
                className="rounded-[10px] border border-[#D4E0FA] bg-white px-4 py-2 text-xs font-semibold text-[#3B6FE8] transition hover:border-[#BFD4FF] hover:bg-[#EEF2FD] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8DB2FF] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {refreshing ? 'Refreshing...' : 'Refresh AI Suggestions'}
              </button>

              <div className="rounded-xl border border-[#D9E6FF] bg-white/90 px-4 py-3 text-right shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6B7280]">Best Match</p>
                <p className="mt-1 text-2xl font-bold text-[#1A1D27]">{topScore}%</p>
              </div>
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
          {visibleSuggestions.map((career, index) => {
            const score = normalizeScore(career.matchScore)
            const tone = getScoreTone(score)
            const careerId = createCareerIdentifier(career, index)

            return (
              <article
                key={careerId}
                className={`rounded-2xl border border-l-4 border-[#E8EAF0] p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_18px_rgba(22,34,57,0.08)] ${tone.accent}`}
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
                <Link
                  to={`/student-guidance/career/${encodeURIComponent(careerId)}`}
                  className="mt-3 inline-flex rounded-[10px] border border-[#D4E0FA] px-3 py-2 text-xs font-semibold text-[#3B6FE8] transition hover:border-[#BFD4FF] hover:bg-[#EEF2FD] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8DB2FF] focus-visible:ring-offset-2"
                >
                  View full AI analysis
                </Link>

                <div className="mt-5">
                  <p className="text-sm font-semibold text-[#1A1D27]">Why the AI recommends this</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(career.matchedAreas || []).map((area) => (
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
    </div>
  )
}

export default CareerSuggestionsSection
