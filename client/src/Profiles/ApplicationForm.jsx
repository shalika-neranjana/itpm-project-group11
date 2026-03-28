import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api'
import Header from '../components/Header'

const ApplicationForm = () => {
  const { id } = useParams()
  const [internship, setInternship] = useState(null)
  const [user, setUser] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    coverLetter: ''
  })
  const [resumeFile, setResumeFile] = useState(null)
  const [resumeInputKey, setResumeInputKey] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('student') || '{}')
    const token = localStorage.getItem('token')
    
    if (!token || localStorage.getItem('role') !== 'student') {
      navigate('/login')
      return
    }

    setUser(userData)
    setFormData({
      name: `${userData.firstName} ${userData.lastName}`,
      email: userData.email,
      phone: userData.phone || '',
      coverLetter: ''
    })

    fetchInternship()
  }, [id, navigate])

  const fetchInternship = async () => {
    try {
      const response = await api.get(`/internships/${id}`)
      setInternship(response.data.data)
    } catch (error) {
      console.error('Failed to fetch internship:', error)
      setError('Failed to load internship details')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    if (!formData.coverLetter.trim()) {
      setError('Please write a cover letter')
      setSubmitting(false)
      return
    }

    if (!resumeFile) {
      setError('Please upload your resume as a PDF file')
      setSubmitting(false)
      return
    }

    if (resumeFile.type !== 'application/pdf') {
      setError('Only PDF files are allowed for resume upload')
      setSubmitting(false)
      return
    }

    try {
      const payload = new FormData()
      payload.append('name', formData.name)
      payload.append('email', formData.email)
      payload.append('phone', formData.phone)
      payload.append('coverLetter', formData.coverLetter)
      payload.append('resume', resumeFile)

      const response = await api.post(`/internships/${id}/apply`, payload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      if (response.data.success) {
        setSuccess('Application submitted successfully!')
        setTimeout(() => {
          navigate('/dashboard')
        }, 2000)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit application')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#e8edf6]">
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/authbackgound.jpg')" }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/40 via-white/25 to-[#d8e6f8]/35" />
        <div className="relative z-10 flex min-h-screen items-center justify-center">
          <div className="rounded-2xl border border-[#E8EAF0] bg-white p-8 shadow-[0_6px_20px_rgba(22,34,57,0.08)]">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-[#3B6FE8]"></div>
            <p className="mt-4 text-sm font-semibold text-[#3E4957]">Loading internship details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!internship) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#e8edf6]">
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/authbackgound.jpg')" }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/40 via-white/25 to-[#d8e6f8]/35" />
        <div className="relative z-10 flex min-h-screen items-center justify-center">
          <div className="rounded-2xl border border-[#E8EAF0] bg-white p-8 text-center shadow-[0_6px_20px_rgba(22,34,57,0.08)]">
            <p className="text-[#6B7280]">Internship not found</p>
          <button
            onClick={() => navigate('/marketplace')}
            className="mt-4 rounded-lg bg-[#3B6FE8] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2D5CD4]"
          >
            Back to Marketplace
          </button>
          </div>
        </div>
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

      <div className="relative z-10">
        <Header active="opportunities" />

        <main className="mx-auto max-w-[1600px] px-6 py-7 xl:px-8">
          <div className="rounded-3xl border border-[#DCE6FB] bg-gradient-to-r from-[#F6FAFF] via-white to-[#EEF4FF] p-6 shadow-[0_10px_25px_rgba(38,92,186,0.10)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="mr-4 inline-flex items-center rounded-full border border-[#D4E0FA] bg-white px-3 py-1.5 text-sm font-semibold text-[#3B6FE8] transition hover:bg-[#EEF2FD]"
                >
                  ← Back
                </button>
                <h1 className="font-display text-2xl font-bold text-[#1A1D27]">Apply for Internship</h1>
              </div>

              <div className="rounded-xl border border-[#D9E6FF] bg-white/90 px-4 py-2 text-sm font-semibold text-[#3B6FE8]">
                Application Portal
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-[#E8EAF0] bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)] lg:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start">
                <div className="mr-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#3B6FE8] to-[#2D5CD4] text-base font-bold text-white shadow-sm">
                  {internship.company?.name?.substring(0, 2).toUpperCase() || 'CO'}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#1A1D27]">{internship.title}</h2>
                  <p className="text-[#6B7280]">{internship.company?.name}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-[#EEF2FD] px-3 py-1 text-xs font-semibold text-[#3B6FE8]">
                      {internship.specialization}
                    </span>
                    <span className="rounded-full bg-[#F3F4F6] px-3 py-1 text-xs font-semibold text-[#4B5563]">
                      {internship.type}
                    </span>
                    <span className="rounded-full bg-[#F3F4F6] px-3 py-1 text-xs font-semibold text-[#4B5563]">
                      {internship.location}
                    </span>
                    <span className="rounded-full bg-[#E8F7EE] px-3 py-1 text-xs font-semibold text-[#127A3A]">
                      {internship.stipend}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-[#E8EAF0] bg-[#FAFCFF] px-4 py-3 text-right">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6B7280]">Deadline</p>
                <p className="mt-1 font-semibold text-[#1A1D27]">
                  {new Date(internship.deadline).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div className="mx-auto mt-7 max-w-[1100px]">
            {success && (
              <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                <p className="font-medium text-green-800">{success}</p>
              </div>
            )}

            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <p className="font-medium text-red-800">{error}</p>
              </div>
            )}

            <div className="rounded-2xl border border-[#E8EAF0] bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)] lg:p-7">
              <h3 className="mb-6 text-lg font-bold text-[#1A1D27]">Application Details</h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#1A1D27]">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      className="w-full rounded-lg border border-[#E5EAF3] bg-[#F7F8FA] px-4 py-2.5 text-sm text-[#6B7280]"
                      readOnly
                      disabled
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#1A1D27]">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-[#E5EAF3] bg-[#F7F8FA] px-4 py-2.5 text-sm text-[#6B7280]"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#1A1D27]">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      className="w-full rounded-lg border border-[#E5EAF3] bg-[#F7F8FA] px-4 py-2.5 text-sm text-[#6B7280]"
                      readOnly
                      disabled
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#1A1D27]">
                      Resume (PDF) *
                    </label>
                    <div className="rounded-lg border border-[#D9E2F2] bg-white px-4 py-3 transition focus-within:border-[#3B6FE8] focus-within:ring-2 focus-within:ring-[#3B6FE8]/15">
                      <input
                        key={resumeInputKey}
                        id="resume-upload"
                        type="file"
                        name="resume"
                        accept=".pdf,application/pdf"
                        onChange={(e) => {
                          const selectedFile = e.target.files?.[0] || null
                          setResumeFile(selectedFile)
                        }}
                        className="hidden"
                        required
                      />

                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="min-w-0 flex-1 truncate text-sm text-[#3E4957]">
                          {resumeFile ? resumeFile.name : 'No file selected'}
                        </p>

                        <div className="flex items-center gap-2">
                          <label
                            htmlFor="resume-upload"
                            className="cursor-pointer rounded-md border border-[#D4E0FA] bg-[#EEF2FD] px-3 py-1.5 text-sm font-semibold text-[#3B6FE8] transition hover:bg-[#DFE8FC]"
                          >
                            {resumeFile ? 'Change PDF' : 'Choose PDF'}
                          </label>

                          {resumeFile ? (
                            <button
                              type="button"
                              onClick={() => {
                                setResumeFile(null)
                                setResumeInputKey((prev) => prev + 1)
                              }}
                              className="rounded-md border border-[#E5EAF3] bg-white px-3 py-1.5 text-sm font-semibold text-[#6B7280] transition hover:bg-[#F7F8FA]"
                            >
                              Remove
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <p className="mt-1 text-sm text-[#6B7280]">Only PDF files are accepted.</p>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#1A1D27]">
                    Cover Letter *
                  </label>
                  <textarea
                    name="coverLetter"
                    value={formData.coverLetter}
                    onChange={handleChange}
                    rows={8}
                    className="w-full rounded-lg border border-[#D9E2F2] px-4 py-2.5 text-sm outline-none transition focus:border-[#3B6FE8] focus:ring-2 focus:ring-[#3B6FE8]/15"
                    placeholder="Tell us why you are interested in this internship and why you would be a great fit..."
                    required
                  />
                  <p className="mt-1 text-sm text-[#6B7280]">
                    Explain your skills, experience, and why you are interested in this position.
                  </p>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 rounded-lg bg-[#3B6FE8] px-4 py-3 font-semibold text-white transition hover:bg-[#2D5CD4] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting ? (
                      <div className="flex items-center justify-center">
                        <div className="mr-2 h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
                        Submitting Application...
                      </div>
                    ) : (
                      'Submit Application'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    className="flex-1 rounded-lg border border-[#D8DFEC] bg-white px-4 py-3 font-semibold text-[#1A1D27] transition hover:bg-[#F7F8FA]"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default ApplicationForm
