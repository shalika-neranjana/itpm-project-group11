import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import InternshipList from '../components/MyInternships/InternshipList'
import AddInternshipForm from '../components/MyInternships/AddInternshipForm'
import InternshipDashboard from '../components/MyInternships/InternshipDashboard'
import StudentGuidancePage from '../components/student_guidance/StudentGuidancePage'
import api from '../api'

function Dashboard() {
  const location = useLocation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'opportunities')
  const [internships, setInternships] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    specialization: '',
    type: ''
  })

  useEffect(() => {
    if (activeTab === 'opportunities') {
      fetchInternships()
    }
  }, [activeTab, filters])

  const fetchInternships = async () => {
    try {
      const response = await api.get('/internships', { params: filters })
      setInternships(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch internships:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleApply = (internshipId) => {
    navigate(`/apply/${internshipId}`)
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

        {activeTab === 'opportunities' ? (
          <div className="rounded-2xl border border-[#E8EAF0] bg-white p-8 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
              <input
                type="text"
                placeholder="Search internships..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={filters.specialization}
                onChange={(e) => handleFilterChange('specialization', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Specializations</option>
                <option>Computer Science</option>
                <option>Data Science</option>
                <option>Multimedia</option>
                <option>Software Engineering</option>
                <option>Cybersecurity</option>
              </select>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                <option>On-site</option>
                <option>Remote</option>
                <option>Hybrid</option>
              </select>
            </div>

            {/* Internship Cards */}
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : internships.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {internships.map((internship) => (
                  <div key={internship._id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-lg text-white font-bold flex items-center justify-center mr-3">
                        {internship.company?.name?.substring(0, 2).toUpperCase() || 'CO'}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{internship.title}</h3>
                        <p className="text-sm text-gray-600">{internship.company?.name}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {internship.specialization}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        internship.type === 'Remote' ? 'bg-purple-100 text-purple-800' :
                        internship.type === 'Hybrid' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {internship.type}
                      </span>
                    </div>

                    <div className="text-sm text-gray-600 mb-4">
                      <div className="flex justify-between mb-1">
                        <span>⏱ {internship.duration}</span>
                        <span>📅 {new Date(internship.deadline).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>📍 {internship.location}</span>
                        <span>💰 {internship.stipend}</span>
                      </div>
                    </div>

                    <div className="text-sm text-gray-700 mb-4 line-clamp-3">
                      {internship.description}
                    </div>

                    <button
                      onClick={() => handleApply(internship._id)}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      Apply Now
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No internships found matching your criteria.</p>
              </div>
            )}
          </div>
        ) : activeTab === 'myInternships' ? (
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
