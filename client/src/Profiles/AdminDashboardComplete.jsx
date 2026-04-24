import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import { confirm as swalConfirm, toast as swalToast } from '../utils/swal'

function AdminDashboardComplete() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  const [activeTab, setActiveTab] = useState('students')
  const [students, setStudents] = useState([])
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [stats, setStats] = useState({})

  useEffect(() => {
    // Check if user is admin
    const userData = JSON.parse(localStorage.getItem('student') || '{}')
    if (userData.email !== 'admin@internconnect.com') {
      setError('Access denied. Admin privileges required.')
      setTimeout(() => {
        navigate('/login')
      }, 2000)
      return
    }
    
    if (!token) {
      setError('No authentication token found. Please login.')
      setTimeout(() => {
        navigate('/login')
      }, 2000)
      return
    }
    
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Fetch all data in parallel
      const [studentsRes, companiesRes, statsRes] = await Promise.all([
        api.get('/admin/students'),
        api.get('/admin/companies'),
        api.get('/admin/stats')
      ])
      
      setStudents(studentsRes.data.data || [])
      setCompanies(companiesRes.data.data || [])
      setStats(statsRes.data.data || {})
      
    } catch (err) {
      console.error('Dashboard fetch error:', err)
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch dashboard data'
      setError(errorMessage)
      
      if (err.response?.status === 401 || err.response?.status === 403) {
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSuspendStudent = async (studentId) => {
    const ok = await swalConfirm('Are you sure you want to suspend this student account?')
    if (!ok) return

    try {
      await api.put(`/admin/students/${studentId}/suspend`, {})
      setSuccess('Student account suspended successfully')
      try { swalToast('Student account suspended successfully') } catch (e) {}
      fetchDashboardData()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to suspend student')
    }
  }

  const handleUnsuspendStudent = async (studentId) => {
    try {
      await api.put(`/admin/students/${studentId}/unsuspend`, {})
      setSuccess('Student account unsuspended successfully')
      try { swalToast('Student account unsuspended successfully') } catch (e) {}
      fetchDashboardData()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to unsuspend student')
    }
  }

  const handleDeleteStudent = async (studentId) => {
    const ok = await swalConfirm('Are you sure you want to delete this student account? This action cannot be undone.')
    if (!ok) return

    try {
      await api.delete(`/admin/students/${studentId}`)
      setSuccess('Student account deleted successfully')
      try { swalToast('Student account deleted successfully') } catch (e) {}
      fetchDashboardData()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete student')
    }
  }

  const handleDeleteCompany = async (companyId) => {
    const ok = await swalConfirm('Are you sure you want to delete this company account? This action cannot be undone.')
    if (!ok) return

    try {
      await api.delete(`/admin/companies/${companyId}`)
      setSuccess('Company account deleted successfully')
      try { swalToast('Company account deleted successfully') } catch (e) {}
      fetchDashboardData()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete company')
    }
  }

  const clearMessages = () => {
    setError('')
    setSuccess('')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-500">Manage students and companies</p>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-lg p-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Students</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalStudents || 0}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-lg p-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Students</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.activeStudents || 0}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-500 rounded-lg p-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 0018.364 5.636m-9 9v1m0-1a9 9 0 00-9 9m0 0v1m0-1a9 9 0 009 9" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Suspended Students</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.suspendedStudents || 0}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-500 rounded-lg p-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Companies</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalCompanies || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex justify-between items-center">
              <span>{error}</span>
              <button onClick={clearMessages} className="text-red-500 hover:text-red-700">&times;</button>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
            <div className="flex justify-between items-center">
              <span>{success}</span>
              <button onClick={clearMessages} className="text-green-500 hover:text-green-700">&times;</button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('students')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'students'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Students ({students.length})
              </button>
              <button
                onClick={() => setActiveTab('companies')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'companies'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Companies ({companies.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow">
          {activeTab === 'students' && (
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Student Management</h2>
              {students.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {students.map((student) => (
                        <tr key={student._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{student.firstName} {student.lastName}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{student.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{student.studentId}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              student.suspended
                                ? 'bg-red-100 text-red-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {student.suspended ? 'Suspended' : 'Active'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              {student.suspended ? (
                                <button
                                  onClick={() => handleUnsuspendStudent(student._id)}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  Unsuspend
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleSuspendStudent(student._id)}
                                  className="text-yellow-600 hover:text-yellow-900"
                                >
                                  Suspend
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteStudent(student._id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No students found</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'companies' && (
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Company Management</h2>
              {companies.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Industry</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {companies.map((company) => (
                        <tr key={company._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{company.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{company.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{company.industry}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{company.location}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleDeleteCompany(company._id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No companies found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboardComplete
