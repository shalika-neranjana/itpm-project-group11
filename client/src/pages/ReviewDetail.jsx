import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getReviewById, deleteReview } from '../api/reviews'
import { ChevronLeft } from 'lucide-react'
import ReviewComments from '../components/ReviewComments'

function ReviewDetail() {
  const { reviewId } = useParams()
  const navigate = useNavigate()
  const [review, setReview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reviewActionLoading, setReviewActionLoading] = useState(false)

  const currentStudent = JSON.parse(localStorage.getItem('student') || 'null')
  const currentUserId = currentStudent?._id || currentStudent?.id

  const normalizedAuthorId = typeof review?.authorId === 'object' ? review?.authorId?._id : review?.authorId
  const canManageReview = Boolean(currentUserId && normalizedAuthorId && currentUserId.toString() === normalizedAuthorId.toString())

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

  const handleEditReview = () => {
    navigate('/write-review', { state: { review } })
  }

  const handleDeleteReview = async () => {
    if (!review?._id && !review?.id) return
    if (!window.confirm('Delete this review? This action cannot be undone.')) return

    try {
      setReviewActionLoading(true)
      await deleteReview(review._id || review.id)
      navigate('/dashboard?tab=reviews')
    } catch (err) {
      console.error('Failed to delete review:', err)
      alert(err.message || 'Failed to delete review. Please try again.')
    } finally {
      setReviewActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="relative min-h-screen bg-[#e8edf6]">
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/authbackgound.jpg')" }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/35 via-white/25 to-[#d8e6f8]/35" />

        <div className="relative z-10">
          <div className="mx-auto max-w-5xl px-4 py-8">
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
      </div>
    )
  }

  if (error || !review) {
    return (
      <div className="relative min-h-screen bg-[#e8edf6]">
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/authbackgound.jpg')" }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/35 via-white/25 to-[#d8e6f8]/35" />

        <div className="relative z-10">
          <div className="mx-auto max-w-5xl px-4 py-8">
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
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-[#e8edf6]">
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/authbackgound.jpg')" }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/35 via-white/25 to-[#d8e6f8]/35" />

      <div className="relative z-10">
        <div className="mx-auto max-w-5xl px-4 py-8">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-700 cursor-pointer transition"
          >
            <ChevronLeft size={20} />
            Back
          </button>

          {/* Main Content */}
          <div className="space-y-6">
            {/* Centered Main Review */}
            <div className="mx-auto w-full max-w-4xl">
              <div className="rounded-2xl border border-[#E8EAF0] bg-white p-8 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                {/* Header */}
                <div className="mb-6 border-b border-[#E8EAF0] pb-6">
                  <h1 className="mb-2 text-3xl font-bold text-[#1A1D27]">{review.company}</h1>
                  <p className="mb-4 text-lg text-[#6B7280]">Position: {review.role}</p>
                  <p className="mb-4 text-sm text-[#6B7280]">Published: {review.date}</p>
                  {canManageReview && (
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={handleEditReview}
                        disabled={reviewActionLoading}
                        className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                      >
                        Edit Review
                      </button>
                      <button
                        onClick={handleDeleteReview}
                        disabled={reviewActionLoading}
                        className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                      >
                        {reviewActionLoading ? 'Deleting...' : 'Delete Review'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Rating and Sentiment */}
                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-lg bg-[#F7F8FA] p-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#6B7280]">Rating</p>
                    <div className="mb-2">
                      {renderStars(review.rating)}
                    </div>
                    <p className="text-lg font-bold text-[#1A1D27]">{review.rating.toFixed(1)} / 5</p>
                  </div>
                  <div className="rounded-lg bg-[#F7F8FA] p-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#6B7280]">Sentiment</p>
                    <p className="text-lg font-bold text-[#1A1D27]">
                      {review.rating <= 2 ? '😞 Negative' : review.rating >= 4 ? '😊 Positive' : '😐 Neutral'}
                    </p>
                  </div>
                </div>

                {/* Full Review Text */}
                <div className="mb-6">
                  <h2 className="mb-3 text-lg font-bold text-[#1A1D27]">Review</h2>
                  <p className="whitespace-pre-wrap text-base leading-relaxed text-[#6B7280]">
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

            {/* Forum Below Review */}
            <div className="mx-auto w-full max-w-4xl">
              <ReviewComments reviewId={review._id || review.id} reviewAuthorId={review.authorId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReviewDetail
