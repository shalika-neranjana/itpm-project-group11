import { Link } from 'react-router-dom'

const navItems = [
  { label: 'Features', href: '#features' },
  { label: 'Metrics', href: '#stats' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'How It Works', href: '#how-it-works' }
]

function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/70 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/logo_icon_only.png"
            alt="InternConnect logo"
            className="h-10 w-10 rounded-lg border border-gray-200 object-cover"
          />
          <span className="text-xl font-bold tracking-tight text-gray-900">InternConnect</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="group relative text-sm font-semibold text-gray-600 transition-all duration-300 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2"
            >
              {item.label}
              <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-blue-600 transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition-all duration-300 hover:scale-105 hover:border-blue-400 hover:text-blue-700 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-indigo-600 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/70 focus-visible:ring-offset-2"
          >
            Register
          </Link>
        </div>
      </div>
    </header>
  )
}

export default Navbar
