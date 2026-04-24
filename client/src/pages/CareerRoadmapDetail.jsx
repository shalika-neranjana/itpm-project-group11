import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { fetchCareerAnalysis, fetchStudentGuidance } from '../api/student_guidance/guidanceApi'

const STATUS_STEPS = [
  'Analysing your profile signals...',
  'Generating full AI report...',
  'Building complete guided roadmap...',
  'Finalizing recommendations and next steps...',
]

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

function CareerRoadmapDetail() {
  const { careerId } = useParams()
  const navigate = useNavigate()
  const [career, setCareer] = useState(null)
  const [careerSuggestions, setCareerSuggestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [statusIndex, setStatusIndex] = useState(0)
  const [error, setError] = useState('')

  const loadCareerGuide = useCallback(
    async ({ forceRefresh = false } = {}) => {
      try {
        if (forceRefresh) {
          setIsRegenerating(true)
        } else {
          setLoading(true)
        }

        setStatusIndex(0)
        setError('')

        const [analysisData, guidanceData] = await Promise.all([
          fetchCareerAnalysis(careerId, { forceRefresh }),
          fetchStudentGuidance().catch(() => null),
        ])

        setCareer(analysisData)
        setCareerSuggestions(Array.isArray(guidanceData?.careerSuggestions) ? guidanceData.careerSuggestions : [])
      } catch (loadError) {
        setError(loadError.response?.data?.message || 'Unable to load the AI career analysis right now.')
        setCareer(null)
      } finally {
        if (forceRefresh) {
          setIsRegenerating(false)
        } else {
          setLoading(false)
        }
      }
    },
    [careerId]
  )

  useEffect(() => {
    if (careerId) {
      loadCareerGuide()
    }
  }, [careerId, loadCareerGuide])

  const isBusy = loading || isRegenerating

  useEffect(() => {
    if (!isBusy) {
      return
    }

    const statusTimer = setInterval(() => {
      setStatusIndex((current) => (current + 1) % STATUS_STEPS.length)
    }, 1200)

    return () => clearInterval(statusTimer)
  }, [isBusy])

  const statusMessage = STATUS_STEPS[statusIndex]

  const navigateToCareerSuggestions = () => {
    navigate('/dashboard?tab=guidance', {
      state: { tab: 'guidance', guidanceTab: 'careers' },
    })
  }

  const handleRegenerate = () => {
    if (!careerId || isBusy) {
      return
    }

    loadCareerGuide({ forceRefresh: true })
  }

  const relatedCareerSuggestions = useMemo(() => {
    const currentCareerId = String(career?.id || careerId || '').trim()

    return (Array.isArray(careerSuggestions) ? careerSuggestions : [])
      .filter((item, index) => createCareerIdentifier(item, index) !== currentCareerId)
      .slice(0, 6)
  }, [career?.id, careerId, careerSuggestions])

  if (loading) {
    return (
      <div
        className="min-h-screen bg-cover bg-center bg-no-repeat px-4 py-8"
        style={{ backgroundImage: "url('/authbackgound.jpg')" }}
      >
        <section className="mx-auto mt-10 max-w-4xl rounded-2xl border border-dashed border-[#D4E0FA] bg-white/95 p-8 text-center shadow-[0_1px_4px_rgba(0,0,0,0.04)] backdrop-blur-[1px]">
          <h2 className="font-display text-2xl font-bold text-[#1A1D27]">Loading AI Career Guide</h2>
          <p className="mt-3 animate-pulse text-sm font-semibold text-[#3B6FE8]">{statusMessage}</p>
        </section>
      </div>
    )
  }

  if (!career || error) {
    return (
      <div
        className="min-h-screen bg-cover bg-center bg-no-repeat px-4 py-8"
        style={{ backgroundImage: "url('/authbackgound.jpg')" }}
      >
        <section className="mx-auto mt-10 max-w-4xl rounded-2xl border border-dashed border-[#D4E0FA] bg-white/95 p-8 text-center shadow-[0_1px_4px_rgba(0,0,0,0.04)] backdrop-blur-[1px]">
          <h2 className="font-display text-2xl font-bold text-[#1A1D27]">Career guide not available</h2>
          <p className="mt-2 text-sm text-[#6B7280]">
            {error || 'The selected career guide could not be loaded.'}
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <button
              type="button"
              onClick={navigateToCareerSuggestions}
              className="rounded-[10px] border border-[#E8EAF0] px-4 py-2 text-sm font-semibold text-[#6B7280] transition hover:border-[#CAD8F5] hover:bg-[#F7F8FA]"
            >
              Back to Suggestions
            </button>
            <button
              type="button"
              onClick={handleRegenerate}
              disabled={isBusy}
              className="rounded-[10px] border border-[#D4E0FA] bg-white px-4 py-2 text-sm font-semibold text-[#3B6FE8] transition hover:border-[#BFD4FF] hover:bg-[#EEF2FD]"
            >
              {isBusy ? 'Regenerating...' : 'Retry Regenerate'}
            </button>
          </div>
        </section>
      </div>
    )
  }

  const strengthsToLeverage = Array.isArray(career.strengthsToLeverage) ? career.strengthsToLeverage : []
  const skillGaps = Array.isArray(career.skillGaps) ? career.skillGaps : []
  const roadmap = Array.isArray(career.roadmap) ? career.roadmap : []
  const guidelines = Array.isArray(career.guidelines) ? career.guidelines : []
  const matchedAreas = Array.isArray(career.matchedAreas) ? career.matchedAreas : []

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat px-4 py-8"
      style={{ backgroundImage: "url('/authbackgound.jpg')" }}
    >
      <div className="mx-auto max-w-5xl space-y-6 pb-10">
      <section className="rounded-2xl border border-[#DCE6FB] bg-gradient-to-br from-[#F6FAFF]/95 via-[#FFFFFF]/95 to-[#EEF4FF]/95 p-6 shadow-[0_8px_24px_rgba(42,87,173,0.08)] backdrop-blur-[1px]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#3B6FE8]">AI Career Guide</p>
            <h1 className="mt-2 font-display text-3xl font-bold text-[#1A1D27]">{career.title}</h1>
            <p className="mt-2 text-sm text-[#5A6678]">{career.summary}</p>
            <p className="mt-2 text-xs font-medium uppercase tracking-[0.12em] text-[#6B7280]">
              Full analysis and roadmap generated from your profile signals.
            </p>
          </div>

          <div className="flex flex-col items-end gap-3">
            <div className="rounded-xl border border-[#D9E6FF] bg-white/90 px-4 py-3 text-right shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6B7280]">Match Score</p>
              <p className="mt-1 text-2xl font-bold text-[#1A1D27]">{career.matchScore}%</p>
            </div>

            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={navigateToCareerSuggestions}
                className="rounded-[10px] border border-[#E8EAF0] bg-white px-4 py-2 text-xs font-semibold text-[#6B7280] transition hover:border-[#CAD8F5] hover:bg-[#F7F8FA]"
              >
                Back to Suggestions
              </button>
              <button
                type="button"
                onClick={handleRegenerate}
                disabled={isBusy}
                className="rounded-[10px] border border-[#D4E0FA] bg-white px-4 py-2 text-xs font-semibold text-[#3B6FE8] transition hover:border-[#BFD4FF] hover:bg-[#EEF2FD] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isRegenerating ? 'Regenerating...' : 'Refresh & Regenerate'}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {matchedAreas.map((area) => (
            <span key={area} className="rounded-full border border-[#DCE6FB] bg-[#F6F9FF] px-3 py-1 text-xs font-medium text-[#355188]">
              {area}
            </span>
          ))}
        </div>

        {isRegenerating && (
          <div className="mt-4 rounded-xl border border-[#D4E0FA] bg-white/95 px-4 py-3 text-sm font-semibold text-[#3B6FE8] shadow-sm animate-pulse">
            {statusMessage}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-[#E8EAF0] bg-white/95 p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)] backdrop-blur-[1px]">
        <h2 className="text-lg font-bold text-[#1A1D27]">Comprehensive AI Analysis</h2>
        <p className="mt-3 text-sm leading-7 text-[#5F6C80]">{career.comprehensiveDescription}</p>
      </section>

      {strengthsToLeverage.length > 0 && (
        <section className="rounded-2xl border border-[#E8EAF0] bg-white/95 p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)] backdrop-blur-[1px]">
          <h2 className="text-lg font-bold text-[#1A1D27]">Strengths To Leverage</h2>
          <ul className="mt-3 space-y-2 text-sm leading-7 text-[#5F6C80]">
            {strengthsToLeverage.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-[#18A36E]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {skillGaps.length > 0 && (
        <section className="rounded-2xl border border-[#E8EAF0] bg-white/95 p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)] backdrop-blur-[1px]">
          <h2 className="text-lg font-bold text-[#1A1D27]">Priority Skill Gaps</h2>
          <ul className="mt-3 space-y-2 text-sm leading-7 text-[#5F6C80]">
            {skillGaps.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-[#F28B2E]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-2xl border border-[#E8EAF0] bg-white/95 p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)] backdrop-blur-[1px]">
        <h2 className="text-lg font-bold text-[#1A1D27]">Guideline</h2>
        <ol className="mt-3 space-y-2 text-sm leading-7 text-[#5F6C80]">
          {guidelines.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-[#3B6FE8]" />
              <span>{item}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-2xl border border-[#E8EAF0] bg-white/95 p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)] backdrop-blur-[1px]">
        <h2 className="text-lg font-bold text-[#1A1D27]">Complete Guided Roadmap</h2>
        <div className="mt-4 space-y-3">
          {roadmap.map((step, index) => (
            <article key={`${step.phase}-${index}`} className="rounded-xl border border-[#E3EAF8] bg-[#FAFCFF] p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-[#1A1D27]">{step.phase}</p>
                {step.timeline ? (
                  <span className="rounded-full border border-[#DCE6FB] bg-white px-3 py-1 text-xs font-semibold text-[#355188]">
                    {step.timeline}
                  </span>
                ) : null}
              </div>

              <p className="mt-2 text-sm leading-6 text-[#5F6C80]">{step.objective}</p>

              {Array.isArray(step.actions) && step.actions.length > 0 && (
                <ul className="mt-3 space-y-1 text-sm leading-6 text-[#5F6C80]">
                  {step.actions.map((action) => (
                    <li key={action} className="flex gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-[#3B6FE8]" />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              )}

              {step.milestone ? (
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.1em] text-[#6B7280]">
                  Milestone: {step.milestone}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-[#E8EAF0] bg-white/95 p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)] backdrop-blur-[1px]">
        <h2 className="text-lg font-bold text-[#1A1D27]">Recommended Next Step</h2>
        <p className="mt-3 text-sm leading-7 text-[#5F6C80]">{career.nextStep}</p>
        {career.confidenceNote ? (
          <p className="mt-3 rounded-lg border border-[#E3EAF8] bg-[#FAFCFF] px-3 py-2 text-xs font-medium text-[#5F6C80]">
            {career.confidenceNote}
          </p>
        ) : null}
      </section>

      <section className="rounded-2xl border border-[#E8EAF0] bg-white/95 p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)] backdrop-blur-[1px]">
        <h2 className="text-lg font-bold text-[#1A1D27]">Explore Other Career Guides</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {relatedCareerSuggestions.map((item, index) => (
            <Link
              key={createCareerIdentifier(item, index)}
              to={`/student-guidance/career/${encodeURIComponent(createCareerIdentifier(item, index))}`}
              className="rounded-xl border border-[#E3EAF8] bg-[#FAFCFF] p-4 text-sm font-semibold text-[#1A1D27] transition hover:border-[#BFD4FF] hover:bg-white"
            >
              {item.title}
            </Link>
          ))}
        </div>

        {relatedCareerSuggestions.length === 0 && (
          <p className="mt-4 text-sm text-[#6B7280]">
            Refresh your AI suggestions to explore more career-specific guides.
          </p>
        )}

        <div className="mt-5 flex">
          <button
            type="button"
            onClick={navigateToCareerSuggestions}
            className="rounded-[10px] border border-[#E8EAF0] px-4 py-2 text-sm font-semibold text-[#6B7280] transition hover:border-[#CAD8F5] hover:bg-[#F7F8FA]"
          >
            Back to Suggestions
          </button>
        </div>
      </section>
      </div>
    </div>
  )
}

export default CareerRoadmapDetail
