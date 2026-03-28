import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, PencilLine } from 'lucide-react'
import api from '../api'

const signupInputClass =
  'w-full rounded-[10px] border border-[#E8EAF0] bg-white px-4 py-3 text-sm text-[#1A1D27] outline-none transition focus:border-[#3B6FE8] focus:ring-2 focus:ring-[#3B6FE8]/10'

const initialInternshipForm = {
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
}

function CompanyEditInternship() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [internshipForm, setInternshipForm] = useState(initialInternshipForm)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const handleDurationChange = (value) => {
    const numericOnly = value.replace(/\D/g, '')
    setInternshipForm((prev) => ({ ...prev, duration: numericOnly }))
  }

  const formatLkrAmount = (rawValue) => {
    const digits = rawValue.replace(/\D/g, '')
    if (!digits) {
      return ''
    }

    const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    return `LKR ${grouped}`
  }

  const handleStipendChange = (value) => {
    setInternshipForm((prev) => ({
      ...prev,
      stipend: formatLkrAmount(value)
    }))
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')

    if (!token || role !== 'company') {
      navigate('/login')
      return
    }

    const loadInternship = async () => {
      try {
        const response = await api.get(`/internships/${id}`)
        const internship = response.data?.data

        if (!internship) {
          setSubmitError('Internship not found')
          return
        }

        const deadlineDate = internship.deadline ? new Date(internship.deadline) : null
        const formattedDeadline = deadlineDate && !Number.isNaN(deadlineDate.getTime())
          ? deadlineDate.toISOString().split('T')[0]
          : ''

        setInternshipForm({
          title: internship.title || '',
          specialization: internship.specialization || 'Computer Science',
          type: internship.type || 'On-site',
          duration: String(internship.duration || '').replace(/\D/g, ''),
          location: internship.location || '',
          stipend: internship.stipend ? formatLkrAmount(internship.stipend) : '',
          deadline: formattedDeadline,
          description: internship.description || '',
          duties: internship.duties || [],
          requirements: internship.requirements || [],
          slots: internship.slots || 1
        })
      } catch (error) {
        setSubmitError(error.response?.data?.message || 'Failed to load internship details')
      } finally {
        setIsLoading(false)
      }
    }

    loadInternship()
  }, [id, navigate])

  const handleSaveInternship = async () => {
    setIsSubmitting(true)
    setSubmitError('')

    try {
      const payload = {
        ...internshipForm,
        slots: parseInt(internshipForm.slots, 10) || 1
      }

      const response = await api.put(`/internships/${id}`, payload)

      if (response.data.success) {
        navigate('/company-dashboard')
      }
    } catch (error) {
      setSubmitError(error.response?.data?.message || 'Failed to update internship')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-[#e8edf6]">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#3B6FE8]" />
      </div>
    )
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#e8edf6]">
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/authbackgound.jpg')" }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/40 via-white/25 to-[#d8e6f8]/35" />

      <div className="relative z-10 h-full w-full p-4 lg:p-6">
        <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-[#E8EAF0] bg-white shadow-[0_20px_40px_rgba(15,23,42,0.18)]">
          <header className="border-b border-[#E8EAF0] bg-white px-6 py-5 lg:px-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-gradient-to-br from-[#3B6FE8] to-[#6B9FFF] shadow-sm">
                  <PencilLine className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="font-display text-3xl font-bold text-[#1A1D27]">Edit Internship</h1>
                  <p className="mt-1 text-sm text-[#6B7280]">Update this role using the same horizontal form layout.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('/company-dashboard')}
                className="inline-flex items-center gap-2 rounded-[10px] border border-[#E8EAF0] bg-white px-3 py-2 text-sm font-semibold text-[#1A1D27] transition hover:bg-[#F7F8FA]"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </button>
            </div>
          </header>

          <div className="grid min-h-0 flex-1 lg:grid-cols-[320px_1fr]">
            <aside className="hidden border-r border-[#E8EAF0] bg-[#F7F8FA] p-6 lg:block lg:p-8">
              <p className="text-sm font-semibold text-[#3E4957]">Internship Update</p>
              <p className="mt-2 text-sm text-[#6B7280]">Edit fields and save to update the existing internship listing.</p>
            </aside>

            <section className="h-full overflow-y-auto p-6 lg:p-8">
              {submitError ? (
                <div className="mb-4 rounded-lg bg-red-100 px-4 py-3 text-sm text-red-700">{submitError}</div>
              ) : null}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <div className="xl:col-span-2">
                  <label className="mb-1.5 block text-sm font-semibold text-[#1A1D27]">Internship Title</label>
                  <input
                    type="text"
                    value={internshipForm.title}
                    onChange={(e) => setInternshipForm({ ...internshipForm, title: e.target.value })}
                    className={signupInputClass}
                    placeholder="e.g. Software Engineering Intern"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-[#1A1D27]">Type</label>
                  <select
                    value={internshipForm.type}
                    onChange={(e) => setInternshipForm({ ...internshipForm, type: e.target.value })}
                    className={signupInputClass}
                  >
                    <option>On-site</option>
                    <option>Remote</option>
                    <option>Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-[#1A1D27]">Specialization</label>
                  <select
                    value={internshipForm.specialization}
                    onChange={(e) => setInternshipForm({ ...internshipForm, specialization: e.target.value })}
                    className={signupInputClass}
                  >
                    <option>Computer Science</option>
                    <option>Data Science</option>
                    <option>Multimedia</option>
                    <option>Software Engineering</option>
                    <option>Cybersecurity</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-[#1A1D27]">Duration (months)</label>
                  <input
                    type="number"
                    value={internshipForm.duration}
                    onChange={(e) => handleDurationChange(e.target.value)}
                    className={signupInputClass}
                    placeholder="e.g. 6"
                    min="1"
                    inputMode="numeric"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-[#1A1D27]">Number of Slots</label>
                  <input
                    type="number"
                    value={internshipForm.slots}
                    onChange={(e) => setInternshipForm({ ...internshipForm, slots: parseInt(e.target.value, 10) || 1 })}
                    min="1"
                    className={signupInputClass}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-[#1A1D27]">Location</label>
                  <input
                    type="text"
                    value={internshipForm.location}
                    onChange={(e) => setInternshipForm({ ...internshipForm, location: e.target.value })}
                    className={signupInputClass}
                    placeholder="e.g. Colombo"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-[#1A1D27]">Stipend</label>
                  <input
                    type="text"
                    value={internshipForm.stipend}
                    onChange={(e) => handleStipendChange(e.target.value)}
                    className={signupInputClass}
                    placeholder="e.g. LKR 10,000,000"
                    inputMode="numeric"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-[#1A1D27]">Deadline</label>
                  <input
                    type="date"
                    value={internshipForm.deadline}
                    onChange={(e) => setInternshipForm({ ...internshipForm, deadline: e.target.value })}
                    className={signupInputClass}
                  />
                </div>

                <div className="md:col-span-2 xl:col-span-3">
                  <label className="mb-1.5 block text-sm font-semibold text-[#1A1D27]">Description</label>
                  <textarea
                    value={internshipForm.description}
                    onChange={(e) => setInternshipForm({ ...internshipForm, description: e.target.value })}
                    rows={5}
                    className={signupInputClass}
                    placeholder="Describe the internship role..."
                  />
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={handleSaveInternship}
                  disabled={isSubmitting}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-[10px] bg-[#3B6FE8] px-4 py-3 font-semibold text-white transition hover:bg-[#2D5CD4] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <PencilLine className="h-4 w-4" />
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => navigate('/company-dashboard')}
                  className="flex-1 rounded-[10px] border border-[#E8EAF0] bg-white px-4 py-3 font-semibold text-[#1A1D27] transition hover:bg-[#F7F8FA]"
                >
                  Cancel
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CompanyEditInternship
