import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import CompanyReview from '../components/CompanyReview'
import InternshipList from '../components/MyInternships/InternshipList'
import AddInternshipForm from '../components/MyInternships/AddInternshipForm'
import InternshipDashboard from '../components/MyInternships/InternshipDashboard'
import StudentGuidancePage from '../components/student_guidance/StudentGuidancePage'

function Dashboard() {
  const location = useLocation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'opportunities')
  const [reviews, setReviews] = useState([])

  useEffect(() => {
    // Load user-submitted reviews from localStorage
    const userReviews = JSON.parse(localStorage.getItem('userReviews') || '[]')
    setReviews(userReviews)
  }, [])

  const handleDeleteReview = (reviewId) => {
    // Remove from state
    setReviews(reviews.filter(review => review.id !== reviewId))
    
    // Remove from localStorage
    const userReviews = JSON.parse(localStorage.getItem('userReviews') || '[]')
    const updatedReviews = userReviews.filter(review => review.id !== reviewId)
    localStorage.setItem('userReviews', JSON.stringify(updatedReviews))
  }

  const handleEditReview = (review) => {
    // Navigate to edit page with review data
    navigate('/write-review', { state: { review } })
  }

  // Get student info from localStorage.
  const studentData = JSON.parse(localStorage.getItem('student'))
  const studentId = studentData?.studentId

  // My Internships state.
  const [miView, setMiView] = useState('list')
  const [selectedInternship, setSelectedInternship] = useState(null)
  const [listKey, setListKey] = useState(0)

  const handleOpenDashboard = (internship) => {
    setSelectedInternship(internship)
    setMiView('dashboard')
  }

  const handleAddSuccess = () => {
    setListKey((k) => k + 1)
    setMiView('list')
  }

  const pageTitles = {
    opportunities: {
      title: 'Internship Opportunities',
      subtitle: 'Browse and apply for internship positions',
      message: 'Internship Opportunities is under development and coming soon.',
    },
    myInternships: {
      title: 'My Internships',
      subtitle: 'Manage your active and completed internships',
    },
    guidance: {
      title: 'Student Guidance',
      subtitle: 'Track results, interests, skills, and personalized career suggestions',
      message: 'Student Guidance content is loading.',
    },
    reviews: {
      title: 'Reviews & Feedbacks',
      subtitle: 'Anonymous internship experience sharing',
      message: 'Reviews & Feedbacks is under development and coming soon.',
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
      <main className={mainClassName}>
        <div className="mb-6">
          <h1 className="font-display text-[28px] font-bold text-[#1A1D27]">
            {current.title}
          </h1>
          <p className="mt-1 text-sm text-[#6B7280]">{current.subtitle}</p>
        </div>

        {activeTab === 'reviews' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold text-[#1A1D27]">
                Company Reviews
              </h2>
              <button
                onClick={() => navigate('/write-review')}
                className="flex items-center gap-2 rounded-lg bg-[#3B6FE8] px-4 py-2 font-semibold text-white transition hover:bg-[#2D5CD4]"
              >
                <span>+</span>
                Write Anonymous Review
              </button>
            </div>
            {reviews.length > 0 ? (
              reviews.map(review => (
                <CompanyReview key={review.id} review={review} onDelete={handleDeleteReview} onEdit={handleEditReview} />
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-[#D4E0FA] bg-[#F7F8FA] p-8 text-center">
                <p className="text-[#6B7280]">No reviews yet. Be the first to share your experience!</p>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-[#E8EAF0] bg-white p-8 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
            <div className="rounded-2xl border border-dashed border-[#D4E0FA] bg-[#F7F8FA] p-10 text-center">
              <h2 className="font-display text-2xl font-bold text-[#1A1D27]">
                {current.title}
              </h2>
              <p className="mt-3 text-base text-[#6B7280]">{current.message}</p>
            </div>
          </div>
        {activeTab === 'myInternships' ? (
          renderMyInternships()
        ) : activeTab === 'guidance' ? (
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
