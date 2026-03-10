import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import Header from '../components/Header'

function Dashboard() {
  const location = useLocation()
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'opportunities')

  const pageTitles = {
    opportunities: {
      title: 'Internship Opportunities',
      subtitle: 'Browse and apply for internship positions',
      message: 'Internship Opportunities is under development and coming soon.',
    },
    myInternships: {
      title: 'My Internships',
      subtitle: 'Manage your active and completed internships',
      message: 'My Internships is under development and coming soon.',
    },
    guidance: {
      title: 'Student Guidance',
      subtitle: 'Get AI-powered career path recommendations',
      message: 'Student Guidance is under development and coming soon.',
    },
    reviews: {
      title: 'Reviews & Feedbacks',
      subtitle: 'Anonymous internship experience sharing',
      message: 'Reviews & Feedbacks is under development and coming soon.',
    },
  }

  const current = pageTitles[activeTab]

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <Header active={activeTab} onTabChange={setActiveTab} />

      <main className="mx-auto max-w-[1200px] px-8 py-7">
        <div className="mb-6">
          <h1 className="font-display text-[28px] font-bold text-[#1A1D27]">
            {current.title}
          </h1>
          <p className="mt-1 text-sm text-[#6B7280]">{current.subtitle}</p>
        </div>

        <div className="rounded-2xl border border-[#E8EAF0] bg-white p-8 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
          <div className="rounded-2xl border border-dashed border-[#D4E0FA] bg-[#F7F8FA] p-10 text-center">
            <h2 className="font-display text-2xl font-bold text-[#1A1D27]">
              {current.title}
            </h2>
            <p className="mt-3 text-base text-[#6B7280]">{current.message}</p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard