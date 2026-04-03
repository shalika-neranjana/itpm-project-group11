import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BriefcaseBusiness,
  Building2,
  LogOut,
  PencilLine,
  Phone,
  Save,
  Users,
  X
} from 'lucide-react'
import api from '../api'

const panelClass = 'rounded-2xl border border-[#E8EAF0] bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]'
const inputClass =
  'w-full rounded-[10px] border border-[#E8EAF0] bg-white px-4 py-3 text-sm text-[#1A1D27] outline-none focus:border-[#3B6FE8]'

const resolveUploadUrl = (pathOrUrl) => {
  if (!pathOrUrl) {
    return ''
  }

  if (pathOrUrl.startsWith('http')) {
    return pathOrUrl
  }

  const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
  const origin = base.replace(/\/api\/?$/, '')
  return `${origin}${pathOrUrl}`
}

const CompanyDashboard = () => {
  const [user, setUser] = useState(null)
  const [internships, setInternships] = useState([])
  const [applicants, setApplicants] = useState([])
  const [activeTab, setActiveTab] = useState('internships')
  const [loading, setLoading] = useState(true)
  const [profileEditMode, setProfileEditMode] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')
  const [selectedInternship, setSelectedInternship] = useState(null)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const navigate = useNavigate()

  const [companyForm, setCompanyForm] = useState({
    name: '',
    industry: '',
    address: '',
    website: '',
    phone: '',
    email: ''
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
      address: userData.address || '',
      website: userData.website || '',
      phone: userData.phone || '',
      email: userData.email || ''
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

  const handleViewInternship = (internship) => {
    setSelectedInternship(internship)
    setIsViewOpen(true)
  }

  const handleEditInternship = (internship) => {
    navigate(`/company-dashboard/edit-internship/${internship._id}`)
  }

  const handleDeleteInternship = async (internshipId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this internship?')
    if (!confirmDelete) {
      return
    }

    try {
      await api.delete(`/internships/${internshipId}`)
      await fetchCompanyInternships()
      alert('Internship deleted successfully')
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete internship')
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
          address: response.data.data.address || '',
          website: response.data.data.website || '',
          phone: response.data.data.phone || '',
          email: response.data.data.email || ''
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

  const handleDeleteCompany = async () => {
    const confirmed = window.confirm('Are you sure you want to delete your company profile? This cannot be undone.')
    if (!confirmed) return

    try {
      const response = await api.delete('/company/profile')
      if (response.data.success) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('role')
        navigate('/login')
      }
    } catch (error) {
      setProfileError(error.response?.data?.message || 'Failed to delete company profile')
    }
  }

  const tabs = [
    { id: 'internships', label: 'Published internships', icon: BriefcaseBusiness },
    { id: 'applicants', label: 'Applicants', icon: Users },
    { id: 'profile', label: 'Company Profile', icon: Building2 }
  ]

  const pageTitles = {
    internships: {
      title: 'Company Dashboard',
      subtitle: 'Manage internship opportunities and keep your hiring pipeline active.'
    },
    applicants: {
      title: 'Applicants',
      subtitle: 'Review student applications and update decisions quickly.'
    },
    profile: {
      title: 'Company Profile',
      subtitle: 'Maintain your public company information for students.'
    }
  }

  const current = pageTitles[activeTab]
  const mainClassName = 'mx-auto max-w-[1600px] px-6 py-7 xl:px-8'
  const companyInitials =
    user?.name
      ?.split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase())
      .join('') || 'CO'

  if (loading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-[#e8edf6]">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#3B6FE8]" />
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#e8edf6]">
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/authbackgound.jpg')" }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/40 via-white/25 to-[#d8e6f8]/35" />

      <header className="sticky top-0 z-50 border-b border-[#E8EAF0] bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-[64px] w-full max-w-[1600px] items-center justify-between px-6 xl:px-8">
          <div className="flex items-center gap-3">
            <img
              src="/logo_icon_only.png"
              alt="InternConnect logo"
              className="h-[36px] w-[36px] rounded-[10px] border border-[#E8EAF0] bg-white object-cover shadow-sm"
            />
            <span className="font-display text-[19px] font-bold text-[#1A1D27]">InternConnect</span>
          </div>

          <nav className="hidden flex-wrap gap-1 lg:flex">
            {tabs.map(({ id, label, icon: Icon }) => {
              const isActive = activeTab === id
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-medium transition-colors ${
                    isActive
                      ? 'bg-[#EEF2FD] text-[#3B6FE8]'
                      : 'text-[#6B7280] hover:bg-[#F7F8FA] hover:text-[#1A1D27]'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </button>
              )
            })}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 sm:flex">
              <div className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-gradient-to-br from-[#3B6FE8] to-[#6B9FFF] text-sm font-bold text-white shadow-sm">
                {companyInitials}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg border border-[#E8EAF0] bg-white px-3 py-2 text-[13px] font-semibold text-[#1A1D27] transition hover:bg-[#F7F8FA]"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className={`relative z-10 ${mainClassName}`}>
        <div className="mb-6">
          <h1 className="font-display text-[36px] font-bold text-[#0F1419]">{current.title}</h1>
          <p className="mt-2 text-base font-bold text-[#3E4957]">{current.subtitle}</p>
        </div>

        <section className="mb-6 flex flex-wrap gap-3 lg:hidden">
          {tabs.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-medium transition-colors ${
                  isActive
                    ? 'bg-[#EEF2FD] text-[#3B6FE8]'
                    : 'bg-white text-[#6B7280] hover:bg-[#F7F8FA] hover:text-[#1A1D27]'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            )
          })}
        </section>

        {activeTab === 'internships' && (
          <section>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-xl font-bold text-[#1A1D27]">Published Internships</h2>
              <button
                onClick={() => navigate('/company-dashboard/post-internship')}
                className="inline-flex items-center gap-2 rounded-[10px] bg-[#3B6FE8] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2D5CD4]"
              >
                <span className="text-base leading-none">+</span>
                Post New Internship
              </button>
            </div>

            {internships.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {internships.map((internship) => (
                  <article
                    key={internship._id}
                    className="rounded-2xl border border-[#E8EAF0] bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="mb-5 border-b border-[#E8EAF0] pb-5">
                      <div className="mb-2 inline-flex rounded-full bg-[#EEF2FD] px-3 py-1 text-xs font-semibold text-[#3B6FE8]">
                        {internship.specialization}
                      </div>
                      <h3 className="text-lg font-bold text-[#1A1D27]">{internship.title}</h3>
                      <span className="mt-2 inline-block rounded-full bg-[#F7F8FA] px-3 py-1 text-xs font-bold text-[#6B7280]">
                        {internship.type}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg bg-[#F7F8FA] p-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">Slots</p>
                        <p className="mt-1 text-sm font-bold text-[#1A1D27]">{internship.slots}</p>
                      </div>
                      <div className="rounded-lg bg-[#F7F8FA] p-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">Applications</p>
                        <p className="mt-1 text-sm font-bold text-[#1A1D27]">{internship.applications?.length || 0}</p>
                      </div>
                      <div className="rounded-lg bg-[#F7F8FA] p-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">Location</p>
                        <p className="mt-1 text-sm font-bold text-[#1A1D27]">{internship.location || 'Not set'}</p>
                      </div>
                      <div className="rounded-lg bg-[#F7F8FA] p-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">Duration</p>
                        <p className="mt-1 text-sm font-bold text-[#1A1D27]">{internship.duration || 'Not set'}</p>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleViewInternship(internship)}
                        className="rounded-[10px] border border-[#E8EAF0] bg-white px-3 py-2 text-xs font-semibold text-[#1A1D27] transition hover:bg-[#F7F8FA]"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleEditInternship(internship)}
                        className="rounded-[10px] border border-[#D4E0FA] bg-[#EEF2FD] px-3 py-2 text-xs font-semibold text-[#3B6FE8] transition hover:bg-[#DFE8FC]"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteInternship(internship._id)}
                        className="rounded-[10px] border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className={panelClass}>
                <div className="rounded-2xl border border-dashed border-[#D4E0FA] bg-[#F7F8FA] p-10 text-center">
                  <h3 className="text-xl font-bold text-[#1A1D27]">No internships posted yet</h3>
                  <p className="mt-2 text-[#6B7280]">Create your first internship to start attracting applicants.</p>
                </div>
              </div>
            )}
          </section>
        )}

        {activeTab === 'applicants' && (
          <section className="space-y-4">
            {applicants.length > 0 ? (
              applicants.map((applicant, index) => (
                <article key={`${applicant._id}-${index}`} className={panelClass}>
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-4">
                      <div>
                        <div className="mb-2 flex flex-wrap items-center gap-3">
                          <h3 className="text-xl font-bold text-[#1A1D27]">{applicant.name}</h3>
                          <span className="rounded-full bg-[#EEF2FD] px-3 py-1 text-xs font-semibold text-[#3B6FE8]">
                            {applicant.status || 'Pending'}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm text-[#6B7280]">
                          <p>{applicant.email}</p>
                          {applicant.phone ? <p>{applicant.phone}</p> : null}
                        </div>
                      </div>

                      <div className="rounded-xl bg-[#F7F8FA] p-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">Applied for</p>
                        <p className="mt-2 font-semibold text-[#1A1D27]">{applicant.internshipTitle}</p>
                        <p className="mt-1 text-sm text-[#6B7280]">
                          {applicant.internshipLocation} • {applicant.internshipType}
                        </p>
                      </div>

                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#6B7280]">Cover Letter</p>
                        <div className="rounded-xl bg-[#F7F8FA] p-4 text-sm leading-6 text-[#1A1D27] whitespace-pre-wrap">
                          {applicant.coverLetter}
                        </div>
                      </div>

                      {applicant.resume ? (
                        <a
                          href={resolveUploadUrl(applicant.resume)}
                          download={applicant.resume.split('/').pop()}
                          className="inline-flex items-center gap-2 text-sm font-semibold text-[#3B6FE8] transition-colors hover:text-[#2D5CD4]"
                        >
                          📥 Download Resume
                        </a>
                      ) : (
                        <p className="text-sm text-[#6B7280]">No resume uploaded</p>
                      )}
                    </div>

                    <div className="flex min-w-[220px] flex-col gap-3">
                      <button
                        onClick={() => handleUpdateApplicationStatus(applicant, 'Accepted')}
                        disabled={applicant.status === 'Accepted'}
                        className="rounded-[10px] bg-[#16A34A] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#15803D] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleUpdateApplicationStatus(applicant, 'Rejected')}
                        disabled={applicant.status === 'Rejected'}
                        className="rounded-[10px] bg-[#DC2626] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#B91C1C] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className={panelClass}>
                <div className="rounded-2xl border border-dashed border-[#D4E0FA] bg-[#F7F8FA] p-10 text-center">
                  <h3 className="text-xl font-bold text-[#1A1D27]">No applicants yet</h3>
                  <p className="mt-2 text-[#6B7280]">Once students apply, they will appear here for review.</p>
                </div>
              </div>
            )}
          </section>
        )}

        {activeTab === 'profile' && (
          <section>
            {profileError && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {profileError}
              </div>
            )}

            {profileSuccess && (
              <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
                {profileSuccess}
              </div>
            )}

            <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
              <div className="rounded-2xl border border-[#E8EAF0] bg-white p-6 text-center shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#3B6FE8] to-[#6B9FFF] text-[28px] font-bold text-white">
                  {companyInitials}
                </div>

                <h2 className="text-lg font-bold text-[#1A1D27]">{user?.name || '-'}</h2>

                <p className="mt-1 text-sm text-[#6B7280]">{user?.industry || 'Industry not added'}</p>

                <div className="mt-6 rounded-xl bg-[#F7F8FA] p-4 text-left">
                  <div className="mb-3">
                    <p className="text-xs text-[#6B7280]">Phone</p>
                    <p className="text-sm font-semibold text-[#1A1D27]">{user?.phone || '-'}</p>
                  </div>

                  <div>
                    <p className="text-xs text-[#6B7280]">Website</p>
                    <p className="break-all text-sm font-semibold text-[#1A1D27]">{user?.website || '-'}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[#E8EAF0] bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="font-display text-2xl font-bold text-[#1A1D27]">Edit Company Profile</h2>
                  <button
                    onClick={() => {
                      setProfileEditMode((prev) => !prev)
                      setProfileError('')
                      setProfileSuccess('')
                    }}
                    className="inline-flex items-center gap-2 rounded-[10px] border border-[#E8EAF0] bg-white px-4 py-2 text-sm font-semibold text-[#1A1D27] transition hover:bg-[#F7F8FA]"
                  >
                    <PencilLine className="h-4 w-4" />
                    {profileEditMode ? 'Cancel' : 'Edit Profile'}
                  </button>
                </div>

                {!profileEditMode ? (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-xl bg-[#F7F8FA] p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">Company Name</p>
                      <p className="mt-2 text-sm font-bold text-[#1A1D27]">{user?.name || '-'}</p>
                    </div>
                    <div className="rounded-xl bg-[#F7F8FA] p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">Industry</p>
                      <p className="mt-2 text-sm font-bold text-[#1A1D27]">{user?.industry || '-'}</p>
                    </div>
                    <div className="rounded-xl bg-[#F7F8FA] p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">Email</p>
                      <p className="mt-2 text-sm font-bold text-[#1A1D27]">{user?.email || '-'}</p>
                    </div>
                    <div className="rounded-xl bg-[#F7F8FA] p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">Phone</p>
                      <p className="mt-2 text-sm font-bold text-[#1A1D27]">{user?.phone || '-'}</p>
                    </div>
                    <div className="rounded-xl bg-[#F7F8FA] p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">Address</p>
                      <p className="mt-2 text-sm font-bold text-[#1A1D27]">{user?.address || '-'}</p>
                    </div>
                    <div className="rounded-xl bg-[#F7F8FA] p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">Website</p>
                      <p className="mt-2 text-sm font-bold text-[#1A1D27]">{user?.website || '-'}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-[#1A1D27]">Company Name</label>
                        <input type="text" name="name" value={companyForm.name} onChange={handleCompanyChange} className={inputClass} />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-[#1A1D27]">Industry</label>
                        <input type="text" name="industry" value={companyForm.industry} onChange={handleCompanyChange} className={inputClass} />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-[#1A1D27]">Email</label>
                        <input type="email" name="email" value={companyForm.email} onChange={handleCompanyChange} className={inputClass} />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-[#1A1D27]">Website</label>
                        <input type="url" name="website" value={companyForm.website} onChange={handleCompanyChange} className={inputClass} />
                      </div>

                      <div className="md:col-span-2">
                        <label className="mb-1.5 block text-sm font-semibold text-[#1A1D27]">Address</label>
                        <input type="text" name="address" value={companyForm.address} onChange={handleCompanyChange} className={inputClass} />
                      </div>

                      <div className="md:col-span-2">
                        <label className="mb-1.5 block text-sm font-semibold text-[#1A1D27]">Phone</label>
                        <div className="relative">
                          <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
                          <input
                            type="tel"
                            name="phone"
                            value={companyForm.phone}
                            onChange={handleCompanyChange}
                            className={`${inputClass} pl-11`}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={handleSaveCompanyProfile}
                        disabled={profileLoading}
                        className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-[#3B6FE8] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2D5CD4] disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        <Save className="h-4 w-4" />
                        {profileLoading ? 'Saving...' : 'Save Changes'}
                      </button>

                      <button
                        onClick={handleDeleteCompany}
                        disabled={profileLoading}
                        className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-[#DC2626] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#B91C1C] disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        Delete Account
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </main>

      {isViewOpen && selectedInternship ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-2xl rounded-2xl border border-[#E8EAF0] bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-2xl font-bold text-[#1A1D27]">Internship Details</h3>
              <button
                onClick={() => {
                  setIsViewOpen(false)
                  setSelectedInternship(null)
                }}
                className="rounded-lg border border-[#E8EAF0] p-2 text-[#6B7280] hover:bg-[#F7F8FA]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-lg bg-[#F7F8FA] p-4 md:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">Title</p>
                <p className="mt-1 text-base font-bold text-[#1A1D27]">{selectedInternship.title}</p>
              </div>
              <div className="rounded-lg bg-[#F7F8FA] p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">Specialization</p>
                <p className="mt-1 text-sm font-semibold text-[#1A1D27]">{selectedInternship.specialization || '-'}</p>
              </div>
              <div className="rounded-lg bg-[#F7F8FA] p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">Type</p>
                <p className="mt-1 text-sm font-semibold text-[#1A1D27]">{selectedInternship.type || '-'}</p>
              </div>
              <div className="rounded-lg bg-[#F7F8FA] p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">Duration</p>
                <p className="mt-1 text-sm font-semibold text-[#1A1D27]">{selectedInternship.duration || '-'}</p>
              </div>
              <div className="rounded-lg bg-[#F7F8FA] p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">Location</p>
                <p className="mt-1 text-sm font-semibold text-[#1A1D27]">{selectedInternship.location || '-'}</p>
              </div>
              <div className="rounded-lg bg-[#F7F8FA] p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">Stipend</p>
                <p className="mt-1 text-sm font-semibold text-[#1A1D27]">{selectedInternship.stipend || '-'}</p>
              </div>
              <div className="rounded-lg bg-[#F7F8FA] p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">Deadline</p>
                <p className="mt-1 text-sm font-semibold text-[#1A1D27]">
                  {selectedInternship.deadline ? new Date(selectedInternship.deadline).toLocaleDateString() : '-'}
                </p>
              </div>
              <div className="rounded-lg bg-[#F7F8FA] p-4 md:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">Description</p>
                <p className="mt-1 text-sm text-[#1A1D27] whitespace-pre-wrap">{selectedInternship.description || '-'}</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

    </div>
  )
}

export default CompanyDashboard
