import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BriefcaseBusiness,
  Building2,
  Globe,
  LayoutGrid,
  LogOut,
  MailOpen,
  MapPin,
  PencilLine,
  Phone,
  Plus,
  Save,
  Users
} from 'lucide-react'
import api from '../api'

const panelClass =
  'rounded-2xl border border-white/60 bg-white/70 shadow-[0_10px_40px_rgba(15,23,42,0.14)] backdrop-blur-[14px]'
const inputClass =
  'w-full rounded-xl border border-gray-300 bg-white/90 px-4 py-3 text-sm text-gray-900 outline-none transition-all duration-300 placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20'

const CompanyDashboard = () => {
  const [user, setUser] = useState(null)
  const [internships, setInternships] = useState([])
  const [applicants, setApplicants] = useState([])
  const [activeTab, setActiveTab] = useState('internships')
  const [showPostForm, setShowPostForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [profileEditMode, setProfileEditMode] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')
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

  const [companyForm, setCompanyForm] = useState({
    name: '',
    industry: '',
    location: '',
    website: '',
    phone: '',
    description: ''
  })

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}')
    const token = localStorage.getItem('token')

    if (!token || localStorage.getItem('role') !== 'company') {
      navigate('/login')
      return
    }

    setUser(userData)
    setCompanyForm({
      name: userData.name || '',
      industry: userData.industry || '',
      location: userData.location || '',
      website: userData.website || '',
      phone: userData.phone || '',
      description: userData.description || ''
    })
    fetchCompanyInternships()
  }, [navigate])

  const fetchCompanyInternships = async () => {
    try {
      const response = await api.get('/internships/company/my')
      const internshipData = response.data.data || []
      setInternships(internshipData)

      const allApplications = []
      internshipData.forEach((internship) => {
        ;(internship.applications || []).forEach((app) => {
          allApplications.push({
            ...app,
            internshipId: internship._id,
            internshipTitle: internship.title,
            internshipType: internship.type,
            internshipLocation: internship.location
          })
        })
      })
      setApplicants(allApplications)
    } catch (error) {
      console.error('Failed to fetch internships:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateApplicationStatus = async (applicant, status) => {
    try {
      await api.put(`/internships/${applicant.internshipId}/applications/${applicant._id}`, { status })
      fetchCompanyInternships()
      alert(`Application ${status.toLowerCase()} and student will see it in their profile.`)
    } catch (error) {
      console.error(`Failed to ${status.toLowerCase()} application:`, error)
      alert(error.response?.data?.message || `Failed to ${status.toLowerCase()} application`)
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

  const handleCompanyChange = (e) => {
    const { name, value } = e.target
    setCompanyForm((prev) => ({ ...prev, [name]: value }))
    setProfileError('')
    setProfileSuccess('')
  }

  const handleSaveCompanyProfile = async () => {
    setProfileLoading(true)
    setProfileError('')
    setProfileSuccess('')
    try {
      const response = await api.put('/company/profile', companyForm)
      if (response.data.success) {
        localStorage.setItem('user', JSON.stringify(response.data.data))
        setUser(response.data.data)
        setCompanyForm({
          name: response.data.data.name || '',
          industry: response.data.data.industry || '',
          location: response.data.data.location || '',
          website: response.data.data.website || '',
          phone: response.data.data.phone || '',
          description: response.data.data.description || ''
        })
        setProfileEditMode(false)
        setProfileSuccess('Company profile updated successfully')
        setTimeout(() => setProfileSuccess(''), 2500)
      }
    } catch (error) {
      setProfileError(error.response?.data?.message || 'Failed to update company profile')
    } finally {
      setProfileLoading(false)
    }
  }

  const totalApplications = applicants.length
  const acceptedApplications = applicants.filter((applicant) => applicant.status === 'Accepted').length
  const profileCompletion = useMemo(() => {
    const fields = [user?.name, user?.industry, user?.location, user?.website, user?.phone, user?.description]
    const completedFields = fields.filter((value) => String(value || '').trim()).length
    return Math.round((completedFields / fields.length) * 100)
  }, [user])

  const tabs = [
    { id: 'internships', label: 'My Internships', icon: BriefcaseBusiness },
    { id: 'applicants', label: 'Applicants', icon: Users },
    { id: 'profile', label: 'Company Profile', icon: Building2 }
  ]

  const statCards = [
    { label: 'Published Roles', value: internships.length, note: 'Active internship posts', icon: BriefcaseBusiness },
    { label: 'Applications', value: totalApplications, note: 'Candidates in your pipeline', icon: MailOpen },
    { label: 'Accepted', value: acceptedApplications, note: 'Students moved forward', icon: Users },
    { label: 'Profile Ready', value: `${profileCompletion}%`, note: 'Company profile completeness', icon: Building2 }
  ]

  if (loading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#e8edf6] text-gray-900">
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/authbackgound.jpg')" }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/40 via-white/25 to-[#d8e6f8]/35" />
        <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-white/70 bg-white/70 shadow-lg backdrop-blur-md">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#e8edf6] text-gray-900">
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/authbackgound.jpg')" }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/45 via-white/25 to-[#d8e6f8]/35" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-20 h-64 w-64 rounded-full bg-blue-100/60 blur-3xl" />
        <div className="absolute -right-24 top-32 h-72 w-72 rounded-full bg-indigo-100/60 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-sky-100/50 blur-3xl" />
      </div>

      <header className="relative z-20 border-b border-gray-200/80 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            {user?.logo ? (
              <img
                src={user.logo}
                alt={`${user?.name || 'Company'} logo`}
                className="h-11 w-11 rounded-xl border border-gray-200 bg-white object-cover shadow-sm"
              />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-blue-600 shadow-sm">
                <Building2 className="h-5 w-5" />
              </div>
            )}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">InternConnect</p>
              <h1 className="text-xl font-bold tracking-tight text-gray-900">Company Dashboard</h1>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white/90 px-4 py-2 text-sm font-semibold text-gray-700 transition-all duration-300 hover:border-blue-300 hover:text-blue-700 hover:shadow-sm"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <section className={`${panelClass} overflow-hidden p-6 md:p-8`}>
          <div className="grid gap-8 lg:grid-cols-[1.4fr_0.9fr]">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">
                <LayoutGrid className="h-4 w-4" />
                Workspace Overview
              </div>
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">{user?.name || 'Your company'}</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">
                  Manage open internship roles, review applicants, and keep your company profile polished using the
                  same visual system as the sign-in and sign-up flow.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/75 px-4 py-2">
                  <BriefcaseBusiness className="h-4 w-4 text-blue-600" />
                  {user?.industry || 'Industry not added'}
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/75 px-4 py-2">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  {user?.location || 'Location not added'}
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/75 px-4 py-2">
                  <Globe className="h-4 w-4 text-blue-600" />
                  {user?.website || 'Website not added'}
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setShowPostForm(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-indigo-600 hover:shadow-md"
                >
                  <Plus className="h-4 w-4" />
                  Post New Internship
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white/90 px-5 py-3 text-sm font-semibold text-gray-700 transition-all duration-300 hover:border-blue-300 hover:text-blue-700 hover:shadow-sm"
                >
                  <PencilLine className="h-4 w-4" />
                  Update Company Profile
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {statCards.map(({ label, value, note, icon: Icon }) => (
                <div key={label} className="rounded-2xl border border-white/70 bg-white/75 p-5 shadow-sm">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-3xl font-bold tracking-tight text-gray-900">{value}</p>
                  <p className="mt-1 text-sm font-semibold text-gray-700">{label}</p>
                  <p className="mt-1 text-xs text-gray-500">{note}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex flex-wrap gap-3">
          {tabs.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition-all duration-300 ${
                  isActive
                    ? 'border-blue-200 bg-white text-blue-700 shadow-sm'
                    : 'border-white/70 bg-white/55 text-gray-600 hover:bg-white/75 hover:text-gray-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            )
          })}
        </section>

        {activeTab === 'internships' && (
          <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {internships.length > 0 ? (
              internships.map((internship) => (
                <article key={internship._id} className={`${panelClass} p-6`}>
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <p className="mb-2 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        {internship.specialization}
                      </p>
                      <h3 className="text-xl font-bold tracking-tight text-gray-900">{internship.title}</h3>
                    </div>
                    <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-600">
                      {internship.type}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                    <div className="rounded-xl bg-blue-50/70 p-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Slots</p>
                      <p className="mt-1 font-semibold text-gray-900">{internship.slots}</p>
                    </div>
                    <div className="rounded-xl bg-blue-50/70 p-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Applications</p>
                      <p className="mt-1 font-semibold text-gray-900">{internship.applications?.length || 0}</p>
                    </div>
                    <div className="rounded-xl bg-blue-50/70 p-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Location</p>
                      <p className="mt-1 font-semibold text-gray-900">{internship.location || 'Not set'}</p>
                    </div>
                    <div className="rounded-xl bg-blue-50/70 p-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Duration</p>
                      <p className="mt-1 font-semibold text-gray-900">{internship.duration || 'Not set'}</p>
                    </div>
                  </div>

                  <div className="mt-5 flex gap-3">
                    <button className="flex-1 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100">
                      View Details
                    </button>
                    <button className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50">
                      Edit
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <div className={`${panelClass} col-span-full p-10 text-center`}>
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <BriefcaseBusiness className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">No internships posted yet</h3>
                <p className="mt-2 text-sm text-gray-600">Create your first internship to start attracting applicants.</p>
              </div>
            )}
          </section>
        )}

        {activeTab === 'applicants' && (
          <section className="space-y-4">
            {applicants.length > 0 ? (
              applicants.map((applicant, index) => (
                <article key={`${applicant._id}-${index}`} className={`${panelClass} p-6`}>
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-4">
                      <div>
                        <div className="mb-2 flex flex-wrap items-center gap-3">
                          <h3 className="text-xl font-bold tracking-tight text-gray-900">{applicant.name}</h3>
                          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                            {applicant.status || 'Pending'}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>{applicant.email}</p>
                          {applicant.phone ? <p>{applicant.phone}</p> : null}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/70 bg-white/75 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Applied for</p>
                        <p className="mt-2 text-base font-semibold text-gray-900">{applicant.internshipTitle}</p>
                        <p className="mt-1 text-sm text-gray-600">
                          {applicant.internshipLocation} · {applicant.internshipType}
                        </p>
                      </div>

                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Cover Letter</p>
                        <div className="rounded-2xl border border-white/70 bg-white/75 p-4 text-sm leading-6 text-gray-700 whitespace-pre-wrap">
                          {applicant.coverLetter}
                        </div>
                      </div>

                      {applicant.resume ? (
                        <a
                          href={applicant.resume}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700"
                        >
                          View Resume
                        </a>
                      ) : null}
                    </div>

                    <div className="flex min-w-[220px] flex-col gap-3">
                      <button
                        onClick={() => handleUpdateApplicationStatus(applicant, 'Accepted')}
                        disabled={applicant.status === 'Accepted'}
                        className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleUpdateApplicationStatus(applicant, 'Rejected')}
                        disabled={applicant.status === 'Rejected'}
                        className="rounded-xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className={`${panelClass} p-10 text-center`}>
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">No applicants yet</h3>
                <p className="mt-2 text-sm text-gray-600">Once students apply, they will appear here for review.</p>
              </div>
            )}
          </section>
        )}

        {activeTab === 'profile' && (
          <section className={`${panelClass} p-6 md:p-8`}>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-2xl font-bold tracking-tight text-gray-900">Company Information</h3>
                <p className="mt-1 text-sm text-gray-600">Keep your public profile aligned with the opportunities you post.</p>
              </div>
              <button
                onClick={() => {
                  setProfileEditMode((prev) => !prev)
                  setProfileError('')
                  setProfileSuccess('')
                }}
                className="inline-flex items-center gap-2 self-start rounded-xl border border-gray-300 bg-white/90 px-4 py-2 text-sm font-semibold text-gray-700 transition-all duration-300 hover:border-blue-300 hover:text-blue-700"
              >
                <PencilLine className="h-4 w-4" />
                {profileEditMode ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            {profileError ? (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {profileError}
              </div>
            ) : null}

            {profileSuccess ? (
              <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                {profileSuccess}
              </div>
            ) : null}

            {!profileEditMode ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-white/70 bg-white/75 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Company Name</p>
                  <p className="mt-2 text-base font-semibold text-gray-900">{user?.name || '—'}</p>
                </div>
                <div className="rounded-2xl border border-white/70 bg-white/75 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Industry</p>
                  <p className="mt-2 text-base font-semibold text-gray-900">{user?.industry || '—'}</p>
                </div>
                <div className="rounded-2xl border border-white/70 bg-white/75 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Location</p>
                  <p className="mt-2 text-base font-semibold text-gray-900">{user?.location || '—'}</p>
                </div>
                <div className="rounded-2xl border border-white/70 bg-white/75 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Website</p>
                  <p className="mt-2 text-base font-semibold text-gray-900">{user?.website || '—'}</p>
                </div>
                <div className="rounded-2xl border border-white/70 bg-white/75 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Phone</p>
                  <p className="mt-2 text-base font-semibold text-gray-900">{user?.phone || '—'}</p>
                </div>
                <div className="rounded-2xl border border-white/70 bg-white/75 p-5 md:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Description</p>
                  <p className="mt-2 text-base leading-7 text-gray-700 whitespace-pre-wrap">{user?.description || '—'}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Company Name</label>
                    <input type="text" name="name" value={companyForm.name} onChange={handleCompanyChange} className={inputClass} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Industry</label>
                    <input type="text" name="industry" value={companyForm.industry} onChange={handleCompanyChange} className={inputClass} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Location</label>
                    <input type="text" name="location" value={companyForm.location} onChange={handleCompanyChange} className={inputClass} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Website</label>
                    <input type="url" name="website" value={companyForm.website} onChange={handleCompanyChange} className={inputClass} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-semibold text-gray-700">Phone</label>
                    <div className="relative">
                      <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input type="tel" name="phone" value={companyForm.phone} onChange={handleCompanyChange} className={`${inputClass} pl-11`} />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Description</label>
                  <textarea
                    name="description"
                    value={companyForm.description}
                    onChange={handleCompanyChange}
                    rows={5}
                    className={inputClass}
                    placeholder="Tell students about your company..."
                  />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={handleSaveCompanyProfile}
                    disabled={profileLoading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-indigo-600 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <Save className="h-4 w-4" />
                    {profileLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => setProfileEditMode(false)}
                    className="rounded-xl border border-gray-300 bg-white/90 px-5 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </section>
        )}
      </main>

      {showPostForm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 px-4 py-6">
          <div className={`${panelClass} max-h-[90vh] w-full max-w-3xl overflow-y-auto p-6 md:p-8`}>
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">New Opportunity</p>
                <h3 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">Post New Internship</h3>
                <p className="mt-1 text-sm text-gray-600">Use the same clean, polished presentation students see across auth screens.</p>
              </div>
              <button
                onClick={() => setShowPostForm(false)}
                className="rounded-xl border border-gray-300 bg-white/90 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                Close
              </button>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Internship Title</label>
                <input
                  type="text"
                  value={internshipForm.title}
                  onChange={(e) => setInternshipForm({ ...internshipForm, title: e.target.value })}
                  className={inputClass}
                  placeholder="e.g. Software Engineering Intern"
                />
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Specialization</label>
                  <select
                    value={internshipForm.specialization}
                    onChange={(e) => setInternshipForm({ ...internshipForm, specialization: e.target.value })}
                    className={inputClass}
                  >
                    <option>Computer Science</option>
                    <option>Data Science</option>
                    <option>Multimedia</option>
                    <option>Software Engineering</option>
                    <option>Cybersecurity</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Type</label>
                  <select
                    value={internshipForm.type}
                    onChange={(e) => setInternshipForm({ ...internshipForm, type: e.target.value })}
                    className={inputClass}
                  >
                    <option>On-site</option>
                    <option>Remote</option>
                    <option>Hybrid</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Duration</label>
                  <input
                    type="text"
                    value={internshipForm.duration}
                    onChange={(e) => setInternshipForm({ ...internshipForm, duration: e.target.value })}
                    className={inputClass}
                    placeholder="e.g. 3 months"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Location</label>
                  <input
                    type="text"
                    value={internshipForm.location}
                    onChange={(e) => setInternshipForm({ ...internshipForm, location: e.target.value })}
                    className={inputClass}
                    placeholder="e.g. Colombo"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Stipend</label>
                  <input
                    type="text"
                    value={internshipForm.stipend}
                    onChange={(e) => setInternshipForm({ ...internshipForm, stipend: e.target.value })}
                    className={inputClass}
                    placeholder="e.g. LKR 50,000/month"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Deadline</label>
                  <input
                    type="date"
                    value={internshipForm.deadline}
                    onChange={(e) => setInternshipForm({ ...internshipForm, deadline: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Description</label>
                <textarea
                  value={internshipForm.description}
                  onChange={(e) => setInternshipForm({ ...internshipForm, description: e.target.value })}
                  rows={5}
                  className={inputClass}
                  placeholder="Describe the internship role..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Number of Slots</label>
                <input
                  type="number"
                  value={internshipForm.slots}
                  onChange={(e) => setInternshipForm({ ...internshipForm, slots: parseInt(e.target.value, 10) || 1 })}
                  min="1"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handlePostInternship}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-indigo-600 hover:shadow-md"
              >
                <Plus className="h-4 w-4" />
                Post Internship
              </button>
              <button
                onClick={() => setShowPostForm(false)}
                className="flex-1 rounded-xl border border-gray-300 bg-white/90 px-5 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default CompanyDashboard
