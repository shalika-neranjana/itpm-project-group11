const stats = [
  { label: 'Active Internship Roles', value: '120+' },
  { label: 'Verified Partner Companies', value: '60+' },
  { label: 'Students Onboarded', value: '1.8k' },
  { label: 'Average Response Time', value: '< 48h' }
]

function Stats() {
  return (
    <section id="stats" className="border-y border-gray-200 bg-white">
      <div className="mx-auto w-full max-w-7xl px-6 py-16 lg:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Platform Metrics</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Clear performance signals for every stakeholder
          </h2>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item, index) => (
            <article
              key={item.label}
              className="rounded-xl border border-gray-200 bg-gray-50/60 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <p className="text-3xl font-bold tracking-tight text-gray-900">{item.value}</p>
              <p className="mt-2 text-sm font-semibold text-gray-600">{item.label}</p>
              {index < stats.length - 1 && <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-gray-300 to-transparent" />}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Stats
