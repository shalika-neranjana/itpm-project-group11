import { useState, useEffect } from 'react'
import { getReviewComments, createReviewComment, replyToComment } from '../api/reviews'
import { error as swalError } from '../utils/swal'
import { MessageCircle, Send } from 'lucide-react'

function ReviewComments({ reviewId, reviewAuthorId }) {
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [replyText, setReplyText] = useState({})
  const [expandedReplies, setExpandedReplies] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [expandedCommentId, setExpandedCommentId] = useState(null)

  const currentStudent = JSON.parse(localStorage.getItem('student') || 'null')
  const currentUserId = currentStudent?._id || currentStudent?.id

  // Check if current user is the review author
  const isReviewAuthor = currentUserId === reviewAuthorId || currentUserId === reviewAuthorId?._id

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true)
        const fetchedComments = await getReviewComments(reviewId)
        setComments(fetchedComments)
      } catch (error) {
        console.error('Failed to fetch comments:', error)
      } finally {
        setLoading(false)
      }
    }

    if (reviewId) {
      fetchComments()
    }
  }, [reviewId])

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    try {
      setSubmitting(true)
      const comment = await createReviewComment(reviewId, {
        text: newComment,
      })
      setComments([comment, ...comments])
      setNewComment('')
    } catch (error) {
      console.error('Failed to add comment:', error)
      swalError('Failed to add comment. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReply = async (commentId) => {
    const text = replyText[commentId]?.trim()
    if (!text || !isReviewAuthor) return

    try {
      setSubmitting(true)
      const updatedComment = await replyToComment(reviewId, commentId, {
        text: text,
      })

      // Update the comment with the new reply
      setComments(comments.map(c => c._id === commentId ? updatedComment : c))
      setReplyText({ ...replyText, [commentId]: '' })
    } catch (error) {
      console.error('Failed to add reply:', error)
      swalError('Failed to add reply. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="rounded-2xl border border-[#E8EAF0] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04)] flex flex-col h-full">
      <div className="border-b border-[#E8EAF0] p-6">
        <h2 className="flex items-center gap-2 text-lg font-bold text-[#1A1D27]">
          <MessageCircle size={20} />
          Questions & Answers
        </h2>
        <p className="mt-1 text-xs text-[#6B7280]">{comments.length} {comments.length === 1 ? 'comment' : 'comments'}</p>
      </div>

      <div className="flex-1 overflow-y-auto max-h-[600px] p-6 space-y-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => {
            const canReply = isReviewAuthor && !comment.replies?.some(r => r.authorId === currentUserId)
            return (
              <div key={comment._id} className="rounded-lg border border-[#E8EAF0] bg-[#F7F8FA] p-4">
                {/* Comment Header */}
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-sm text-[#1A1D27]">
                      {comment.authorName || 'Anonymous Student'}
                    </p>
                    <p className="text-xs text-[#6B7280]">{comment.date}</p>
                  </div>
                </div>

                {/* Comment Text */}
                <p className="text-sm text-[#6B7280] mb-3">{comment.text}</p>

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-3 space-y-2 border-t border-[#E8EAF0] pt-3 pl-3">
                    {comment.replies.map((reply) => (
                      <div key={reply._id} className="bg-blue-50 rounded p-3 border-l-2 border-blue-400">
                        <div className="flex items-start justify-between mb-1">
                          <p className="font-semibold text-xs text-blue-900">
                            {reply.authorName || 'Author'} <span className="text-blue-600 ml-1">↳</span>
                          </p>
                          <p className="text-xs text-blue-600">{reply.date}</p>
                        </div>
                        <p className="text-sm text-blue-900">{reply.text}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Form - Only for Review Author */}
                {isReviewAuthor && (
                  <div className="mt-3 border-t border-[#E8EAF0] pt-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Write a reply..."
                        value={replyText[comment._id] || ''}
                        onChange={(e) => setReplyText({ ...replyText, [comment._id]: e.target.value })}
                        className="flex-1 rounded-lg border border-[#E8EAF0] bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={submitting}
                      />
                      <button
                        onClick={() => handleReply(comment._id)}
                        disabled={!replyText[comment._id]?.trim() || submitting}
                        className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <Send size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <MessageCircle size={32} className="text-[#D4E0FA] mb-2" />
            <p className="text-sm text-[#6B7280]">No questions yet. Be the first to ask!</p>
          </div>
        )}
      </div>

      {/* Add Comment Form */}
      <div className="border-t border-[#E8EAF0] p-6">
        <form onSubmit={handleAddComment} className="space-y-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Ask a question or share thoughts about this review..."
            rows="3"
            className="w-full rounded-lg border border-[#E8EAF0] bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            disabled={submitting}
          />
          <button
            type="submit"
            disabled={!newComment.trim() || submitting}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
          >
            <Send size={16} />
            {submitting ? 'Posting...' : 'Post Question/Comment'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ReviewComments
