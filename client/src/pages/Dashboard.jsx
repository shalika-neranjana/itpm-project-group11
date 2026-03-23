import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import Header              from '../components/Header'
import InternshipList      from '../components/MyInternships/InternshipList'
import AddInternshipForm   from '../components/MyInternships/AddInternshipForm'
import InternshipDashboard from '../components/MyInternships/InternshipDashboard'
import Header from '../components/Header'
import StudentGuidancePage from '../components/student_guidance/StudentGuidancePage'

function Dashboard() {
  const location = useLocation()
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'opportunities')

  // ── Get student info from localStorage 
  const studentData = JSON.parse(localStorage.getItem('student'))
  const studentId   = studentData?.studentId   

  // ── My Internships state 
  const [miView,             setMiView]             = useState('list')
  const [selectedInternship, setSelectedInternship] = useState(null)
  const [listKey,            setListKey]            = useState(0)

  const handleOpenDashboard = (internship) => {
    setSelectedInternship(internship)
    setMiView('dashboard')
  }

  const handleAddSuccess = () => {
    setListKey(k => k + 1)
    setMiView('list')
  }

  const pageTitles = {
    opportunities: {
      title:    'Internship Opportunities',
      subtitle: 'Browse and apply for internship positions',
      message:  'Internship Opportunities is under development and coming soon.',
    },
    myInternships: {
      title:    'My Internships',
      subtitle: 'Manage your active and completed internships',
    },
    guidance: {
      title: 'Student Guidance',
      subtitle: 'Track results, interests, skills, and personalized career suggestions',
      message: 'Student Guidance content is loading.',
    },
    reviews: {
      title:    'Reviews & Feedbacks',
      subtitle: 'Anonymous internship experience sharing',
      message:  'Reviews & Feedbacks is under development and coming soon.',
    },
  }

  const current = pageTitles[activeTab]
  const mainClassName =
    activeTab === 'guidance'
      ? 'mx-auto max-w-[1600px] px-6 py-7 xl:px-8'
      : 'mx-auto max-w-[1200px] px-8 py-7'

  const renderMyInternships = () => {
    if (miView === 'add') {
      return (
        <AddInternshipForm
          onSuccess={handleAddSuccess}
          onCancel={() => setMiView('list')}
        />
      )
    }
    if (miView === 'dashboard' && selectedInternship) {
      return (
        <InternshipDashboard
          internship={selectedInternship}
          onBack={() => {
            setMiView('list')
            setSelectedInternship(null)
          }}
        />
      )
    }
    // Default — list view
    return (
      <InternshipList
        key={listKey}
        studentId={studentId}        
        onOpen={handleOpenDashboard}
        onAddNew={() => setMiView('add')}
      />
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <Header
        active={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab)
          if (tab === 'myInternships') {
            setMiView('list')
            setSelectedInternship(null)
          }
        }}
      />
      <main className="mx-auto max-w-[1200px] px-8 py-7">
        <div className="mb-6">
          <h1 className="font-display text-[28px] font-bold text-[#1A1D27]">
            {current.title}
          </h1>
          <p className="mt-1 text-sm text-[#6B7280]">{current.subtitle}</p>
        </div>

        {activeTab === 'myInternships' ? (
          renderMyInternships()
        {activeTab === 'guidance' ? (
          <StudentGuidancePage />
        ) : (
          <div className="rounded-2xl border border-[#E8EAF0] bg-white p-8 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
            <div className="rounded-2xl border border-dashed border-[#D4E0FA] bg-[#F7F8FA] p-10 text-center">
              <h2 className="font-display text-2xl font-bold text-[#1A1D27]">
                {current.title}
              </h2>
              <p className="mt-3 text-base text-[#6B7280]">{current.message}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default Dashboard
