import { useNavigate } from 'react-router-dom'
import { confirm as swalConfirm } from '../utils/swal'

function CompanyReview({ review, onDelete, onEdit }) {
  const navigate = useNavigate()
  const descriptionPreview = (review.text || '').trim()
  const shortDescription =
    descriptionPreview.length > 160
      ? `${descriptionPreview.slice(0, 160).trim()}...`
      : descriptionPreview

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <span key={star} className={star <= rating ? 'text-yellow-400 text-sm' : 'text-gray-300 text-sm'}>
            ★
          </span>
        ))}
      </div>
    )
  }

  // Check if review can be edited/deleted (written by current user)
  const canDeleteReview = () => {
    if (!review.authorId) return false
    
    const currentUser = JSON.parse(localStorage.getItem('student') || '{}')
    const currentUserId = currentUser._id || currentUser.id
    
    // Compare with database authorId (ObjectId or string)
    return review.authorId === currentUserId || review.authorId._id === currentUserId
  }

  const handleDelete = async (e) => {
    e.stopPropagation()
    const ok = await swalConfirm('Are you sure you want to delete this review? This action cannot be undone.')
    if (ok) {
      onDelete(review._id || review.id)
    }
  }

  const handleEdit = (e) => {
    e.stopPropagation()
    if (onEdit) {
      onEdit(review)
    }
  }

  const handleCardClick = () => {
    navigate(`/review/${review._id || review.id}`)
  }

  const canManage = canDeleteReview()

  return (
    <div 
      onClick={handleCardClick}
      className={`h-full rounded-2xl border p-6 flex flex-col min-h-[280px] shadow-[0_1px_4px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer ${review.flagged ? 'border-orange-300 bg-orange-50' : 'border-[#E8EAF0] bg-white'}`}>
      <div className="mb-5 border-b border-[#E8EAF0] pb-5">
        <h3 className="text-lg font-bold text-[#1A1D27]">{review.company}</h3>
        <p className="mt-1 text-sm text-[#6B7280]">{review.role}</p>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="rounded-lg bg-[#F7F8FA] p-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">Rating</p>
          <div className="mt-1 flex items-center gap-0.5">
            {renderStars(review.rating)}
          </div>
          <p className="mt-0.5 text-xs font-bold text-[#1A1D27]">{review.rating.toFixed(1)} / 5</p>
        </div>
        <div className="rounded-lg bg-[#F7F8FA] p-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">Sentiment</p>
          <p className="mt-1 text-xs font-bold text-[#1A1D27]">
            {review.rating <= 2 ? 'Negative' : review.rating >= 4 ? 'Positive' : 'Neutral'}
          </p>
        </div>
      </div>

      <div className="flex-grow">
        <p className="text-sm text-[#6B7280] leading-relaxed">{shortDescription || 'No description provided.'}</p>
      </div>

      {canManage && (
        <div className="mt-4 flex items-center justify-end gap-2 border-t border-[#E8EAF0] pt-3">
          <button
            onClick={handleEdit}
            className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-100 cursor-pointer"
            title="Edit review"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 cursor-pointer"
            title="Delete review"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  )
}

export default CompanyReview

