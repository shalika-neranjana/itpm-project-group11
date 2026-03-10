import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Header({ active = 'opportunities', onTabChange }) {
    const navigate = useNavigate()
    const [showUserMenu, setShowUserMenu] = useState(false)

    const student = JSON.parse(localStorage.getItem('student') || '{}')
    const initials = `${student.firstName?.[0] || ''}${student.lastName?.[0] || ''}`.toUpperCase() || 'ST'

    const navItems = [
        {
            key: 'opportunities',
            label: 'Internship Opportunities',
            icon: (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="2" />
                    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
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

        if (window.location.pathname !== '/dashboard') {
            navigate('/dashboard', { state: { tab: item.key } })
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
        <header className="sticky top-0 z-50 border-b border-[#E8EAF0] bg-white/95 backdrop-blur-sm">
            <div className="flex h-[64px] w-full items-center justify-between px-8">
                <div className="flex items-center gap-3">
                    <div className="flex h-[36px] w-[36px] items-center justify-center rounded-[10px] bg-gradient-to-br from-[#3B6FE8] to-[#6B9FFF] shadow-sm">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
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
                                className={`flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-medium transition-colors ${isActive
                                        ? 'bg-[#EEF2FD] text-[#3B6FE8]'
                                        : 'text-[#6B7280] hover:bg-[#F7F8FA] hover:text-[#1A1D27]'
                                    }`}
                            >
                                <span>{item.icon}</span>
                                <span>{item.label}</span>
                            </button>
                        )
                    })}
                </nav>

                <div className="flex items-center gap-2">
                    <button
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E8EAF0] bg-white text-[#6B7280] transition hover:bg-[#F7F8FA]"
                        type="button"
                        aria-label="Notifications"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                    </button>

                    <div className="relative">
                        <button
                            onClick={() => setShowUserMenu((v) => !v)}
                            className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-gradient-to-br from-[#3B6FE8] to-[#6B9FFF] text-sm font-bold text-white shadow-sm"
                        >
                            {initials}
                        </button>

                        {showUserMenu && (
                            <div className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-[#E8EAF0] bg-white p-1 shadow-lg">
                                <button
                                    onClick={() => { setShowUserMenu(false); navigate('/profile') }}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[#1A1D27] hover:bg-[#F7F8FA]"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                    My Profile
                                </button>
                                <div className="my-1 h-px bg-[#E8EAF0]" />
                                <button
                                    onClick={handleLogout}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-500 hover:bg-red-50"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                        <polyline points="16 17 21 12 16 7" />
                                        <line x1="21" y1="12" x2="9" y2="12" />
                                    </svg>
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </header>
    )
}

export default Header