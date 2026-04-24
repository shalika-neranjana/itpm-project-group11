import React, { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import { toast as swalToast, error as swalError } from '../utils/swal'

const EnhancedStudentProfile = () => {
  const [user, setUser] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [skillEditMode, setSkillEditMode] = useState(false)
  const [applications, setApplications] = useState([])
  const [notifications, setNotifications] = useState([])
  const [notificationsLoading, setNotificationsLoading] = useState(false)
  const [notificationsError, setNotificationsError] = useState('')
  const allowedSpecializations = [
    'Computer Science',
    'Software Engineering',
    'Data Science',
    'Multimedia',
    'Cybersecurity',
  ]
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    studentId: '',
    email: '',
    phone: '',
    linkedin: '',
    github: '',
    university: '',
    faculty: '',
    specialization: '',
    gpa: '',
    bio: '',
    skills: []
  })
  const [newSkill, setNewSkill] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const skillsSectionRef = useRef(null)
  const skillInputRef = useRef(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    
    if (!token || localStorage.getItem('role') !== 'student') {
      navigate('/login')
      return
    }

    fetchStudentProfile()
    fetchApplications()
    fetchNotifications()
  }, [navigate])

  const fetchStudentProfile = async () => {
    try {
      const response = await api.get('/students/profile')
      const student = response.data.data

      localStorage.setItem('student', JSON.stringify(student))
      setUser(student)
      setFormData({
        firstName: student.firstName || '',
        lastName: student.lastName || '',
        studentId: student.studentId || '',
        email: student.email || '',
        phone: student.phone || '',
        linkedin: student.linkedin || '',
        github: student.github || '',
        university: student.university || '',
        faculty: student.faculty || '',
        specialization: allowedSpecializations.includes(student.specialization)
          ? student.specialization
          : '',
        gpa: student.gpa ?? '',
        bio: student.bio || '',
        skills: student.skills || []
      })
    } catch (error) {
      console.error('Failed to fetch student profile:', error)
      setError(error.response?.data?.message || 'Failed to load profile')
    }
  }

  const fetchApplications = async () => {
    try {
      const response = await api.get('/internships/applications/my')
      setApplications(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch applications:', error)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleAddSkill = () => {
    const skill = newSkill.trim()
    if (skill && !formData.skills.includes(skill)) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skill]
      })
      setNewSkill('')
      setSkillEditMode(false)
    }
  }

  const handleRemoveSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToRemove)
    })
  }

  const handleEditSkills = () => {
    setEditMode(true)
    setSkillEditMode(true)
    setTimeout(() => {
      skillsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      skillInputRef.current?.focus()
    }, 0)
  }

  const fetchNotifications = async () => {
    try {
      setNotificationsLoading(true)
      const response = await api.get('/notifications/my')
      setNotifications(response.data.data)
      setNotificationsError('')
    } catch (err) {
      setNotificationsError(err.response?.data?.message || 'Failed to load notifications')
    } finally {
      setNotificationsLoading(false)
    }
  }

  const markNotificationAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`)
      setNotifications(notifications.map(notif => 
        notif._id === id ? { ...notif, read: true } : notif
      ))
    } catch (err) {
      console.error('Failed to mark notification as read', err)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const payload = { ...formData }
      // DB enum restriction: never send invalid specialization values.
      if (!payload.specialization || !allowedSpecializations.includes(payload.specialization)) {
        delete payload.specialization
      }

      const response = await api.put('/students/profile', payload)
      
      if (response.data.success) {
        localStorage.setItem('student', JSON.stringify(response.data.data))
        setUser(response.data.data)
        setEditMode(false)
        setSuccess('Profile updated successfully!')
        try { swalToast('Profile updated successfully!') } catch (e) {}
        fetchStudentProfile()
        fetchApplications() // Refresh applications
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('student')
    localStorage.removeItem('role')
    navigate('/login')
  }

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'U'
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-bold text-sm flex items-center justify-center">
                  IC
                </div>
              </div>
              <div className="ml-4">
                <h1 className="text-xl font-bold text-gray-900">InternConnect</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5M15 12H3" />
                </svg>
              </button>
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-white font-bold text-sm flex items-center justify-center">
                  {getInitials(user.firstName + ' ' + user.lastName)}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-500 hover:text-red-600 px-3 py-2 rounded-lg text-sm font-medium"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center">
            <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 6L9 17l-5-5" />
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="text-green-800 font-medium">{success}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center">
            <svg className="w-5 h-5 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
              <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" />
              <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" />
            </svg>
            <span className="text-red-800 font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-white font-bold text-2xl flex items-center justify-center mx-auto mb-4">
                {getInitials(user.firstName + ' ' + user.lastName)}
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-gray-600 mb-4">
                {user.specialization} · {user.university}
              </p>
              <p className="text-gray-500 text-sm mb-6">
                Student ID: {user.studentId}
              </p>
              
              <button
                onClick={() => setEditMode(!editMode)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                <div className="flex items-center justify-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  {editMode ? 'Cancel Edit' : 'Edit Profile'}
                </div>
              </button>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4 text-sm">Contact</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium text-gray-900">{user.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm font-medium text-gray-900">{user.phone || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">LinkedIn</p>
                  <p className="text-sm font-medium text-gray-900">{user.linkedin || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">GitHub</p>
                  <p className="text-sm font-medium text-gray-900">{user.github || '—'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className="lg:col-span-2 space-y-6">
            {editMode ? (
              /* Edit Form */
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-6 text-lg">Edit Profile</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Student ID</label>
                    <input
                      type="text"
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">GPA</label>
                    <input
                      type="number"
                      name="gpa"
                      value={formData.gpa}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      max="4"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">University</label>
                    <input
                      type="text"
                      name="university"
                      value={formData.university}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Faculty</label>
                    <input
                      type="text"
                      name="faculty"
                      value={formData.faculty}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                    <select
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select specialization</option>
                      {allowedSpecializations.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn URL</label>
                    <input
                      type="url"
                      name="linkedin"
                      value={formData.linkedin}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">GitHub URL</label>
                    <input
                      type="url"
                      name="github"
                      value={formData.github}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio / About Me</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tell companies about yourself..."
                  />
                </div>

                {/* Skills */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">Skills</h4>
                  </div>

                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddSkill()
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g. React, Node.js, Python"
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>

                  {formData.skills?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {formData.skills.map((skill, index) => (
                        <span
                          key={`${skill}-${index}`}
                          className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="ml-2 text-blue-700 hover:text-red-600"
                            aria-label={`Remove ${skill}`}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No skills added yet.</p>
                  )}
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 6L9 17l-5-5" />
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Save Changes
                      </div>
                    )}
                  </button>
                  <button
                    onClick={() => setEditMode(false)}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* View Mode */
              <>
                {/* REAL Notifications from Database */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h3 className="font-bold text-gray-900 text-lg mb-4">Notifications</h3>
                  {notificationsLoading ? (
                    <div className="text-sm text-gray-500">Loading notifications...</div>
                  ) : notificationsError ? (
                    <div className="text-sm text-red-600">{notificationsError}</div>
                  ) : notifications.length === 0 ? (
                    <p className="text-sm text-gray-500">No notifications yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {notifications.map((notif) => (
                        <div 
                          key={notif._id} 
                          className={`rounded-lg border p-3 ${
                            notif.read ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'
                          }`}
                        >
                          <p className="text-sm text-gray-900">{notif.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(notif.createdAt).toLocaleDateString()}
                          </p>
                          {!notif.read && (
                            <button
                              onClick={() => markNotificationAsRead(notif._id)}
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

                {/* Skills */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-900 text-lg">Skills</h3>
                    <button
                      onClick={() => {
                        if (!skillEditMode) {
                          handleEditSkills()
                          return
                        }
                        setSkillEditMode(false)
                      }}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      {skillEditMode ? 'Cancel' : 'Edit Skills'}
                    </button>
                  </div>

                  {skillEditMode && (
                    <div className="flex gap-2 mb-4">
                      <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAddSkill()
                          }
                        }}
                        ref={skillInputRef}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g. React, Node.js, Python"
                      />
                      <button
                        type="button"
                        onClick={handleAddSkill}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
                      >
                        Add
                      </button>
                    </div>
                  )}

                  {formData.skills?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {formData.skills.map((skill, index) => (
                        <span
                          key={`${skill}-${index}`}
                          className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                        >
                          {skill}
                          {skillEditMode && (
                            <button
                              type="button"
                              onClick={() => handleRemoveSkill(skill)}
                              className="ml-2 text-blue-700 hover:text-red-600"
                              aria-label={`Remove ${skill}`}
                            >
                              ×
                            </button>
                          )}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No skills added yet.</p>
                  )}
                </div>

                {/* Applications */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h3 className="font-bold text-gray-900 text-lg mb-4">My Applications</h3>
                  {applications.length > 0 ? (
                    <div className="space-y-4">
                      {applications.filter(Boolean).map((app, idx) => (
                        <div key={app?._id || idx} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-semibold text-gray-900">{app.title}</h4>
                              <p className="text-sm text-gray-600">{app.company?.name}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              app.application?.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                              app.application?.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {app.application?.status || 'Pending'}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">
                            <div className="flex justify-between mb-1">
                              <span>📍 {app.location}</span>
                              <span>⏱ {app.duration}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>💰 {app.stipend}</span>
                              <span>
                                📅 Applied:{' '}
                                {app.application?.appliedDate
                                  ? new Date(app.application.appliedDate).toLocaleDateString()
                                  : '—'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-center py-8">
                      <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
                      </svg>
                      <p className="font-medium">No applications yet</p>
                      <p className="text-sm">Browse internships to apply!</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnhancedStudentProfile
