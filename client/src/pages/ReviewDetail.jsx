import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getReviewById } from '../api/reviews'
import { ChevronLeft } from 'lucide-react'
import ReviewComments from '../components/ReviewComments'

function ReviewDetail() {
  const { reviewId } = useParams()
  const navigate = useNavigate()
  const [review, setReview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchReview = async () => {
      try {
        setLoading(true)
        const reviewData = await getReviewById(reviewId)
        setReview(reviewData)
        setError('')
      } catch (err) {
        console.error('Failed to fetch review:', err)
        setError('Failed to load review')
      } finally {
        setLoading(false)
      }
    }

    if (reviewId) {
      fetchReview()
    }
  }, [reviewId])

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <span key={star} className={star <= rating ? 'text-yellow-400 text-lg' : 'text-gray-300 text-lg'}>
            ★
          </span>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F7F8FA] to-white lg:h-[calc(100vh-2rem)] lg:overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-700 cursor-pointer transition"
          >
            <ChevronLeft size={20} />
            Back
          </button>
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !review) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F7F8FA] to-white lg:h-[calc(100vh-2rem)] lg:overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-700 cursor-pointer transition"
          >
            <ChevronLeft size={20} />
            Back
          </button>
          <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
            <p className="text-red-700 font-semibold">{error || 'Review not found'}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F7F8FA] to-white">
      <div className="mx-auto max-w-7xl px-4 py-8 lg:h-[calc(100vh-2rem)] lg:overflow-hidden">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-700 cursor-pointer transition"
        >
          <ChevronLeft size={20} />
          Back
        </button>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:h-full lg:items-start">
          {/* Left Side - Full Review */}
          <div className="lg:col-span-2 lg:h-full lg:overflow-y-auto">
            <div className="rounded-2xl border border-[#E8EAF0] bg-white p-8 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
              {/* Header */}
              <div className="mb-6 border-b border-[#E8EAF0] pb-6">
                <h1 className="text-3xl font-bold text-[#1A1D27] mb-2">{review.company}</h1>
                <p className="text-lg text-[#6B7280] mb-4">Position: {review.role}</p>
                <p className="text-sm text-[#6B7280] mb-4">Published: {review.date}</p>
              </div>

              {/* Rating and Sentiment */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="rounded-lg bg-[#F7F8FA] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-2">Rating</p>
                  <div className="mb-2">
                    {renderStars(review.rating)}
                  </div>
                  <p className="text-lg font-bold text-[#1A1D27]">{review.rating.toFixed(1)} / 5</p>
                </div>
                <div className="rounded-lg bg-[#F7F8FA] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-2">Sentiment</p>
                  <p className="text-lg font-bold text-[#1A1D27]">
                    {review.rating <= 2 ? '😞 Negative' : review.rating >= 4 ? '😊 Positive' : '😐 Neutral'}
                  </p>
                </div>
              </div>

              {/* Full Review Text */}
              <div className="mb-6">
                <h2 className="text-lg font-bold text-[#1A1D27] mb-3">Review</h2>
                <p className="text-base leading-relaxed text-[#6B7280] whitespace-pre-wrap">
                  {review.text || review.description || 'No description provided.'}
                </p>
              </div>

              {/* Flag Status */}
              {review.flagged && (
                <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                  <p className="text-sm font-semibold text-orange-700">⚠️ This review has been flagged for moderation</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Comments */}
          <div className="lg:col-span-1 lg:h-full lg:sticky lg:top-8">
            <ReviewComments reviewId={review._id || review.id} reviewAuthorId={review.authorId} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReviewDetail
