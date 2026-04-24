import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import api from '../api/axios'
import { toast as swalToast, error as swalError } from '../utils/swal'

function StudentProfile() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  const [formData, setFormData] = useState({
    studentId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    linkedin: '',
  })

  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    const student = JSON.parse(localStorage.getItem('student'))

    if (!student) return

    setFormData({
      studentId: student.studentId || '',
      firstName: student.firstName || '',
      lastName: student.lastName || '',
      email: student.email || '',
      phone: student.phone || '',
      linkedin: student.linkedin || '',
    })
  }, [])

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get('/notifications/my', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setNotifications(response.data.data)
      } catch (err) {
        console.error('Failed to fetch notifications', err)
      }
    }

    if (token) {
      fetchNotifications()
    }
  }, [token])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setMessage('')
    setError('')
  }

  const handleUpdate = async (e) => {
    e.preventDefault()

    try {
      const response = await api.put('/students/profile', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const updatedStudent = response.data.data
      localStorage.setItem('student', JSON.stringify(updatedStudent))
      setMessage('Profile updated successfully')
      try { swalToast('Profile updated successfully') } catch (e) {}
      setIsEditing(false)
    } catch (err) {
      const msg = err.response?.data?.message || 'Update failed'
      setError(msg)
      try { swalError(msg) } catch (e) {}
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('student')
    navigate('/')
  }

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setNotifications(notifications.map(notif => 
        notif._id === id ? { ...notif, read: true } : notif
      ))
    } catch (err) {
      console.error('Failed to mark as read', err)
    }
  }

  const initials =
    `${formData.firstName?.[0] || ''}${formData.lastName?.[0] || ''}`.toUpperCase() || 'ST'

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <Header active="profile" />

      <main className="mx-auto max-w-[1200px] px-8 py-7">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="font-display text-[28px] font-bold text-[#1A1D27]">
              My Profile
            </h1>
            <p className="mt-1 text-sm text-[#6B7280]">
              View and manage your student profile
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-[10px] bg-[#DC2626] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#B91C1C]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>

        {message && (
          <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {/* Notifications Section */}
        <div className="mb-5 rounded-2xl border border-[#E8EAF0] bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
          <h3 className="mb-4 text-lg font-semibold text-[#1F2937]">Notifications</h3>
          {notifications.length === 0 ? (
            <p className="text-sm text-[#6B7280]">No notifications yet.</p>
          ) : (
            <div className="space-y-3">
              {notifications.map((notif) => (
                <div key={notif._id} className={`rounded-lg border p-3 ${notif.read ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'}`}>
                  <p className="text-sm text-[#1F2937]">{notif.message}</p>
                  <p className="mt-1 text-xs text-[#6B7280]">{new Date(notif.createdAt).toLocaleDateString()}</p>
                  {!notif.read && (
                    <button
                      onClick={() => markAsRead(notif._id)}
                      className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
          <div className="rounded-2xl border border-[#E8EAF0] bg-white p-6 text-center shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#3B6FE8] to-[#6B9FFF] text-[28px] font-bold text-white">
              {initials}
            </div>

            <h2 className="text-lg font-bold text-[#1A1D27]">
              {formData.firstName} {formData.lastName}
            </h2>

            <p className="mt-1 text-sm text-[#6B7280]">{formData.email}</p>

            <div className="mt-6 rounded-xl bg-[#F7F8FA] p-4 text-left">
              <div className="mb-3">
                <p className="text-xs text-[#6B7280]">Student ID</p>
                <p className="text-sm font-semibold text-[#1A1D27]">{formData.studentId || '-'}</p>
              </div>

              <div className="mb-3">
                <p className="text-xs text-[#6B7280]">Phone</p>
                <p className="text-sm font-semibold text-[#1A1D27]">{formData.phone || '-'}</p>
              </div>

              <div>
                <p className="text-xs text-[#6B7280]">LinkedIn</p>
                <p className="break-all text-sm font-semibold text-[#1A1D27]">
                  {formData.linkedin || '-'}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E8EAF0] bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
            <div className="mb-5 flex justify-between items-center">
              <h2 className="font-display text-2xl font-bold text-[#1A1D27]">
                Profile Information
              </h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-2 rounded-[10px] bg-[#3B6FE8] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2D5CD4]"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Edit Profile
                </button>
              )}
            </div>

            {!isEditing ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-[#6B7280]">
                    Student ID
                  </label>
                  <p className="text-sm text-[#1A1D27]">{formData.studentId || '-'}</p>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-[#6B7280]">
                    Email
                  </label>
                  <p className="text-sm text-[#1A1D27]">{formData.email}</p>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-[#6B7280]">
                    First Name
                  </label>
                  <p className="text-sm text-[#1A1D27]">{formData.firstName}</p>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-[#6B7280]">
                    Last Name
                  </label>
                  <p className="text-sm text-[#1A1D27]">{formData.lastName}</p>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-[#6B7280]">
                    Phone
                  </label>
                  <p className="text-sm text-[#1A1D27]">{formData.phone || '-'}</p>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-[#6B7280]">
                    LinkedIn
                  </label>
                  <p className="text-sm text-[#1A1D27] break-all">{formData.linkedin || '-'}</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUpdate} className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-[#1A1D27]">
                    Student ID
                  </label>
                  <input
                    type="text"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
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
                    value={formData.email}
                    onChange={handleChange}
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
                    value={formData.firstName}
                    onChange={handleChange}
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
                    value={formData.lastName}
                    onChange={handleChange}
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
                    value={formData.phone}
                    onChange={handleChange}
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
                    value={formData.linkedin}
                    onChange={handleChange}
                    className="w-full rounded-[10px] border border-[#E8EAF0] bg-white px-4 py-3 text-sm outline-none focus:border-[#3B6FE8]"
                  />
                </div>

                <div className="md:col-span-2 flex flex-col gap-3 pt-2 sm:flex-row">
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-[10px] bg-[#3B6FE8] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2D5CD4]"
                  >
                    Save Changes
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="inline-flex items-center justify-center rounded-[10px] bg-[#6B7280] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4B5563]"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default StudentProfile
