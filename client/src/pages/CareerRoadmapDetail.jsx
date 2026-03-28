import { Link, useNavigate, useParams } from 'react-router-dom'
import { careerRoadmaps, getCareerRoadmapById } from '../components/student_guidance/careerRoadmaps'

function CareerRoadmapDetail() {
  const { careerId } = useParams()
  const navigate = useNavigate()

  const career = getCareerRoadmapById(careerId)

  if (!career) {
    return (
      <div
        className="min-h-screen bg-cover bg-center bg-no-repeat px-4 py-8"
        style={{ backgroundImage: "url('/authbackgound.jpg')" }}
      >
        <section className="mx-auto mt-10 max-w-4xl rounded-2xl border border-dashed border-[#D4E0FA] bg-white/95 p-8 text-center shadow-[0_1px_4px_rgba(0,0,0,0.04)] backdrop-blur-[1px]">
          <h2 className="font-display text-2xl font-bold text-[#1A1D27]">Career guide not found</h2>
          <p className="mt-2 text-sm text-[#6B7280]">Choose one of the available role guides to continue.</p>
          <div className="mt-5 flex justify-center">
            <button
              type="button"
              onClick={() =>
                navigate('/dashboard?tab=guidance', {
                  state: { tab: 'guidance', guidanceTab: 'careers' },
                })
              }
              className="rounded-[10px] border border-[#E8EAF0] px-4 py-2 text-sm font-semibold text-[#6B7280] transition hover:border-[#CAD8F5] hover:bg-[#F7F8FA]"
            >
              Go Back
            </button>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat px-4 py-8"
      style={{ backgroundImage: "url('/authbackgound.jpg')" }}
    >
      <div className="mx-auto max-w-5xl space-y-6 pb-10">
      <section className="rounded-2xl border border-[#DCE6FB] bg-gradient-to-br from-[#F6FAFF]/95 via-[#FFFFFF]/95 to-[#EEF4FF]/95 p-6 shadow-[0_8px_24px_rgba(42,87,173,0.08)] backdrop-blur-[1px]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#3B6FE8]">Career Guide</p>
            <h1 className="mt-2 font-display text-3xl font-bold text-[#1A1D27]">{career.title}</h1>
            <p className="mt-2 text-sm text-[#5A6678]">{career.summary}</p>
          </div>

          <div className="rounded-xl border border-[#D9E6FF] bg-white/90 px-4 py-3 text-right shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6B7280]">Match Score</p>
            <p className="mt-1 text-2xl font-bold text-[#1A1D27]">{career.matchScore}%</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {career.matchedAreas.map((area) => (
            <span key={area} className="rounded-full border border-[#DCE6FB] bg-[#F6F9FF] px-3 py-1 text-xs font-medium text-[#355188]">
              {area}
            </span>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-[#E8EAF0] bg-white/95 p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)] backdrop-blur-[1px]">
        <h2 className="text-lg font-bold text-[#1A1D27]">Comprehensive Description</h2>
        <p className="mt-3 text-sm leading-7 text-[#5F6C80]">{career.comprehensiveDescription}</p>
      </section>

      <section className="rounded-2xl border border-[#E8EAF0] bg-white/95 p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)] backdrop-blur-[1px]">
        <h2 className="text-lg font-bold text-[#1A1D27]">Guideline</h2>
        <ol className="mt-3 space-y-2 text-sm leading-7 text-[#5F6C80]">
          {career.guidelines.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-[#3B6FE8]" />
              <span>{item}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-2xl border border-[#E8EAF0] bg-white/95 p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)] backdrop-blur-[1px]">
        <h2 className="text-lg font-bold text-[#1A1D27]">Roadmap</h2>
        <div className="mt-4 space-y-3">
          {career.roadmap.map((step) => (
            <article key={step.phase} className="rounded-xl border border-[#E3EAF8] bg-[#FAFCFF] p-4">
              <p className="text-sm font-semibold text-[#1A1D27]">{step.phase}</p>
              <p className="mt-1 text-sm leading-6 text-[#5F6C80]">{step.outcome}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-[#E8EAF0] bg-white/95 p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)] backdrop-blur-[1px]">
        <h2 className="text-lg font-bold text-[#1A1D27]">Recommended Next Step</h2>
        <p className="mt-3 text-sm leading-7 text-[#5F6C80]">{career.nextStep}</p>
      </section>

      <section className="rounded-2xl border border-[#E8EAF0] bg-white/95 p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)] backdrop-blur-[1px]">
        <h2 className="text-lg font-bold text-[#1A1D27]">Explore Other Career Guides</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {careerRoadmaps
            .filter((item) => item.id !== career.id)
            .map((item) => (
              <Link
                key={item.id}
                to={`/student-guidance/career/${item.id}`}
                className="rounded-xl border border-[#E3EAF8] bg-[#FAFCFF] p-4 text-sm font-semibold text-[#1A1D27] transition hover:border-[#BFD4FF] hover:bg-white"
              >
                {item.title}
              </Link>
            ))}
        </div>

        <div className="mt-5 flex">
          <button
            type="button"
            onClick={() =>
              navigate('/dashboard?tab=guidance', {
                state: { tab: 'guidance', guidanceTab: 'careers' },
              })
            }
            className="rounded-[10px] border border-[#E8EAF0] px-4 py-2 text-sm font-semibold text-[#6B7280] transition hover:border-[#CAD8F5] hover:bg-[#F7F8FA]"
          >
            Back
          </button>
        </div>
      </section>
      </div>
    </div>
  )
}

export default CareerRoadmapDetail
