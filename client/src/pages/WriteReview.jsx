import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, MessageSquare, Send } from 'lucide-react'

const signupInputClass =
  'w-full rounded-[10px] border border-[#E8EAF0] bg-white px-4 py-3 text-sm text-[#1A1D27] outline-none transition focus:border-[#3B6FE8] focus:ring-2 focus:ring-[#3B6FE8]/10'

function WriteReview() {
  const navigate = useNavigate()
  const location = useLocation()
  const [formData, setFormData] = useState({
    company: '',
    role: '',
    rating: null,
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
    if (!formData.company || !formData.role || !formData.experience || !formData.rating) {
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
    !formData.rating
      ? 'Not Selected'
      : formData.rating <= 2
        ? 'Negative'
        : formData.rating >= 4
          ? 'Positive'
          : 'Neutral'

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
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="font-display text-3xl font-bold text-[#1A1D27]">
                    {editingReview ? 'Edit Anonymous Review' : 'Write Anonymous Review'}
                  </h1>
                  <p className="mt-1 text-sm text-[#6B7280]">
                    Share internship feedback using the same structured layout as internship posting.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex items-center gap-2 rounded-[10px] border border-[#E8EAF0] bg-white px-3 py-2 text-sm font-semibold text-[#1A1D27] transition hover:bg-[#F7F8FA]"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Reviews
              </button>
            </div>
          </header>

          <div className="grid min-h-0 flex-1 lg:grid-cols-[320px_1fr]">
            <aside className="hidden border-r border-[#E8EAF0] bg-[#F7F8FA] p-6 lg:block lg:p-8">
              <p className="text-sm font-semibold text-[#3E4957]">Review Setup</p>
              <p className="mt-2 text-sm text-[#6B7280]">Fill out your anonymous internship review. Your identity remains protected.</p>
              <div className="mt-5 rounded-xl border border-[#E4EAF7] bg-white px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#6B7280]">Current Rating</p>
                <p className="mt-1 text-2xl font-bold text-[#1A1D27]">{formData.rating ? `${formData.rating}.0` : '--'}</p>
                <p className="text-xs font-semibold text-[#3B6FE8]">{formData.rating ? ratingLabelMap[formData.rating] : 'Not selected'}</p>
              </div>
              <div className="mt-3 rounded-xl border border-[#E4EAF7] bg-white px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#6B7280]">Sentiment</p>
                <p className="mt-1 text-sm font-bold text-[#1A1D27]">{sentimentLabel}</p>
              </div>
            </aside>

            <section className="h-full overflow-y-auto p-6 lg:p-8">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-[#1A1D27]">Company Name</label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder="e.g. TechCorp Malaysia"
                      className={signupInputClass}
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-[#1A1D27]">Role / Position</label>
                    <input
                      type="text"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      placeholder="e.g. Software Engineering Intern"
                      className={`${signupInputClass} ${!formData.company ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''}`}
                      disabled={!formData.company}
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-1.5 block text-sm font-semibold text-[#1A1D27]">Overall Rating</label>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, rating: star }))}
                          className={`rounded-[10px] px-4 py-3 text-sm font-semibold transition ${
                            formData.rating === star
                              ? 'bg-yellow-400 text-[#1A1D27]'
                              : 'border border-[#E8EAF0] bg-white text-[#1A1D27] hover:bg-[#F7F8FA]'
                          }`}
                        >
                          ★ {star}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <div className="mb-1.5 flex items-center justify-between gap-3">
                      <label className="block text-sm font-semibold text-[#1A1D27]">Experience</label>
                      <span className="text-xs font-semibold text-[#6B7280]">{formData.experience.length}/1600</span>
                    </div>
                    <textarea
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      rows={6}
                      maxLength={1600}
                      placeholder="Describe your internship experience, mentorship, work culture, and learning outcomes."
                      className={signupInputClass}
                      required
                    />
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-[10px] bg-[#3B6FE8] px-4 py-3 font-semibold text-white transition hover:bg-[#2D5CD4] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <Send className="h-4 w-4" />
                    {loading ? (editingReview ? 'Updating...' : 'Submitting...') : (editingReview ? 'Update Review' : 'Submit Review')}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 rounded-[10px] border border-[#E8EAF0] bg-white px-4 py-3 font-semibold text-[#1A1D27] transition hover:bg-[#F7F8FA]"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WriteReview
