import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

const CompanyDashboard = () => {
  const [user, setUser] = useState(null)
  const [internships, setInternships] = useState([])
  const [activeTab, setActiveTab] = useState('internships')
  const [showPostForm, setShowPostForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const [internshipForm, setInternshipForm] = useState({
    title: '',
    specialization: 'Computer Science',
    type: 'On-site',
    duration: '',
    location: '',
    stipend: '',
    deadline: '',
    description: '',
    duties: [],
    requirements: [],
    slots: 1
  })

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}')
    const token = localStorage.getItem('token')
    
    if (!token || localStorage.getItem('role') !== 'company') {
      navigate('/login')
      return
    }

    setUser(userData)
    fetchCompanyInternships()
  }, [navigate])

  const fetchCompanyInternships = async () => {
    try {
      const response = await api.get('/internships/company/my')
      setInternships(response.data.data)
    } catch (error) {
      console.error('Failed to fetch internships:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePostInternship = async () => {
    try {
      const internshipData = {
        ...internshipForm,
        status: 'Published'
      }
      const response = await api.post('/internships', internshipData)
      if (response.data.success) {
        setShowPostForm(false)
        setInternshipForm({
          title: '',
          specialization: 'Computer Science',
          type: 'On-site',
          duration: '',
          location: '',
          stipend: '',
          deadline: '',
          description: '',
          duties: [],
          requirements: [],
          slots: 1
        })
        fetchCompanyInternships()
      }
    } catch (error) {
      console.error('Failed to post internship:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('role')
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-purple-600 rounded-lg text-white font-bold text-sm flex items-center justify-center mr-3">
                IC
              </div>
              <h1 className="text-xl font-bold text-gray-900">Company Dashboard</h1>
            </div>
            <button
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Company Info */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
              <p className="text-gray-600">{user?.industry} · {user?.location}</p>
            </div>
            <button
              onClick={() => setShowPostForm(true)}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700"
            >
              Post New Internship
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('internships')}
              className={`py-4 border-b-2 font-medium text-sm ${
                activeTab === 'internships'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              My Internships
            </button>
            <button
              onClick={() => setActiveTab('applicants')}
              className={`py-4 border-b-2 font-medium text-sm ${
                activeTab === 'applicants'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Applicants
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Company Profile
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'internships' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {internships.map((internship) => (
              <div key={internship._id} className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-2">{internship.title}</h3>
                <div className="text-sm text-gray-600 mb-4">
                  <div className="flex justify-between mb-1">
                    <span>{internship.specialization}</span>
                    <span>{internship.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{internship.slots} slots</span>
                    <span>{internship.applications?.length || 0} applications</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 bg-purple-100 text-purple-700 py-2 rounded-lg font-medium hover:bg-purple-200">
                    View Details
                  </button>
                  <button className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200">
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'applicants' && (
          <div className="text-center py-12">
            <p className="text-gray-500">No applicants yet. Post internships to attract talent!</p>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4">Company Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <p className="text-gray-900">{user?.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                <p className="text-gray-900">{user?.industry}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <p className="text-gray-900">{user?.location}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <p className="text-gray-900">{user?.website || '—'}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Post Internship Modal */}
      {showPostForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Post New Internship</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Internship Title</label>
                <input
                  type="text"
                  value={internshipForm.title}
                  onChange={(e) => setInternshipForm({...internshipForm, title: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="e.g. Software Engineering Intern"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                  <select
                    value={internshipForm.specialization}
                    onChange={(e) => setInternshipForm({...internshipForm, specialization: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option>Computer Science</option>
                    <option>Data Science</option>
                    <option>Multimedia</option>
                    <option>Software Engineering</option>
                    <option>Cybersecurity</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={internshipForm.type}
                    onChange={(e) => setInternshipForm({...internshipForm, type: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option>On-site</option>
                    <option>Remote</option>
                    <option>Hybrid</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                  <input
                    type="text"
                    value={internshipForm.duration}
                    onChange={(e) => setInternshipForm({...internshipForm, duration: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="e.g. 3 months"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={internshipForm.location}
                    onChange={(e) => setInternshipForm({...internshipForm, location: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="e.g. Kuala Lumpur"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stipend</label>
                  <input
                    type="text"
                    value={internshipForm.stipend}
                    onChange={(e) => setInternshipForm({...internshipForm, stipend: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="e.g. RM 1000/month"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                  <input
                    type="date"
                    value={internshipForm.deadline}
                    onChange={(e) => setInternshipForm({...internshipForm, deadline: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={internshipForm.description}
                  onChange={(e) => setInternshipForm({...internshipForm, description: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Describe the internship role..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of Slots</label>
                  <input
                    type="number"
                    value={internshipForm.slots}
                    onChange={(e) => setInternshipForm({...internshipForm, slots: parseInt(e.target.value)})}
                    min="1"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={handlePostInternship}
                className="flex-1 bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700"
              >
                Post Internship
              </button>
              <button
                onClick={() => setShowPostForm(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CompanyDashboard
