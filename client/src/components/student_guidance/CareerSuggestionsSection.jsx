function CareerSuggestionsSection({ aspirations, interests, skills, careerSuggestions }) {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[#E8EAF0] bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
        <h2 className="font-display text-2xl font-bold text-[#1A1D27]">Career Suggestions</h2>
        <p className="mt-2 text-sm text-[#6B7280]">
          Suggestions are generated from your interests, current skills, and academic performance.
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-[#F7F8FA] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6B7280]">Interests</p>
            <p className="mt-2 text-lg font-bold text-[#1A1D27]">{interests.length}</p>
          </div>
          <div className="rounded-2xl bg-[#F7F8FA] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6B7280]">Skills</p>
            <p className="mt-2 text-lg font-bold text-[#1A1D27]">{skills.length}</p>
          </div>
          <div className="rounded-2xl bg-[#F7F8FA] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6B7280]">Goal Focus</p>
            <p className="mt-2 text-sm font-medium text-[#1A1D27]">{aspirations || 'Not added yet'}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-3">
        {careerSuggestions.map((career) => (
          <article key={career.title} className="rounded-2xl border border-[#E8EAF0] bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-xl font-bold text-[#1A1D27]">{career.title}</h3>
              <span className="rounded-full bg-[#EEF2FD] px-3 py-1 text-xs font-semibold text-[#3B6FE8]">
                Match {career.matchScore}
              </span>
            </div>

            <p className="mt-3 text-sm leading-6 text-[#6B7280]">{career.summary}</p>

            <div className="mt-4">
              <p className="text-sm font-semibold text-[#1A1D27]">Why this matches</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {career.matchedAreas.map((area) => (
                  <span key={area} className="rounded-full bg-[#F7F8FA] px-3 py-1 text-xs font-medium text-[#4B5563]">
                    {area}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-[#F7F8FA] p-4">
              <p className="text-sm font-semibold text-[#1A1D27]">Recommended next step</p>
              <p className="mt-2 text-sm leading-6 text-[#6B7280]">{career.nextStep}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

export default CareerSuggestionsSection
