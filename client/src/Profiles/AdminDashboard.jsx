import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import { confirm as swalConfirm, toast as swalToast } from '../utils/swal'

function AdminDashboard() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showProfileModal, setShowProfileModal] = useState(false)

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
    
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await api.get('/admin/students')
      console.log('Admin response:', response.data)
      setStudents(response.data.data || [])
    } catch (err) {
      console.error('Admin fetch error:', err)
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch students'
      setError(errorMessage)
      
      // If it's an authentication error, redirect to login
      if (err.response?.status === 401 || err.response?.status === 403) {
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleViewProfile = (student) => {
    setSelectedStudent(student)
    setShowProfileModal(true)
  }

  const handleSuspend = async (studentId) => {
    const ok = await swalConfirm('Are you sure you want to suspend this student account?')
    if (!ok) return

    try {
      await api.put(`/admin/students/${studentId}/suspend`, {})
      
      setSuccess('Student account suspended successfully')
      try { swalToast('Student account suspended successfully') } catch (e) {}
      fetchStudents()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to suspend student')
    }
  }

  const handleUnsuspend = async (studentId) => {
    try {
      await api.put(`/admin/students/${studentId}/unsuspend`, {})
      
      setSuccess('Student account unsuspended successfully')
      try { swalToast('Student account unsuspended successfully') } catch (e) {}
      fetchStudents()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to unsuspend student')
    }
  }

  const handleDelete = async (studentId) => {
    const ok = await swalConfirm('Are you sure you want to delete this student account? This action cannot be undone.')
    if (!ok) return

    try {
      await api.delete(`/admin/students/${studentId}`)
      
      setSuccess('Student account deleted successfully')
      try { swalToast('Student account deleted successfully') } catch (e) {}
      fetchStudents()
      setShowProfileModal(false)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete student')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('student')
    navigate('/')
  }

  const initials = (firstName, lastName) => 
    `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'ST'

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <header className="sticky top-0 z-50 border-b border-[#E8EAF0] bg-white/95 backdrop-blur-sm">
        <div className="flex h-[64px] w-full items-center justify-between px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-[36px] w-[36px] items-center justify-center rounded-[10px] bg-gradient-to-br from-[#DC2626] to-[#EF4444] shadow-sm">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <span className="font-display text-[19px] font-bold text-[#1A1D27]">
              Admin Dashboard
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-[10px] bg-[#DC2626] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#B91C1C]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-8 py-7">
        <div className="mb-6">
          <h1 className="font-display text-[28px] font-bold text-[#1A1D27]">
            Student Management
          </h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            View and manage all student accounts
          </p>
        </div>

        {success && (
          <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <div className="rounded-2xl border border-[#E8EAF0] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
          <div className="p-6">
            <div className="mb-4 flex justify-between items-center">
              <h2 className="font-display text-xl font-bold text-[#1A1D27]">
                All Students ({students.length})
              </h2>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3B6FE8]"></div>
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[#6B7280]">No students found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#E8EAF0]">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-[#1A1D27]">Student</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-[#1A1D27]">Student ID</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-[#1A1D27]">Email</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-[#1A1D27]">Phone</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-[#1A1D27]">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-[#1A1D27]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student._id} className="border-b border-[#E8EAF0] hover:bg-[#F7F8FA]">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#3B6FE8] to-[#6B9FFF] text-sm font-bold text-white">
                              {initials(student.firstName, student.lastName)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-[#1A1D27]">
                                {student.firstName} {student.lastName}
                              </p>
                              {student.linkedin && (
                                <a 
                                  href={student.linkedin} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs text-[#3B6FE8] hover:underline"
                                >
                                  LinkedIn
                                </a>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-[#1A1D27]">{student.studentId}</td>
                        <td className="py-3 px-4 text-sm text-[#1A1D27]">{student.email}</td>
                        <td className="py-3 px-4 text-sm text-[#1A1D27]">{student.phone || '-'}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            student.suspended 
                              ? 'bg-red-100 text-red-700' 
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {student.suspended ? 'Suspended' : 'Active'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewProfile(student)}
                              className="text-[#3B6FE8] hover:text-[#2D5CD4] text-sm font-medium"
                            >
                              View
                            </button>
                            {student.suspended ? (
                              <button
                                onClick={() => handleUnsuspend(student._id)}
                                className="text-green-600 hover:text-green-700 text-sm font-medium"
                              >
                                Unsuspend
                              </button>
                            ) : (
                              <button
                                onClick={() => handleSuspend(student._id)}
                                className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                              >
                                Suspend
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(student._id)}
                              className="text-red-600 hover:text-red-700 text-sm font-medium"
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
            )}
          </div>
        </div>
      </main>

      {showProfileModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[#E8EAF0] bg-white p-6 m-4">
            <div className="mb-6 flex justify-between items-center">
              <h2 className="font-display text-2xl font-bold text-[#1A1D27]">
                Student Profile
              </h2>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-[#6B7280] hover:text-[#1A1D27]"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#3B6FE8] to-[#6B9FFF] text-2xl font-bold text-white">
                {initials(selectedStudent.firstName, selectedStudent.lastName)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#1A1D27]">
                  {selectedStudent.firstName} {selectedStudent.lastName}
                </h3>
                <p className="text-sm text-[#6B7280]">{selectedStudent.email}</p>
                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium mt-1 ${
                  selectedStudent.suspended 
                    ? 'bg-red-100 text-red-700' 
                    : 'bg-green-100 text-green-700'
                }`}>
                  {selectedStudent.suspended ? 'Suspended' : 'Active'}
                </span>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-[#6B7280]">
                  Student ID
                </label>
                <p className="text-sm text-[#1A1D27]">{selectedStudent.studentId}</p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-[#6B7280]">
                  Email
                </label>
                <p className="text-sm text-[#1A1D27]">{selectedStudent.email}</p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-[#6B7280]">
                  Phone
                </label>
                <p className="text-sm text-[#1A1D27]">{selectedStudent.phone || '-'}</p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-[#6B7280]">
                  LinkedIn
                </label>
                {selectedStudent.linkedin ? (
                  <a 
                    href={selectedStudent.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-[#3B6FE8] hover:underline break-all"
                  >
                    {selectedStudent.linkedin}
                  </a>
                ) : (
                  <p className="text-sm text-[#1A1D27]">-</p>
                )}
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              {selectedStudent.suspended ? (
                <button
                  onClick={() => {
                    handleUnsuspend(selectedStudent._id)
                    setShowProfileModal(false)
                  }}
                  className="inline-flex items-center justify-center rounded-[10px] bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
                >
                  Unsuspend Account
                </button>
              ) : (
                <button
                  onClick={() => {
                    handleSuspend(selectedStudent._id)
                    setShowProfileModal(false)
                  }}
                  className="inline-flex items-center justify-center rounded-[10px] bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-700"
                >
                  Suspend Account
                </button>
              )}
              <button
                onClick={() => {
                  handleDelete(selectedStudent._id)
                }}
                className="inline-flex items-center justify-center rounded-[10px] bg-[#DC2626] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#B91C1C]"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
