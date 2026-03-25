function CompanyReview({ review, onDelete, onEdit }) {
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

  return (
    <div className={`rounded-lg border p-6 ${review.flagged ? 'border-orange-300 bg-orange-50' : 'border-[#E8EAF0] bg-white'}`}>
      <div className="flex items-start justify-between mb-3">
        <div></div>
        <div className="flex items-center gap-2">
          {review.flagged && (
            <span className="inline-block rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
              🚨 Flag: Culture Issue
            </span>
          )}
          {review.verified && (
            <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
              ✓ Verified Intern
            </span>
          )}
        </div>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#1A1D27]">{review.company}</h3>
          <p className="text-sm text-[#6B7280]">{review.role} · {review.date}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3">
        {renderStars(review.rating)}
        <span className="text-sm font-semibold text-[#1A1D27]">{review.rating.toFixed(1)} / 5</span>
      </div>

      <p className="mt-4 text-[#6B7280] leading-relaxed">{review.text}</p>

      {review.tags && review.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {review.tags.map(tag => (
            <span
              key={tag}
              className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs text-[#6B7280]"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between text-xs text-[#6B7280] border-t border-[#E8EAF0] pt-3">
        <span>Posted anonymously · {review.date}</span>
        <div className="flex items-center gap-4">
          <span className={`font-semibold ${review.flagged ? 'text-orange-600' : 'text-[#6B7280]'}`}>
            {review.sentiment}
          </span>
          {canDeleteReview() && (
            <>
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
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default CompanyReview

