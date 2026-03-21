import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

const InternshipMarketplace = () => {
  const [internships, setInternships] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    specialization: '',
    type: '',
    location: ''
  })
  const navigate = useNavigate()

  useEffect(() => {
    fetchInternships()
  }, [filters])

  const fetchInternships = async () => {
    try {
      const response = await api.get('/internships', { params: filters })
      setInternships(response.data.data)
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
    // Navigate to application form
    navigate(`/apply/${internshipId}`)
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
            <h1 className="text-2xl font-bold text-gray-900">Internship Opportunities</h1>
            <button 
              onClick={() => navigate('/profile')}
              className="text-blue-600 hover:text-blue-700"
            >
              My Profile
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-4">
            <input
              type="text"
              placeholder="Search internships..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="flex-1 min-w-[200px] px-4 py-2 border rounded-lg"
            />
            <select
              value={filters.specialization}
              onChange={(e) => handleFilterChange('specialization', e.target.value)}
              className="px-4 py-2 border rounded-lg"
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
              className="px-4 py-2 border rounded-lg"
            >
              <option value="">All Types</option>
              <option>On-site</option>
              <option>Remote</option>
              <option>Hybrid</option>
            </select>
          </div>
        </div>
      </div>

      {/* Internship Cards */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {internships.map((internship) => (
            <div key={internship._id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
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

              <button
                onClick={() => handleApply(internship._id)}
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Apply Now
              </button>
            </div>
          ))}
        </div>

        {internships.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No internships found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default InternshipMarketplace
