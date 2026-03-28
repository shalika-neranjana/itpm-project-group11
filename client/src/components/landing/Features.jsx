import {
  BriefcaseBusiness,
  ChartNoAxesCombined,
  ClipboardCheck,
  ShieldCheck,
  SquareUserRound,
  Users
} from 'lucide-react'

const features = [
  {
    title: 'Curated Role Marketplace',
    description: 'Discover internship positions through structured filters for domain, location, and preferred work model.',
    icon: BriefcaseBusiness
  },
  {
    title: 'Unified Student Profiles',
    description: 'Maintain one consistent profile across applications, reviews, performance records, and reports.',
    icon: SquareUserRound
  },
  {
    title: 'Verified Employer Network',
    description: 'Work with organizations reviewed by academic teams to keep opportunities transparent and reliable.',
    icon: ShieldCheck
  },
  {
    title: 'Progress Analytics',
    description: 'Track internship milestones with meaningful insights for students, coordinators, and mentors.',
    icon: ChartNoAxesCombined
  },
  {
    title: 'Collaborative Workflows',
    description: 'Align students, supervisors, and administrators through one streamlined operating workspace.',
    icon: Users
  },
  {
    title: 'Structured Documentation',
    description: 'Generate reports and internship records in formats aligned to institutional requirements.',
    icon: ClipboardCheck
  }
]

function Features() {
  return (
    <section id="features" className="mx-auto w-full max-w-7xl px-6 py-16 lg:py-20">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Features</p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Designed for high-trust internship operations
        </h2>
        <p className="mt-4 text-base leading-7 text-gray-600">
          Every workflow is optimized for consistent data, faster coordination, and cleaner visibility across the internship lifecycle.
        </p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon

          return (
            <article
              key={feature.title}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">{feature.description}</p>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default Features
