import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  Clock3,
  Compass,
  GraduationCap,
  Handshake,
  LineChart,
  ShieldCheck,
  Sparkles,
  Users
} from 'lucide-react'

const features = [
  {
    title: 'Smart Internship Marketplace',
    description: 'Curated listings with filters for specialization, mode, and location so students and recruiters connect faster.',
    icon: <BriefcaseBusiness className="h-5 w-5" />
  },
  {
    title: 'Unified Student Profile',
    description: 'Showcase academics, projects, and skills with a single, consistent profile that feeds applications and reviews.',
    icon: <GraduationCap className="h-5 w-5" />
  },
  {
    title: 'Verified Employers',
    description: 'Built-in company verification, transparent reviews, and clear role expectations to keep internships safe.',
    icon: <ShieldCheck className="h-5 w-5" />
  },
  {
    title: 'Guidance & Analytics',
    description: 'Track tasks, diary entries, and reports with dashboards that surface progress and next steps.',
    icon: <LineChart className="h-5 w-5" />
  },
  {
    title: 'Collaboration-first',
    description: 'Chat-friendly updates, milestone tracking, and feedback loops between students, supervisors, and admins.',
    icon: <Users className="h-5 w-5" />
  },
  {
    title: 'Launch-ready Docs',
    description: 'Auto-structured application flows, templated reports, and exports that match university and company needs.',
    icon: <BadgeCheck className="h-5 w-5" />
  }
]

const steps = [
  {
    title: 'Create your profile',
    copy: 'Set up a polished student or company profile in minutes with guided fields that mirror the platform data model.',
    icon: <Sparkles className="h-5 w-5" />
  },
  {
    title: 'Match & apply',
    copy: 'Browse roles that match your specialization, apply with one click, and keep everything tracked in one place.',
    icon: <Compass className="h-5 w-5" />
  },
  {
    title: 'Track the journey',
    copy: 'Use dashboards, diary entries, tasks, and reports to keep stakeholders aligned until the internship is complete.',
    icon: <Clock3 className="h-5 w-5" />
  }
]

const stats = [
  { label: 'Live internship roles', value: '120+' },
  { label: 'Verified companies', value: '60+' },
  { label: 'Student profiles onboarded', value: '1.8k' },
  { label: 'Avg. time to first response', value: '<48h' }
]

function Pill({ children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#D4E0FA] bg-white px-3 py-1 text-xs font-semibold text-[#3B6FE8] shadow-[0_1px_4px_rgba(59,111,232,0.08)]">
      {children}
    </span>
  )
}

function FeatureCard({ title, description, icon }) {
  return (
    <div className="group rounded-2xl border border-[#E8EAF0] bg-white p-6 shadow-[0_6px_24px_rgba(0,0,0,0.04)] transition hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(59,111,232,0.12)]">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF2FD] text-[#3B6FE8]">
        {icon}
      </div>
      <h3 className="font-semibold text-[#1A1D27]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[#6B7280]">{description}</p>
    </div>
  )
}

function StepCard({ title, copy, icon, index }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[#E8EAF0] bg-white p-5 shadow-[0_6px_20px_rgba(0,0,0,0.04)]">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EEF2FD] text-sm font-semibold text-[#3B6FE8]">
          {String(index + 1).padStart(2, '0')}
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#D4E0FA] bg-white text-[#3B6FE8]">
          {icon}
        </div>
      </div>
      <div>
        <h4 className="font-semibold text-[#1A1D27]">{title}</h4>
        <p className="mt-1 text-sm leading-6 text-[#6B7280]">{copy}</p>
      </div>
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-[#E8EAF0] bg-white px-4 py-5 text-center shadow-[0_8px_26px_rgba(0,0,0,0.04)]">
      <div className="text-2xl font-bold text-[#1A1D27]">{value}</div>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[#6B7280]">{label}</p>
    </div>
  )
}

function Home() {
  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#1A1D27]">
      <header className="sticky top-0 z-40 border-b border-[#E8EAF0] bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/logo_icon_only.png"
              alt="InternConnect logo"
              className="h-10 w-10 rounded-xl border border-[#E8EAF0] bg-white object-cover shadow-sm"
            />
            <span className="font-display text-xl font-bold text-[#1A1D27]">InternConnect</span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-semibold text-[#4B5563] md:flex">
            <a href="#features" className="transition hover:text-[#1A1D27]">Features</a>
            <a href="#about" className="transition hover:text-[#1A1D27]">About</a>
            <a href="#how" className="transition hover:text-[#1A1D27]">How it works</a>
            <a href="#cta" className="transition hover:text-[#1A1D27]">Contact</a>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/register"
              className="hidden rounded-xl border border-[#E8EAF0] px-4 py-2 text-sm font-semibold text-[#1A1D27] transition hover:bg-[#F7F8FA] sm:inline-flex"
            >
              Register
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#3B6FE8] to-[#6B9FFF] px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(59,111,232,0.22)] transition hover:shadow-[0_12px_30px_rgba(59,111,232,0.32)]"
            >
              Login
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-[#E8EAF0] bg-gradient-to-br from-white via-[#F7F8FA] to-[#EEF2FD]">
          <div className="absolute -left-32 -top-24 h-72 w-72 rounded-full bg-[#EEF2FD] blur-3xl" />
          <div className="absolute -right-24 bottom-0 h-64 w-64 rounded-full bg-[#D4E0FA] blur-3xl" />

          <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 lg:grid-cols-2 lg:py-20">
            <div className="space-y-6">
              <Pill>
                <Handshake className="h-4 w-4" />
                Built for students, universities, and hiring teams
              </Pill>
              <h1 className="font-display text-4xl font-bold leading-tight text-[#0F172A] md:text-5xl">
                Launch internships with clarity, speed, and trust.
              </h1>
              <p className="text-lg leading-8 text-[#4B5563] md:max-w-xl">
                InternConnect brings together verified companies, motivated students, and university oversight in one streamlined platform.
                Discover roles, apply confidently, and keep every stakeholder aligned from day one.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#1A1D27] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_40px_rgba(26,29,39,0.18)] transition hover:-translate-y-0.5 hover:bg-[#111827]"
                >
                  Get started
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/marketplace"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#E8EAF0] bg-white px-5 py-3 text-sm font-semibold text-[#1A1D27] transition hover:-translate-y-0.5 hover:border-[#3B6FE8] hover:text-[#3B6FE8]"
                >
                  Explore roles
                </Link>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-2 text-xs font-semibold text-[#3B6FE8] shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
                  <ShieldCheck className="h-4 w-4" />
                  Verified companies only
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 md:max-w-xl">
                <div className="rounded-2xl border border-[#E8EAF0] bg-white px-4 py-3 shadow-sm">
                  <div className="text-sm font-semibold text-[#6B7280]">Internship success rate</div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-[#1A1D27]">94%</span>
                    <span className="text-xs font-semibold text-[#3B6FE8]">last cohort</span>
                  </div>
                </div>
                <div className="rounded-2xl border border-[#E8EAF0] bg-white px-4 py-3 shadow-sm">
                  <div className="text-sm font-semibold text-[#6B7280]">Time saved per admin</div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-[#1A1D27]">12h</span>
                    <span className="text-xs font-semibold text-[#3B6FE8]">weekly</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-[28px] border border-[#E8EAF0] bg-white shadow-[0_16px_60px_rgba(0,0,0,0.08)]">
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80"
                  alt="Students collaborating around laptops"
                  className="h-full w-full rounded-[28px] object-cover"
                  loading="lazy"
                />
              </div>
              <div className="absolute -left-4 -bottom-6 rounded-2xl border border-[#D4E0FA] bg-white px-4 py-3 shadow-[0_10px_30px_rgba(59,111,232,0.18)] sm:-left-10 sm:-bottom-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF2FD] text-[#3B6FE8]">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1A1D27]">Trusted employers</p>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">University vetted</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
          <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <Pill>
                <Sparkles className="h-4 w-4" />
                What makes InternConnect different
              </Pill>
              <h2 className="mt-3 font-display text-3xl font-bold text-[#0F172A] md:text-4xl">
                Everything you need to run internships well.
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-7 text-[#4B5563]">
                We stitched the most-used workflows into one cohesive experience so teams can move faster without sacrificing quality or compliance.
              </p>
            </div>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#3B6FE8] transition hover:text-[#2D5CD4]"
            >
              See student view
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </section>

        {/* About / Value */}
        <section id="about" className="border-y border-[#E8EAF0] bg-white">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 lg:grid-cols-2 lg:py-20">
            <div className="space-y-4">
              <Pill>
                <LineChart className="h-4 w-4" />
                Built for measurable outcomes
              </Pill>
              <h3 className="font-display text-3xl font-bold text-[#0F172A]">
                Visibility for admins, clarity for students, credibility for companies.
              </h3>
              <p className="text-base leading-7 text-[#4B5563]">
                InternConnect keeps every touchpoint discoverable—applications, guidance tasks, diary entries, reviews, and reports. Admins see progress, students see next steps, and companies see the impact of their roles.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-start gap-3 rounded-2xl border border-[#E8EAF0] bg-[#F7F8FA] px-4 py-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 text-[#3B6FE8]" />
                  <div>
                    <p className="text-sm font-semibold text-[#1A1D27]">Compliance ready</p>
                    <p className="text-xs text-[#6B7280]">Secure auth, role-based flows, and auditable submissions.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-2xl border border-[#E8EAF0] bg-[#F7F8FA] px-4 py-3">
                  <BadgeCheck className="mt-0.5 h-5 w-5 text-[#3B6FE8]" />
                  <div>
                    <p className="text-sm font-semibold text-[#1A1D27]">Reusable data</p>
                    <p className="text-xs text-[#6B7280]">Profiles, reviews, and reports stay consistent across journeys.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                {stats.map((item) => (
                  <StatCard key={item.label} {...item} />
                ))}
              </div>
              <div className="rounded-2xl border border-[#E8EAF0] bg-[#0F172A] p-6 text-white shadow-[0_16px_48px_rgba(15,23,42,0.24)]">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-white/70">Testimonial</p>
                    <p className="text-base font-semibold">Career Services, Northshore University</p>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-6 text-white/80">
                  "InternConnect cut our admin time in half and gave students a clearer path to quality internships. Companies finally get consistent, ready-to-work candidates."
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <Pill>
                <Compass className="h-4 w-4" />
                How it works
              </Pill>
              <h3 className="mt-3 font-display text-3xl font-bold text-[#0F172A]">Onboard. Match. Deliver.</h3>
              <p className="mt-2 max-w-2xl text-base leading-7 text-[#4B5563]">
                Three simple steps keep every stakeholder aligned while preserving the rich functionality already built into the platform.
              </p>
            </div>
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#3B6FE8] transition hover:text-[#2D5CD4]"
            >
              Browse open roles
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {steps.map((step, index) => (
              <StepCard key={step.title} index={index} {...step} />
            ))}
          </div>
        </section>

        {/* CTA banner */}
        <section id="cta" className="pb-16">
          <div className="mx-auto max-w-6xl px-6">
            <div className="relative overflow-hidden rounded-3xl border border-[#D4E0FA] bg-gradient-to-r from-[#3B6FE8] to-[#6B9FFF] px-6 py-10 shadow-[0_18px_52px_rgba(59,111,232,0.28)] md:px-10 md:py-12">
              <div className="absolute -right-6 -top-10 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
              <div className="absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
              <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="max-w-2xl space-y-2 text-white">
                  <Pill>Ready to go live?</Pill>
                  <h3 className="font-display text-3xl font-bold leading-tight">Bring your internships onto InternConnect today.</h3>
                  <p className="text-sm leading-6 text-white/85">
                    Keep your existing dashboards, marketplace, and guidance flows—this homepage is ready to welcome every user with clear next steps.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#1A1D27] shadow-[0_12px_40px_rgba(255,255,255,0.25)] transition hover:-translate-y-0.5"
                  >
                    Login
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/70 bg-transparent px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    Create free account
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#E8EAF0] bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo_icon_only.png"
              alt="InternConnect logo"
              className="h-9 w-9 rounded-xl border border-[#E8EAF0] bg-white object-cover shadow-sm"
            />
            <div>
              <p className="font-display text-lg font-bold text-[#1A1D27]">InternConnect</p>
              <p className="text-xs text-[#6B7280]">Building confident career journeys.</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm font-semibold text-[#4B5563]">
            <a href="#features" className="hover:text-[#1A1D27]">Features</a>
            <a href="#about" className="hover:text-[#1A1D27]">About</a>
            <Link to="/marketplace" className="hover:text-[#1A1D27]">Marketplace</Link>
            <Link to="/login" className="hover:text-[#1A1D27]">Login</Link>
            <Link to="/register" className="hover:text-[#1A1D27]">Register</Link>
          </div>

          <p className="text-xs text-[#6B7280]">
            © {new Date().getFullYear()} InternConnect. Crafted with purpose for internship success.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Home
