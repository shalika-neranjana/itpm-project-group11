import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import api from '../api/axios'

function Profile() {
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
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed')
    }
  }

  const handleDelete = async () => {
    const confirmDelete = window.confirm('Are you sure you want to delete your account?')
    if (!confirmDelete) return

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
      setError(err.response?.data?.message || 'Delete failed')
    }
  }

  const initials =
    `${formData.firstName?.[0] || ''}${formData.lastName?.[0] || ''}`.toUpperCase() || 'ST'

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <Header active="profile" />

      <main className="mx-auto max-w-[1200px] px-8 py-7">
        <div className="mb-6">
          <h1 className="font-display text-[28px] font-bold text-[#1A1D27]">
            My Profile
          </h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            View and manage your student profile
          </p>
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
            <h2 className="mb-5 font-display text-2xl font-bold text-[#1A1D27]">
              Edit Profile
            </h2>

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
                  Update Profile
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  className="inline-flex items-center justify-center rounded-[10px] bg-[#DC2626] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#B91C1C]"
                >
                  Delete Account
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Profile