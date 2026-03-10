import { useNavigate } from 'react-router-dom'

function Header({ active = 'opportunities', onTabChange }) {
    const navigate = useNavigate()

    const navItems = [
        {
            key: 'opportunities',
            label: 'Internship Opportunities',
            icon: (
                <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M3 7h18" />
                    <path d="M7 3v4" />
                    <path d="M17 3v4" />
                    <rect x="3" y="5" width="18" height="16" rx="2" />
                </svg>
            ),
        },
        {
            key: 'myInternships',
            label: 'My Internships',
            icon: (
                <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M20 7h-9" />
                    <path d="M14 17H5" />
                    <circle cx="17" cy="17" r="3" />
                    <circle cx="7" cy="7" r="3" />
                </svg>
            ),
        },
        {
            key: 'guidance',
            label: 'Student Guidance',
            icon: (
                <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M12 2a9 9 0 1 1 0 18A9 9 0 0 1 12 2z" />
                    <path d="M12 6v6l3 3" />
                </svg>
            ),
        },
        {
            key: 'reviews',
            label: 'Reviews & Feedbacks',
            icon: (
                <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
            ),
        },
        {
            key: 'profile',
            label: 'My Profile',
            icon: (
                <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
                </svg>
            ),
        },
    ]

    const handleNavClick = (item) => {
        if (item.key === 'profile') {
            navigate('/profile')
            return
        }

        if (item.key === 'opportunities' && window.location.pathname !== '/dashboard') {
            navigate('/dashboard')
            return
        }

        if (onTabChange) {
            onTabChange(item.key, item.label)
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('student')
        navigate('/')
    }

    return (
        <header className="sticky top-0 z-50 border-b border-[#E8EAF0] bg-white/95 backdrop-blur">
            <div className="flex w-full items-center justify-between px-8">
                <div className="flex items-center gap-3">
                    <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-gradient-to-br from-[#3B6FE8] to-[#6B9FFF] text-white">
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                        </svg>
                    </div>

                    <span className="font-display text-[19px] font-bold text-[#1A1D27]">
                        InternConnect
                    </span>
                </div>

                <nav className="hidden flex-wrap gap-1 lg:flex">
                    {navItems.map((item) => {
                        const isActive = active === item.key

                        return (
                            <button
                                key={item.key}
                                onClick={() => handleNavClick(item)}
                                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] transition ${isActive
                                        ? 'bg-[#EEF2FD] font-bold text-[#3B6FE8]'
                                        : 'font-medium text-[#6B7280] hover:bg-[#F7F8FA]'
                                    }`}
                            >
                                <span>{item.icon}</span>
                                <span>{item.label}</span>
                            </button>
                        )
                    })}
                </nav>

                <div className="flex items-center gap-3">
                    <button
                        className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#E8EAF0] bg-white"
                        type="button"
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#6B7280"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                    </button>

                    <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-gradient-to-br from-[#3B6FE8] to-[#6B9FFF] text-sm font-bold text-white">
                        AR
                    </div>

                    <button
                        onClick={handleLogout}
                        className="rounded-lg border border-[#E8EAF0] px-4 py-2 text-sm text-[#6B7280] hover:bg-[#F7F8FA]"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </header>
    )
}

export default Header