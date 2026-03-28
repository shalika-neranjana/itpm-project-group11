function CompanyReview({ review, onDelete, onEdit }) {
  const descriptionPreview = (review.text || '').trim()
  const shortDescription =
    descriptionPreview.length > 80
      ? `${descriptionPreview.slice(0, 80).trim()}...`
      : descriptionPreview

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

  // Check if review can be deleted (within 7 days and written by current user)
  const canDeleteReview = () => {
    if (!review.createdAt || !review.authorId) return false
    
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
    const currentUserId = currentUser.id || currentUser.email || 'anonymous'
    
    // Check if user is the author
    if (review.authorId !== currentUserId) return false
    
    // Check if within 7 days
    const createdDate = new Date(review.createdAt)
    const now = new Date()
    const daysOld = (now - createdDate) / (1000 * 60 * 60 * 24)
    
    return daysOld <= 7
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      onDelete(review.id)
    }
  }

  const handleEdit = () => {
    if (onEdit) {
      onEdit(review)
    }
  }

  const canManage = canDeleteReview()

  return (
    <div className={`h-full rounded-2xl border p-4 shadow-[0_1px_4px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(15,20,25,0.08)] ${review.flagged ? 'border-orange-300 bg-orange-50' : 'border-[#E8EAF0] bg-white'}`}>
      <div>
        <h3 className="text-base font-semibold text-[#1A1D27]">{review.company}</h3>
        <p className="mt-0.5 text-sm text-[#6B7280]">{review.role}</p>
      </div>

      <div className="mt-2 flex items-center gap-2">
        {renderStars(review.rating)}
        <span className="text-sm font-semibold text-[#1A1D27]">{review.rating.toFixed(1)} / 5</span>
      </div>

      <p className="mt-2.5 text-sm text-[#6B7280] leading-relaxed">{shortDescription || 'No description provided.'}</p>

      {canManage && (
        <div className="mt-3 flex items-center justify-end border-t border-[#E8EAF0] pt-2.5 text-xs text-[#6B7280]">
          <div className="flex items-center gap-4">
            <button
              onClick={handleEdit}
              className="text-blue-600 hover:text-blue-700 font-semibold transition"
              title="Edit review (available for 7 days)"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700 font-semibold transition"
              title="Delete review (available for 7 days)"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CompanyReview

