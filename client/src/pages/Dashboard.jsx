import { useState, useEffect, useCallback, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import CompanyReview from '../components/CompanyReview'
import InternshipList from '../components/MyInternships/InternshipList'
import AddInternshipForm from '../components/MyInternships/AddInternshipForm'
import InternshipDashboard from '../components/MyInternships/InternshipDashboard'
import StudentGuidancePage from '../components/student_guidance/StudentGuidancePage'
import { X } from 'lucide-react'
import api from '../api'
import { getAllReviews, deleteReview } from '../api/reviews'

const DASHBOARD_TABS = ['opportunities', 'myInternships', 'guidance', 'reviews', 'profile']

const DURATION_RANGE_OPTIONS = [
  { value: '0-3', label: '0-3 months', min: 0, max: 3 },
  { value: '4-6', label: '4-6 months', min: 4, max: 6 },
  { value: '7-12', label: '7-12 months', min: 7, max: 12 },
  { value: '13+', label: '13+ months', min: 13, max: Number.POSITIVE_INFINITY }
]
const STIPEND_RANGE_OPTIONS = [
  { value: '0-25000', label: 'LKR 0 - 25,000', min: 0, max: 25000 },
  { value: '25001-50000', label: 'LKR 25,001 - 50,000', min: 25001, max: 50000 },
  { value: '50001-100000', label: 'LKR 50,001 - 100,000', min: 50001, max: 100000 },
  { value: '100001+', label: 'LKR 100,001+', min: 100001, max: Number.POSITIVE_INFINITY }
]

const getTabFromLocation = (location) => {
  const queryTab = new URLSearchParams(location.search).get('tab')
  if (queryTab && DASHBOARD_TABS.includes(queryTab)) {
    return queryTab
  }

  if (location.pathname === '/profile') {
    return 'profile'
  }

  if (location.state?.tab && DASHBOARD_TABS.includes(location.state.tab)) {
    return location.state.tab
  }

  return 'opportunities'
}

function Dashboard() {
  const location = useLocation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(() => getTabFromLocation(location))
  const [internships, setInternships] = useState([])
  const [selectedOpportunity, setSelectedOpportunity] = useState(null)
  const [isOpportunityViewOpen, setIsOpportunityViewOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    specialization: '',
    type: '',
    duration: '',
    stipend: ''
  })

  const fetchInternships = useCallback(async () => {
    setLoading(true)
    try {
      const response = await api.get('/internships')
      setInternships(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch internships:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (activeTab === 'opportunities') {
      fetchInternships()
    }
  }, [activeTab, fetchInternships])

  useEffect(() => {
    const nextTab = getTabFromLocation(location)
    setActiveTab(nextTab)

    if (nextTab !== 'myInternships') {
      setMiView('list')
      setSelectedInternship(null)
    }
  }, [location.pathname, location.search, location.state])

  const handleTabChange = (tab) => {
    const targetPath = tab === 'profile' ? '/profile' : '/dashboard'
    const targetSearch = tab === 'opportunities' || tab === 'profile' ? '' : `?tab=${tab}`
    const nextUrl = `${targetPath}${targetSearch}`
    const currentUrl = `${location.pathname}${location.search}`

    if (currentUrl !== nextUrl) {
      navigate(nextUrl)
      return
    }

    setActiveTab(tab)
    if (tab !== 'myInternships') {
      setMiView('list')
      setSelectedInternship(null)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const parseDurationInMonths = (durationValue) => {
    if (durationValue === null || durationValue === undefined) {
      return null
    }

    if (typeof durationValue === 'number') {
      return Number.isFinite(durationValue) ? durationValue : null
    }

    const matched = String(durationValue).match(/\d+/)
    return matched ? Number(matched[0]) : null
  }
  
  const parseStipendAmount = (stipendValue) => {
    if (stipendValue === null || stipendValue === undefined) {
      return null
    }

    if (typeof stipendValue === 'number') {
      return Number.isFinite(stipendValue) ? stipendValue : null
    }

    const digitsOnly = String(stipendValue).replace(/[^\d]/g, '')
    return digitsOnly ? Number(digitsOnly) : null
  }

  const specializationOptions = useMemo(() => {
    return [...new Set(internships.map((internship) => internship.specialization).filter(Boolean))]
  }, [internships])

  const stipendOptions = useMemo(() => {
    return [...new Set(internships.map((internship) => internship.stipend).filter(Boolean))]
  }, [internships])

  const filteredInternships = useMemo(() => {
    const searchValue = filters.search.trim().toLowerCase()

    return internships.filter((internship) => {
      const matchesSearch =
        !searchValue ||
        internship.title?.toLowerCase().includes(searchValue) ||
        internship.company?.name?.toLowerCase().includes(searchValue) ||
        internship.location?.toLowerCase().includes(searchValue)

      const matchesType = !filters.type || internship.type === filters.type
      const matchesSpecialization =
        !filters.specialization || internship.specialization === filters.specialization
      const selectedDurationRange = DURATION_RANGE_OPTIONS.find((range) => range.value === filters.duration)
      const durationInMonths = parseDurationInMonths(internship.duration)
      const matchesDuration =
        !selectedDurationRange ||
        (durationInMonths !== null &&
          durationInMonths >= selectedDurationRange.min &&
          durationInMonths <= selectedDurationRange.max)
      const selectedStipendRange = STIPEND_RANGE_OPTIONS.find((range) => range.value === filters.stipend)
      const stipendAmount = parseStipendAmount(internship.stipend)
      const matchesStipend =
        !selectedStipendRange ||
        (stipendAmount !== null &&
          stipendAmount >= selectedStipendRange.min &&
          stipendAmount <= selectedStipendRange.max)

      return (
        matchesSearch &&
        matchesType &&
        matchesSpecialization &&
        matchesDuration &&
        matchesStipend
      )
    })
  }, [internships, filters])

  const handleApply = (internshipId) => {
    navigate(`/apply/${internshipId}`)
  }

  const handleViewOpportunity = (internship) => {
    setSelectedOpportunity(internship)
    setIsOpportunityViewOpen(true)
  }

  const [reviews, setReviews] = useState([])
  const [reviewsSearch, setReviewsSearch] = useState('')
  const [ratingFilter, setRatingFilter] = useState('')
  const token = localStorage.getItem('token')
  const [profileFormData, setProfileFormData] = useState({
    studentId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    linkedin: '',
    profileImage: '',
  })
  const [profileMessage, setProfileMessage] = useState('')
  const [profileError, setProfileError] = useState('')
  const [profileImageLoadFailed, setProfileImageLoadFailed] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [notificationsError, setNotificationsError] = useState('')
  const [notificationsLoading, setNotificationsLoading] = useState(false)

  useEffect(() => {
    // Load all reviews from API (visible to all students)
    const loadReviews = async () => {
      try {
        const allReviews = await getAllReviews()
        setReviews(allReviews)
      } catch (error) {
        console.error('Failed to fetch reviews:', error)
        setReviews([])
      }
    }
    
    loadReviews()
  }, [])

  useEffect(() => {
    const student = JSON.parse(localStorage.getItem('student') || 'null')
    if (!student) {
      return
    }

    setProfileFormData({
      studentId: student.studentId || '',
      firstName: student.firstName || '',
      lastName: student.lastName || '',
      email: student.email || '',
      phone: student.phone || '',
      linkedin: student.linkedin || '',
      profileImage: student.profileImage || '',
    })
  }, [])

  const fetchNotifications = async () => {
    setNotificationsLoading(true)
    setNotificationsError('')

    try {
      const response = await api.get('/students/notifications')
      setNotifications(response.data.data || [])
    } catch (err) {
      setNotificationsError(err.response?.data?.message || 'Failed to load notifications')
    } finally {
      setNotificationsLoading(false)
    }
  }

  useEffect(() => {
    if (!token) return

    fetchNotifications()

    const onFocus = () => {
      fetchNotifications()
    }

    const interval = setInterval(() => {
      fetchNotifications()
    }, 15000)

    window.addEventListener('focus', onFocus)
    return () => {
      window.removeEventListener('focus', onFocus)
      clearInterval(interval)
    }
  }, [token])

  const markNotificationAsRead = async (id) => {
    try {
      await api.put(`/students/notifications/${id}/read`)
      setNotifications((prev) => prev.map((item) => (item._id === id ? { ...item, read: true } : item)))
    } catch (err) {
      console.error('Failed to mark notification as read', err)
    }
  }

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return
    }
    
    try {
      await deleteReview(reviewId)
      setReviews((prev) => prev.filter(review => review._id !== reviewId))
    } catch (error) {
      console.error('Failed to delete review:', error)
      alert('Failed to delete review. Please try again.')
    }
  }

  const handleEditReview = (review) => {
    // Navigate to edit page with review data
    navigate('/write-review', { state: { review } })
  }

  const handleProfileChange = (e) => {
    setProfileFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
    setProfileMessage('')
    setProfileError('')
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()

    try {
      const response = await api.put('/students/profile', profileFormData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const updatedStudent = response.data.data
      localStorage.setItem('student', JSON.stringify(updatedStudent))
      setProfileFormData({
        studentId: updatedStudent.studentId || '',
        firstName: updatedStudent.firstName || '',
        lastName: updatedStudent.lastName || '',
        email: updatedStudent.email || '',
        phone: updatedStudent.phone || '',
        linkedin: updatedStudent.linkedin || '',
        profileImage: updatedStudent.profileImage || '',
      })
      setProfileMessage('Profile updated successfully')
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Update failed')
    }
  }

  const handleProfileDelete = async () => {
    const confirmDelete = window.confirm('Are you sure you want to delete your account?')
    if (!confirmDelete) {
      return
    }

    try {
      await api.delete('/students/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      localStorage.removeItem('token')
      localStorage.removeItem('student')
      navigate('/')
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Delete failed')
    }
  }

  // Get student info from localStorage once on mount.
  const studentData = useMemo(() => {
    const stored = localStorage.getItem('student')
    return stored ? JSON.parse(stored) : null
  }, [])
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
    profile: {
      title: 'My Profile',
      subtitle: 'View and manage your student profile',
    },
  }

  const current = pageTitles[activeTab]
  const mainClassName = 'mx-auto max-w-[1600px] px-6 py-7 xl:px-8'

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

  const initials =
    `${profileFormData.firstName?.[0] || ''}${profileFormData.lastName?.[0] || ''}`.toUpperCase() || 'ST'

  const profileImageUrl = useMemo(() => {
    const profileImage = profileFormData.profileImage

    if (!profileImage) {
      return ''
    }

    if (profileImage.startsWith('http')) {
      return profileImage
    }

    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
    const origin = base.replace(/\/api\/?$/, '')
    return `${origin}${profileImage}`
  }, [profileFormData.profileImage])

  useEffect(() => {
    setProfileImageLoadFailed(false)
  }, [profileImageUrl])

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#e8edf6]">
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/authbackgound.jpg')" }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/40 via-white/25 to-[#d8e6f8]/35" />
      <Header
        active={activeTab}
        onTabChange={handleTabChange}
      />
      <main className={`relative z-10 ${mainClassName}`}>
        <div className="mb-6">
          <h1 className="font-display text-[36px] font-bold text-[#0F1419]">
            {current.title}
          </h1>
          <p className="mt-2 text-base font-bold text-[#3E4957]">{current.subtitle}</p>
        </div>

        {activeTab === 'opportunities' ? (
          <>
            {/* Filters */}
            <div className="mb-6 flex flex-wrap gap-4">
              <input
                type="text"
                placeholder="Search internships..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-80 px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={filters.specialization}
                onChange={(e) => handleFilterChange('specialization', e.target.value)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Specializations</option>
                {specializationOptions.map((specialization) => (
                  <option key={specialization} value={specialization}>
                    {specialization}
                  </option>
                ))}
              </select>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                <option>On-site</option>
                <option>Remote</option>
                <option>Hybrid</option>
              </select>
              <select
                value={filters.duration}
                onChange={(e) => handleFilterChange('duration', e.target.value)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Durations</option>
                {DURATION_RANGE_OPTIONS.map((durationRange) => (
                  <option key={durationRange.value} value={durationRange.value}>
                    {durationRange.label}
                  </option>
                ))}
              </select>
              <select
                value={filters.stipend}
                onChange={(e) => handleFilterChange('stipend', e.target.value)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Stipends</option>
                {STIPEND_RANGE_OPTIONS.map((stipendRange) => (
                  <option key={stipendRange.value} value={stipendRange.value}>
                    {stipendRange.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Internship Cards */}
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredInternships.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredInternships.map((internship) => (
                  <article
                    key={internship._id}
                    onClick={() => handleViewOpportunity(internship)}
                    className="rounded-2xl border border-[#E8EAF0] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl overflow-hidden flex flex-col cursor-pointer"
                  >
                    {/* Header Section */}
                    <div className="p-6 pb-4">
                      {/* Job Title */}
                      <h3 className="text-xl font-bold text-[#1A1D27] mb-3 line-clamp-2">{internship.title}</h3>
                      
                      {/* Company */}
                      <p className="text-sm font-semibold text-[#1A1D27] mb-3">
                        {typeof internship.company === 'object' 
                          ? internship.company?.name || 'Unknown Company'
                          : internship.company || 'Unknown Company'}
                      </p>

                      {/* Type and Specialization Tags Row */}
                      <div className="flex gap-2 flex-wrap">
                        <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-200">
                          {internship.type || 'Not set'}
                        </span>
                        <span className="inline-flex rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700 border border-purple-200">
                          {internship.specialization || 'General'}
                        </span>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-[#E8EAF0]"></div>

                    {/* Info Grid */}
                    <div className="p-6 flex-1">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-2">Stipend</p>
                          <p className="text-base font-bold text-[#1A1D27]">{internship.stipend || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-2">Duration</p>
                          <p className="text-base font-bold text-[#1A1D27]">{internship.duration || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-2">Location</p>
                          <p className="text-base font-bold text-[#1A1D27]">{internship.location || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-2">Openings</p>
                          <p className="text-base font-bold text-[#1A1D27]">{internship.slots}</p>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No internships found for selected filters.</p>
              </div>
            )}
          </>
        ) : activeTab === 'reviews' ? (
          <div className="space-y-5">
            <div className="mb-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-bold text-[#1A1D27]">
                  Company Reviews
                </h2>
                <button
                  onClick={() => navigate('/write-review')}
                  className="flex items-center gap-2 rounded-lg bg-[#3B6FE8] px-4 py-2 font-semibold text-white transition hover:bg-[#2D5CD4] cursor-pointer"
                >
                  <span>+</span>
                  Write Anonymous Review
                </button>
              </div>
              {reviews.length > 0 && (
                <div className="flex flex-wrap gap-4">
                  <input
                    type="text"
                    placeholder="Search by company name or role..."
                    value={reviewsSearch}
                    onChange={(e) => setReviewsSearch(e.target.value)}
                    className="w-80 px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <select
                    value={ratingFilter}
                    onChange={(e) => setRatingFilter(e.target.value)}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Ratings</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4+ Stars</option>
                    <option value="3">3+ Stars</option>
                    <option value="2">2+ Stars</option>
                    <option value="1">1+ Stars</option>
                  </select>
                </div>
              )}
            </div>
            {reviews.length > 0 ? (
              (() => {
                const filteredReviews = reviews.filter((review) => {
                  const searchLower = reviewsSearch.toLowerCase()
                  const matchesSearch =
                    review.company?.toLowerCase().includes(searchLower) ||
                    review.role?.toLowerCase().includes(searchLower)
                  const matchesRating =
                    ratingFilter === '' ||
                    (review.rating && parseInt(review.rating) >= parseInt(ratingFilter))
                  return matchesSearch && matchesRating
                })
                
                return filteredReviews.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredReviews.map((review) => (
                      <CompanyReview
                        key={review.id}
                        review={review}
                        onDelete={handleDeleteReview}
                        onEdit={handleEditReview}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-[#D4E0FA] bg-[#F7F8FA] p-8 text-center">
                    <p className="text-[#6B7280]">
                      No reviews found matching "{reviewsSearch}"
                    </p>
                  </div>
                )
              })()
            ) : (
              <div className="rounded-lg border border-dashed border-[#D4E0FA] bg-[#F7F8FA] p-8 text-center">
                <p className="text-[#6B7280]">
                  No reviews yet. Be the first to share your experience!
                </p>
              </div>
            )}
          </div>
        ) : activeTab === 'myInternships' ? (
          renderMyInternships()
        ) : activeTab === 'profile' ? (
          <div>
            {profileMessage && (
              <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
                {profileMessage}
              </div>
            )}

            {profileError && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {profileError}
              </div>
            )}

            <div className="mb-5 rounded-2xl border border-[#E8EAF0] bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-[#1A1D27]">Notifications</h3>
                <span className="text-sm text-[#6B7280]">{notifications.filter((n) => !n.read).length} unread</span>
              </div>

              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs text-[#6B7280]">Updated at {new Date().toLocaleTimeString()}</span>
                <button
                  onClick={fetchNotifications}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                >
                  Refresh
                </button>
              </div>
              {notificationsLoading ? (
                <div className="text-sm text-[#6B7280]">Loading notifications...</div>
              ) : notificationsError ? (
                <div className="text-sm text-red-600">{notificationsError}</div>
              ) : notifications.length === 0 ? (
                <div className="text-sm text-[#6B7280]">No notifications yet.</div>
              ) : (
                <div className="space-y-2">
                  {notifications.map((notif) => (
                    <div
                      key={notif._id}
                      className={`rounded-lg border px-3 py-2 ${notif.read ? 'border-gray-200 bg-gray-50' : 'border-blue-200 bg-blue-50'}`}
                    >
                      <p className="text-sm text-[#1F2937]">{notif.message}</p>
                      <div className="mt-1 flex items-center justify-between">
                        <p className="text-xs text-[#6B7280]">{new Date(notif.createdAt).toLocaleString()}</p>
                        {!notif.read && (
                          <button
                            onClick={() => markNotificationAsRead(notif._id)}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
              <div className="rounded-2xl border border-[#E8EAF0] bg-white p-6 text-center shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                {profileImageUrl && !profileImageLoadFailed ? (
                  <img
                    src={profileImageUrl}
                    alt="Student profile"
                    className="mx-auto mb-4 h-20 w-20 rounded-full border border-[#E8EAF0] object-cover"
                    onError={() => setProfileImageLoadFailed(true)}
                  />
                ) : null}

                {!profileImageUrl || profileImageLoadFailed ? (
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#3B6FE8] to-[#6B9FFF] text-[28px] font-bold text-white">
                    {initials}
                  </div>
                ) : null}

                <h2 className="text-lg font-bold text-[#1A1D27]">
                  {profileFormData.firstName} {profileFormData.lastName}
                </h2>

                <p className="mt-1 text-sm text-[#6B7280]">{profileFormData.email}</p>

                <div className="mt-6 rounded-xl bg-[#F7F8FA] p-4 text-left">
                  <div className="mb-3">
                    <p className="text-xs text-[#6B7280]">Student ID</p>
                    <p className="text-sm font-semibold text-[#1A1D27]">{profileFormData.studentId || '-'}</p>
                  </div>

                  <div className="mb-3">
                    <p className="text-xs text-[#6B7280]">Phone</p>
                    <p className="text-sm font-semibold text-[#1A1D27]">{profileFormData.phone || '-'}</p>
                  </div>

                  <div>
                    <p className="text-xs text-[#6B7280]">LinkedIn</p>
                    <p className="break-all text-sm font-semibold text-[#1A1D27]">
                      {profileFormData.linkedin || '-'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[#E8EAF0] bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                <h2 className="mb-5 font-display text-2xl font-bold text-[#1A1D27]">
                  Edit Profile
                </h2>

                <form onSubmit={handleProfileUpdate} className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-[#1A1D27]">
                      Student ID
                    </label>
                    <input
                      type="text"
                      name="studentId"
                      value={profileFormData.studentId}
                      onChange={handleProfileChange}
                      className="w-full rounded-[10px] border border-[#E8EAF0] bg-white px-4 py-3 text-sm outline-none focus:border-[#3B6FE8]"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-[#1A1D27]">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={profileFormData.email}
                      onChange={handleProfileChange}
                      className="w-full rounded-[10px] border border-[#E8EAF0] bg-white px-4 py-3 text-sm outline-none focus:border-[#3B6FE8]"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-[#1A1D27]">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={profileFormData.firstName}
                      onChange={handleProfileChange}
                      className="w-full rounded-[10px] border border-[#E8EAF0] bg-white px-4 py-3 text-sm outline-none focus:border-[#3B6FE8]"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-[#1A1D27]">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={profileFormData.lastName}
                      onChange={handleProfileChange}
                      className="w-full rounded-[10px] border border-[#E8EAF0] bg-white px-4 py-3 text-sm outline-none focus:border-[#3B6FE8]"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-[#1A1D27]">
                      Phone
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={profileFormData.phone}
                      onChange={handleProfileChange}
                      className="w-full rounded-[10px] border border-[#E8EAF0] bg-white px-4 py-3 text-sm outline-none focus:border-[#3B6FE8]"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-[#1A1D27]">
                      LinkedIn
                    </label>
                    <input
                      type="text"
                      name="linkedin"
                      value={profileFormData.linkedin}
                      onChange={handleProfileChange}
                      className="w-full rounded-[10px] border border-[#E8EAF0] bg-white px-4 py-3 text-sm outline-none focus:border-[#3B6FE8]"
                    />
                  </div>

                  <div className="md:col-span-2 flex flex-col gap-3 pt-2 sm:flex-row">
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center rounded-[10px] bg-[#3B6FE8] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2D5CD4]"
                    >
                      Update Profile
                    </button>

                    <button
                      type="button"
                      onClick={handleProfileDelete}
                      className="inline-flex items-center justify-center rounded-[10px] bg-[#DC2626] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#B91C1C]"
                    >
                      Delete Account
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
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

      {isOpportunityViewOpen && selectedOpportunity ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-2xl rounded-2xl border border-[#E8EAF0] bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-2xl font-bold text-[#1A1D27]">Internship Details</h3>
              <button
                onClick={() => {
                  setIsOpportunityViewOpen(false)
                  setSelectedOpportunity(null)
                }}
                className="rounded-lg border border-[#E8EAF0] p-2 text-[#6B7280] hover:bg-[#F7F8FA]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-lg bg-[#F7F8FA] p-4 md:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">Title</p>
                <p className="mt-1 text-base font-bold text-[#1A1D27]">{selectedOpportunity.title}</p>
              </div>
              <div className="rounded-lg bg-[#F7F8FA] p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">Specialization</p>
                <p className="mt-1 text-sm font-semibold text-[#1A1D27]">{selectedOpportunity.specialization || '-'}</p>
              </div>
              <div className="rounded-lg bg-[#F7F8FA] p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">Type</p>
                <p className="mt-1 text-sm font-semibold text-[#1A1D27]">{selectedOpportunity.type || '-'}</p>
              </div>
              <div className="rounded-lg bg-[#F7F8FA] p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">Duration</p>
                <p className="mt-1 text-sm font-semibold text-[#1A1D27]">{selectedOpportunity.duration || '-'}</p>
              </div>
              <div className="rounded-lg bg-[#F7F8FA] p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">Location</p>
                <p className="mt-1 text-sm font-semibold text-[#1A1D27]">{selectedOpportunity.location || '-'}</p>
              </div>
              <div className="rounded-lg bg-[#F7F8FA] p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">Stipend</p>
                <p className="mt-1 text-sm font-semibold text-[#1A1D27]">{selectedOpportunity.stipend || '-'}</p>
              </div>
              <div className="rounded-lg bg-[#F7F8FA] p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">Deadline</p>
                <p className="mt-1 text-sm font-semibold text-[#1A1D27]">
                  {selectedOpportunity.deadline ? new Date(selectedOpportunity.deadline).toLocaleDateString() : '-'}
                </p>
              </div>
              <div className="rounded-lg bg-[#F7F8FA] p-4 md:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">Description</p>
                <p className="mt-1 text-sm text-[#1A1D27] whitespace-pre-wrap">{selectedOpportunity.description || '-'}</p>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => handleApply(selectedOpportunity._id)}
                className="rounded-[10px] bg-[#3B6FE8] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2D5CD4]"
              >
                Apply Now
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default Dashboard
