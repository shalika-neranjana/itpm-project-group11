import { Link } from 'react-router-dom'

const footerLinks = [
  { label: 'Features', href: '#features' },
  { label: 'About', href: '#stats' },
  { label: 'Marketplace', to: '/marketplace' },
  { label: 'Login', to: '/login' },
  { label: 'Register', to: '/register' }
]

function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-12 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <img
              src="/logo_icon_only.png"
              alt="InternConnect logo"
              className="h-10 w-10 rounded-lg border border-gray-200 object-cover"
            />
            <span className="text-lg font-bold text-gray-900">InternConnect</span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-6 text-gray-500">
            Enterprise-grade internship management built for universities, students, and hiring partners.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">Navigation</h3>
          <ul className="mt-4 space-y-2">
            {footerLinks.map((link) => (
              <li key={link.label}>
                {link.href ? (
                  <a
                    href={link.href}
                    className="text-sm text-gray-500 transition-all duration-300 hover:text-blue-600"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    to={link.to}
                    className="text-sm text-gray-500 transition-all duration-300 hover:text-blue-600"
                  >
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">Company</h3>
          <p className="mt-4 text-sm leading-6 text-gray-500">
            Contact teams, student offices, and partner organizations through one trusted platform.
          </p>
        </div>
      </div>

      <div className="border-t border-gray-200">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} InternConnect</p>
          <p>Student internships made easy</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
