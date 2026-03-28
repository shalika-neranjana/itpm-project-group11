function Testimonials() {
  return (
    <section id="testimonials" className="mx-auto w-full max-w-7xl px-6 py-16 lg:py-20">
      <div className="mx-auto max-w-4xl rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-8 shadow-sm transition-all duration-300 hover:shadow-lg md:p-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Testimonials</p>
        <blockquote className="mt-4 text-xl font-semibold leading-9 text-gray-900 md:text-2xl">
          “InternConnect helped us standardize internship delivery across departments while giving students a more professional and transparent experience.”
        </blockquote>
        <div className="mt-6 border-t border-gray-200 pt-5">
          <p className="text-base font-semibold text-gray-900">Career Services Office</p>
          <p className="text-sm text-gray-600">Program Director, Northshore University</p>
        </div>
      </div>
    </section>
  )
}

export default Testimonials
