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
      navigate('/dashboard', { state: { tab: 'reviews' } })
    }, 500)
  }

  const handleCancel = () => {
    navigate('/dashboard', { state: { tab: 'reviews' } })
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <Header />

      <main className="mx-auto max-w-[600px] px-8 py-7">
        <div className="mb-8">
          <button
            onClick={handleCancel}
            className="text-sm font-semibold text-[#3B6FE8] hover:text-[#2D5CD4] mb-4"
          >
            ← Back to Reviews
          </button>
          <h1 className="font-display text-[32px] font-bold text-[#1A1D27]">
            {editingReview ? 'Edit Anonymous Review' : 'Write Anonymous Review'}
          </h1>
          <p className="mt-2 text-base text-[#6B7280]">
            {editingReview ? 'Update your internship experience review.' : 'Share your honest internship experience. Your identity is fully protected.'}
          </p>
        </div>

        <div className="rounded-2xl border border-[#E8EAF0] bg-white p-8 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#1A1D27]">
                Company Name *
              </label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="e.g., TechCorp Malaysia"
                className="w-full rounded-lg border border-[#E8EAF0] px-4 py-3 text-base outline-none transition focus:border-[#3B6FE8] focus:ring-2 focus:ring-[#3B6FE8]/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#1A1D27]">
                Your Role/Position *
              </label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleChange}
                placeholder="e.g., Software Engineering Intern"
                className="w-full rounded-lg border border-[#E8EAF0] px-4 py-3 text-base outline-none transition focus:border-[#3B6FE8] focus:ring-2 focus:ring-[#3B6FE8]/10"
              />
            </div>

            <div>
              <label className="mb-3 block text-sm font-semibold text-[#1A1D27]">
                Overall Rating *
              </label>
              <div className="flex gap-3">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                    className={`rounded-lg px-4 py-3 font-bold text-lg transition ${
                      formData.rating === star
                        ? 'bg-[#3B6FE8] text-white'
                        : 'bg-[#F7F8FA] text-[#6B7280] hover:bg-[#E8EAF0]'
                    }`}
                  >
                    ★ {star}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#1A1D27]">
                Your Experience *
              </label>
              <textarea
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                placeholder="Share your honest experience about the company, role, work environment, mentorship, work-life balance, etc."
                rows="8"
                className="w-full rounded-lg border border-[#E8EAF0] px-4 py-3 text-base outline-none transition focus:border-[#3B6FE8] focus:ring-2 focus:ring-[#3B6FE8]/10"
              />
            </div>

            <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700 flex gap-3">
              <span>🔒</span>
              <div>
                <p className="font-semibold">Your identity is fully protected</p>
                <p className="text-xs mt-1">Your review will be verified by AI before publishing to ensure authenticity and prevent spam.</p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-lg bg-[#3B6FE8] px-6 py-3 font-semibold text-white transition hover:bg-[#2D5CD4] disabled:opacity-50"
              >
                {loading ? (editingReview ? 'Updating...' : 'Submitting...') : (editingReview ? 'Update Review' : 'Submit Review')}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 rounded-lg border border-[#E8EAF0] px-6 py-3 font-semibold text-[#1A1D27] transition hover:bg-[#F7F8FA]"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

export default WriteReview
