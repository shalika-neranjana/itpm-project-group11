import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarCheck2 } from 'lucide-react'
import api from '../api'
import { error as swalError, success as swalSuccess } from '../utils/swal'

const inputClass =
  'w-full rounded-[10px] border border-[#E8EAF0] bg-white px-4 py-3 text-sm text-[#1A1D27] outline-none transition focus:border-[#3B6FE8] focus:ring-2 focus:ring-[#3B6FE8]/10'

function CompanyScheduleInterview() {
  const { internshipId, appId } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [applicationData, setApplicationData] = useState(null)
  const [formData, setFormData] = useState({
    mode: 'Online',
    date: '',
    time: '',
    place: '',
    supervisorEmail: '',
    supervisorContact: ''
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')

    if (!token || role !== 'company') {
      navigate('/login')
      return
    }

    const loadApplication = async () => {
      try {
        const response = await api.get(`/internships/${internshipId}/applications/${appId}`)
        setApplicationData(response.data?.data || null)
      } catch (error) {
        setLoadError(error.response?.data?.message || 'Failed to load application details')
      } finally {
        setLoading(false)
      }
    }

    loadApplication()
  }, [appId, internshipId, navigate])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const payload = {
        status: 'Accepted',
        interviewDetails: formData
      }

      const response = await api.put(`/internships/${internshipId}/applications/${appId}`, payload)

      if (response.data?.success) {
        swalSuccess('Interview details saved. Student has been notified in profile and by email.')
        navigate('/company-dashboard')
      }
    } catch (error) {
      swalError(error.response?.data?.message || 'Failed to schedule interview')
    } finally {
      setIsSubmitting(false)
    }
  }

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

      <div className="relative z-10 mx-auto max-w-3xl px-4 py-6 lg:py-8">
        <div className="rounded-2xl border border-[#E8EAF0] bg-white p-6 shadow-[0_20px_40px_rgba(15,23,42,0.18)] lg:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-gradient-to-br from-[#3B6FE8] to-[#6B9FFF] shadow-sm">
                <CalendarCheck2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold text-[#1A1D27]">Schedule Interview</h1>
                <p className="mt-1 text-sm text-[#6B7280]">Set interview details and notify the student.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/company-dashboard')}
              className="inline-flex items-center gap-2 rounded-[10px] border border-[#E8EAF0] bg-white px-3 py-2 text-sm font-semibold text-[#1A1D27] transition hover:bg-[#F7F8FA]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          </div>

          {loadError ? (
            <div className="mb-5 rounded-lg bg-red-100 px-4 py-3 text-sm text-red-700">{loadError}</div>
          ) : null}

          {applicationData ? (
            <div className="mb-6 rounded-xl bg-[#F7F8FA] p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">Applicant</p>
              <p className="mt-1 text-base font-semibold text-[#1A1D27]">{applicationData.application?.name}</p>
              <p className="text-sm text-[#6B7280]">{applicationData.application?.email}</p>
              <p className="mt-2 text-sm text-[#1A1D27]">
                Internship: <span className="font-semibold">{applicationData.internship?.title}</span>
              </p>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-[#1A1D27]">Interview Mode</label>
                <select
                  name="mode"
                  value={formData.mode}
                  onChange={handleChange}
                  className={inputClass}
                  required
                >
                  <option value="Online">Online</option>
                  <option value="Onsite">Onsite</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-[#1A1D27]">Interview Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-[#1A1D27]">Interview Time</label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-[#1A1D27]">Place / Meeting Link</label>
                <input
                  type="text"
                  name="place"
                  value={formData.place}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Office address or online meeting URL"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-[#1A1D27]">Supervisor Email</label>
                <input
                  type="email"
                  name="supervisorEmail"
                  value={formData.supervisorEmail}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-[#1A1D27]">Contact Number</label>
                <input
                  type="text"
                  name="supervisorContact"
                  value={formData.supervisorContact}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-[10px] bg-[#16A34A] px-4 py-3 font-semibold text-white transition hover:bg-[#15803D] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? 'Submitting...' : 'Accept and Notify Student'}
              </button>

              <button
                type="button"
                onClick={() => navigate('/company-dashboard')}
                className="flex-1 rounded-[10px] border border-[#E8EAF0] bg-white px-4 py-3 font-semibold text-[#1A1D27] transition hover:bg-[#F7F8FA]"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CompanyScheduleInterview
