import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Header from '../components/Header'

function WriteReview() {
  const navigate = useNavigate()
  const location = useLocation()
  const [formData, setFormData] = useState({
    company: '',
    role: '',
    rating: 3,
    experience: '',
  })
  const [loading, setLoading] = useState(false)
  const [editingReview, setEditingReview] = useState(null)

  useEffect(() => {
    // Check if we're editing an existing review
    if (location.state?.review) {
      const review = location.state.review
      setEditingReview(review)
      setFormData({
        company: review.company,
        role: review.role,
        rating: review.rating,
        experience: review.text,
      })
    }
  }, [location.state])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value) : value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.company || !formData.role || !formData.experience) {
      alert('Please fill all fields')
      return
    }

    setLoading(true)
    setTimeout(() => {
      // Get current user from localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      
      // Determine if review is good or bad based on rating
      const isBadReview = formData.rating <= 2
      const isGoodReview = formData.rating >= 4
      
      if (editingReview) {
        // Update existing review
        const updatedReview = {
          ...editingReview,
          company: formData.company,
          role: formData.role,
          rating: formData.rating,
          text: formData.experience,
          verified: isGoodReview, // Re-evaluate verification
          flagged: isBadReview, // Re-evaluate flagging
          sentiment: isBadReview ? 'Negative' : isGoodReview ? 'Positive' : 'Neutral',
          updatedAt: new Date().toISOString(), // Track when it was last edited
        }
        
        const existingReviews = JSON.parse(localStorage.getItem('userReviews') || '[]')
        const updatedReviews = existingReviews.map(r => r.id === editingReview.id ? updatedReview : r)
        localStorage.setItem('userReviews', JSON.stringify(updatedReviews))
      } else {
        // Create new review
        const newReview = {
          id: Date.now(),
          authorId: user.id || user.email || 'anonymous',
          authorName: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 'Anonymous',
          company: formData.company,
          role: formData.role,
          rating: formData.rating,
          text: formData.experience,
          date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          createdAt: new Date().toISOString(), // Store full timestamp for comparison
          tags: [],
          verified: isGoodReview, // Only verified if rating >= 4
          flagged: isBadReview, // Flag if rating <= 2
          sentiment: isBadReview ? 'Negative' : isGoodReview ? 'Positive' : 'Neutral',
        }
        
        const existingReviews = JSON.parse(localStorage.getItem('userReviews') || '[]')
        localStorage.setItem('userReviews', JSON.stringify([newReview, ...existingReviews]))
      }

      setLoading(false)
      navigate('/dashboard?tab=reviews')
    }, 500)
  }

  const handleCancel = () => {
    navigate('/dashboard?tab=reviews')
  }

  const ratingLabelMap = {
    1: 'Very Poor',
    2: 'Needs Improvement',
    3: 'Average',
    4: 'Good',
    5: 'Excellent',
  }

  const sentimentLabel =
    formData.rating <= 2 ? 'Negative' : formData.rating >= 4 ? 'Positive' : 'Neutral'

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#e8edf6]">
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/authbackgound.jpg')" }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/40 via-white/25 to-[#d8e6f8]/35" />

      <div className="relative z-10">
        <Header active="reviews" />

        <main className="mx-auto max-w-[1600px] px-6 py-7 xl:px-8">
          <div className="mb-6 rounded-3xl border border-[#DCE6FB] bg-gradient-to-r from-[#F6FAFF] via-[#FFFFFF] to-[#EEF4FF] p-6 shadow-[0_10px_25px_rgba(38,92,186,0.10)] lg:p-7">
            <button
              onClick={handleCancel}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#D4E0FA] bg-white px-3 py-1.5 text-sm font-semibold text-[#3B6FE8] transition hover:bg-[#EEF2FD]"
            >
              <span>←</span>
              Back to Reviews
            </button>

            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#3B6FE8]">Anonymous Feedback</p>
                <h1 className="mt-2 font-display text-[34px] font-bold leading-tight text-[#1A1D27]">
                  {editingReview ? 'Edit Anonymous Review' : 'Write Anonymous Review'}
                </h1>
                <p className="mt-2 max-w-3xl text-sm text-[#5D6A7E] lg:text-base">
                  {editingReview
                    ? 'Refine your internship feedback with clearer details to help future students make better choices.'
                    : 'Share your honest internship experience. Your identity is protected while your insights remain impactful.'}
                </p>
              </div>

              <div className="rounded-2xl border border-[#DDE8FF] bg-white/90 px-4 py-3 text-right">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6B7280]">Current Rating</p>
                <p className="mt-1 text-2xl font-bold text-[#1A1D27]">{formData.rating}.0</p>
                <p className="text-xs font-semibold text-[#3B6FE8]">{ratingLabelMap[formData.rating]}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-[#E3EAF8] bg-white p-6 shadow-[0_8px_24px_rgba(16,30,59,0.06)] lg:p-8">
            <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[1fr_1.35fr] xl:items-start">
              <div className="space-y-5">
                <div className="rounded-2xl border border-[#E8EAF0] bg-[#FCFCFD] p-5">
                  <label className="mb-2 block text-sm font-semibold text-[#1A1D27]">Company Name *</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="e.g., TechCorp Malaysia"
                    className="w-full rounded-xl border border-[#D9E2F2] bg-white px-4 py-3 text-base outline-none transition focus:border-[#3B6FE8] focus:ring-2 focus:ring-[#3B6FE8]/15"
                  />
                </div>

                <div className="rounded-2xl border border-[#E8EAF0] bg-[#FCFCFD] p-5">
                  <label className="mb-2 block text-sm font-semibold text-[#1A1D27]">Your Role/Position *</label>
                  <input
                    type="text"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    placeholder="e.g., Software Engineering Intern"
                    className="w-full rounded-xl border border-[#D9E2F2] bg-white px-4 py-3 text-base outline-none transition focus:border-[#3B6FE8] focus:ring-2 focus:ring-[#3B6FE8]/15"
                  />
                </div>

                <div className="rounded-2xl border border-[#E8EAF0] bg-[#FCFCFD] p-5">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <label className="text-sm font-semibold text-[#1A1D27]">Overall Rating *</label>
                    <span className="rounded-full bg-[#EEF2FD] px-3 py-1 text-xs font-semibold text-[#3B6FE8]">
                      {ratingLabelMap[formData.rating]}
                    </span>
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, rating: star }))}
                        className={`rounded-xl px-3 py-3 text-sm font-bold transition ${
                          formData.rating === star
                            ? 'bg-[#3B6FE8] text-white shadow-[0_8px_16px_rgba(59,111,232,0.28)]'
                            : 'border border-[#E4E8F1] bg-white text-[#6B7280] hover:border-[#3B6FE8]/40 hover:text-[#3B6FE8]'
                        }`}
                      >
                        ★ {star}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div className="rounded-2xl border border-[#E8EAF0] bg-[#FCFCFD] p-5">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label className="text-sm font-semibold text-[#1A1D27]">Your Experience *</label>
                    <span className="text-xs font-semibold text-[#6B7280]">{formData.experience.length} characters</span>
                  </div>
                  <textarea
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    placeholder="Share your honest experience about mentorship, work culture, tasks, growth opportunities, and support from your team."
                    rows="11"
                    maxLength={1600}
                    className="w-full rounded-xl border border-[#D9E2F2] bg-white px-4 py-3 text-base outline-none transition focus:border-[#3B6FE8] focus:ring-2 focus:ring-[#3B6FE8]/15"
                  />
                </div>

                <div className="rounded-2xl border border-[#D7EEDF] bg-gradient-to-r from-[#F4FCF7] to-[#EEF8FF] p-4">
                  <p className="text-sm font-semibold text-[#1A1D27]">Privacy & AI Moderation</p>
                  <p className="mt-1 text-sm text-[#4D5C71]">
                    Your identity remains private. The system uses AI moderation checks before publishing to reduce spam and improve review quality.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-[#E6EBF6] bg-[#FAFCFF] px-3 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#6B7280]">Sentiment</p>
                    <p className="mt-1 text-sm font-bold text-[#1A1D27]">{sentimentLabel}</p>
                  </div>
                  <div className="rounded-xl border border-[#E6EBF6] bg-[#FAFCFF] px-3 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#6B7280]">Verification</p>
                    <p className="mt-1 text-sm font-bold text-[#1A1D27]">{formData.rating >= 4 ? 'Likely Verified' : 'Pending Review'}</p>
                  </div>
                  <div className="rounded-xl border border-[#E6EBF6] bg-[#FAFCFF] px-3 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#6B7280]">Anonymity</p>
                    <p className="mt-1 text-sm font-bold text-[#1A1D27]">Protected</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-1 lg:col-span-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-xl bg-[#3B6FE8] px-6 py-3.5 font-semibold text-white transition hover:bg-[#2D5CD4] disabled:opacity-50"
                >
                  {loading ? (editingReview ? 'Updating...' : 'Submitting...') : (editingReview ? 'Update Review' : 'Submit Review')}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 rounded-xl border border-[#D8DFEC] bg-white px-6 py-3.5 font-semibold text-[#1A1D27] transition hover:bg-[#F7F8FA]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}

export default WriteReview
