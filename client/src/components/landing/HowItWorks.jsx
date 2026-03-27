const steps = [
  {
    title: 'Build Your Profile',
    description: 'Create a complete student or company profile using structured fields aligned to internship workflows.'
  },
  {
    title: 'Find and Apply',
    description: 'Match with relevant opportunities and submit applications through a streamlined, guided process.'
  },
  {
    title: 'Track Outcomes',
    description: 'Monitor tasks, reports, and progress milestones to keep internship delivery on schedule.'
  }
]

function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto w-full max-w-7xl px-6 py-16 lg:py-20">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">How It Works</p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          A three-step flow built for scale
        </h2>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {steps.map((step, index) => (
          <article
            key={step.title}
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
          >
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
              {index + 1}
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">{step.title}</h3>
            <p className="mt-2 text-sm leading-6 text-gray-600">{step.description}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default HowItWorks
