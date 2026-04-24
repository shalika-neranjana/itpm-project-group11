import { Link } from 'react-router-dom'

function CTA() {
  return (
    <section className="px-6 pb-16">
      <div className="mx-auto w-full max-w-7xl">
        <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-12 shadow-md md:px-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Build a more reliable internship pipeline with InternConnect
              </h2>
              <p className="mt-3 text-base leading-7 text-blue-100">
                Launch faster, improve oversight, and deliver consistent internship outcomes across your institution.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/login"
                className="rounded-lg border border-white/70 px-5 py-3 text-sm font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-white/10 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-600"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-white px-5 py-3 text-sm font-semibold text-blue-700 transition-all duration-300 hover:scale-105 hover:bg-blue-50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-600"
              >
                Create account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CTA
