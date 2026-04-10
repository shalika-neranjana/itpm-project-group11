import { useState, useEffect } from 'react'
import {
  getReviewComments,
  createReviewComment,
  replyToComment,
  updateReviewComment,
  deleteReviewComment,
  updateReviewReply,
  deleteReviewReply,
  voteReviewComment,
  voteReviewReply,
} from '../api/reviews'
import { MessageCircle, Send, ThumbsUp, ThumbsDown } from 'lucide-react'

function ReviewComments({ reviewId, reviewAuthorId }) {
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [replyText, setReplyText] = useState({})
  const [openReplyBoxes, setOpenReplyBoxes] = useState({})
  const [sortBy, setSortBy] = useState('newest')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [editingComment, setEditingComment] = useState({ commentId: null, text: '' })
  const [editingReply, setEditingReply] = useState({ commentId: null, replyId: null, text: '' })

  const currentStudent = JSON.parse(localStorage.getItem('student') || 'null')
  const currentUserId = currentStudent?._id || currentStudent?.id

  const isCurrentUserAuthor = (authorId) => {
    if (!authorId || !currentUserId) return false
    const normalizedAuthorId = typeof authorId === 'object' ? authorId?._id : authorId
    return normalizedAuthorId?.toString() === currentUserId?.toString()
  }

  const isReviewAuthor = (authorId) => {
    if (!authorId || !reviewAuthorId) return false
    const normalizedAuthorId = typeof authorId === 'object' ? authorId?._id : authorId
    const normalizedReviewAuthorId = typeof reviewAuthorId === 'object' ? reviewAuthorId?._id : reviewAuthorId
    return normalizedAuthorId?.toString() === normalizedReviewAuthorId?.toString()
  }

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true)
        const fetchedComments = await getReviewComments(reviewId, sortBy)
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
  }, [reviewId, sortBy])

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
      alert('Failed to add comment. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReply = async (commentId) => {
    const text = replyText[commentId]?.trim()
    if (!text) return

    try {
      setSubmitting(true)
      const updatedComment = await replyToComment(reviewId, commentId, {
        text: text,
      })

      // Update the comment with the new reply
      setComments(comments.map(c => c._id === commentId ? updatedComment : c))
      setReplyText({ ...replyText, [commentId]: '' })
      setOpenReplyBoxes({ ...openReplyBoxes, [commentId]: false })
    } catch (error) {
      console.error('Failed to add reply:', error)
      alert('Failed to add reply. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleVoteComment = async (commentId, vote) => {
    try {
      const updatedComment = await voteReviewComment(reviewId, commentId, vote)
      setComments(comments.map(c => c._id === commentId ? updatedComment : c))
    } catch (error) {
      console.error('Failed to vote on comment:', error)
      alert('Failed to vote. Please try again.')
    }
  }

  const handleVoteReply = async (commentId, replyId, vote) => {
    try {
      const updatedComment = await voteReviewReply(reviewId, commentId, replyId, vote)
      setComments(comments.map(c => c._id === commentId ? updatedComment : c))
    } catch (error) {
      console.error('Failed to vote on reply:', error)
      alert('Failed to vote. Please try again.')
    }
  }

  const toggleReplyBox = (commentId) => {
    setOpenReplyBoxes({
      ...openReplyBoxes,
      [commentId]: !openReplyBoxes[commentId],
    })
  }

  const startEditComment = (comment) => {
    setEditingComment({ commentId: comment._id, text: comment.text || '' })
  }

  const cancelEditComment = () => {
    setEditingComment({ commentId: null, text: '' })
  }

  const handleUpdateComment = async (commentId) => {
    const text = editingComment.text.trim()
    if (!text) return

    try {
      setSubmitting(true)
      const updatedComment = await updateReviewComment(reviewId, commentId, { text })
      setComments((prev) => prev.map((comment) => (comment._id === commentId ? updatedComment : comment)))
      cancelEditComment()
    } catch (error) {
      console.error('Failed to update comment:', error)
      alert(error.message || 'Failed to update comment. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return

    try {
      setSubmitting(true)
      await deleteReviewComment(reviewId, commentId)
      setComments((prev) => prev.filter((comment) => comment._id !== commentId))
      if (editingComment.commentId === commentId) {
        cancelEditComment()
      }
    } catch (error) {
      console.error('Failed to delete comment:', error)
      alert(error.message || 'Failed to delete comment. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const startEditReply = (commentId, reply) => {
    setEditingReply({
      commentId,
      replyId: reply._id,
      text: reply.text || '',
    })
  }

  const cancelEditReply = () => {
    setEditingReply({ commentId: null, replyId: null, text: '' })
  }

  const handleUpdateReply = async (commentId, replyId) => {
    const text = editingReply.text.trim()
    if (!text) return

    try {
      setSubmitting(true)
      const updatedComment = await updateReviewReply(reviewId, commentId, replyId, { text })
      setComments((prev) => prev.map((comment) => (comment._id === commentId ? updatedComment : comment)))
      cancelEditReply()
    } catch (error) {
      console.error('Failed to update reply:', error)
      alert(error.message || 'Failed to update reply. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteReply = async (commentId, replyId) => {
    if (!window.confirm('Delete this reply?')) return

    try {
      setSubmitting(true)
      const updatedComment = await deleteReviewReply(reviewId, commentId, replyId)
      setComments((prev) => prev.map((comment) => (comment._id === commentId ? updatedComment : comment)))
      if (editingReply.commentId === commentId && editingReply.replyId === replyId) {
        cancelEditReply()
      }
    } catch (error) {
      console.error('Failed to delete reply:', error)
      alert(error.message || 'Failed to delete reply. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[#E8EAF0] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
      <div className="border-b border-[#E8EAF0] p-6">
        <h2 className="flex items-center gap-2 text-lg font-bold text-[#1A1D27]">
          <MessageCircle size={20} />
          Review Forum
        </h2>
        <p className="mt-1 text-xs text-[#6B7280]">{comments.length} {comments.length === 1 ? 'comment' : 'comments'}</p>
      </div>

      <div className="border-b border-[#E8EAF0] bg-[#F7F9FF] p-6">
        <form onSubmit={handleAddComment} className="space-y-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Start a new discussion point, question, or feedback..."
            rows="3"
            className="w-full resize-none rounded-lg border border-[#E8EAF0] bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={submitting}
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!newComment.trim() || submitting}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            >
              <Send size={16} />
              {submitting ? 'Posting...' : 'Post to Forum'}
            </button>
          </div>
        </form>
      </div>

      <div className="border-b border-[#E8EAF0] px-6 py-4">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full rounded-lg border border-[#E8EAF0] bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-auto sm:min-w-[220px]"
        >
          <option value="newest">Sort: Newest first</option>
          <option value="oldest">Sort: Oldest first</option>
          <option value="top">Sort: Top voted</option>
        </select>
      </div>

      <div className="max-h-[34rem] space-y-4 overflow-y-auto p-6">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => {
            const isEditingComment = editingComment.commentId === comment._id
            return (
              <div key={comment._id} className="rounded-lg border border-[#E8EAF0] bg-[#F7F8FA] p-4">
                {/* Comment Header */}
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-sm text-[#1A1D27]">
                      {comment.authorName || 'Anonymous Student'}
                      {isReviewAuthor(comment.authorId) && (
                        <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-blue-700">Review Author</span>
                      )}
                    </p>
                    <p className="text-xs text-[#6B7280]">{comment.date}</p>
                  </div>
                  {isCurrentUserAuthor(comment.authorId) && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEditComment(comment)}
                        className="text-xs font-semibold text-blue-700 hover:text-blue-800 cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        className="text-xs font-semibold text-red-700 hover:text-red-800 cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                {/* Comment Text */}
                {isEditingComment ? (
                  <div className="mb-3 space-y-2">
                    <textarea
                      value={editingComment.text}
                      onChange={(e) => setEditingComment((prev) => ({ ...prev, text: e.target.value }))}
                      rows="3"
                      className="w-full resize-none rounded-lg border border-[#E8EAF0] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={submitting}
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateComment(comment._id)}
                        disabled={!editingComment.text.trim() || submitting}
                        className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEditComment}
                        className="rounded-md border border-[#D1D5DB] bg-white px-3 py-1.5 text-xs font-semibold text-[#374151] transition hover:bg-[#F3F4F6] cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-[#6B7280] mb-3">{comment.text}</p>
                )}

                <div className="mb-3 flex items-center gap-3">
                  <button
                    onClick={() => handleVoteComment(comment._id, 'up')}
                    className="inline-flex items-center gap-1 text-xs text-green-700 hover:text-green-800 cursor-pointer"
                  >
                    <ThumbsUp size={14} />
                    {comment.upvotes || 0}
                  </button>
                  <button
                    onClick={() => handleVoteComment(comment._id, 'down')}
                    className="inline-flex items-center gap-1 text-xs text-red-700 hover:text-red-800 cursor-pointer"
                  >
                    <ThumbsDown size={14} />
                    {comment.downvotes || 0}
                  </button>
                  <button
                    onClick={() => toggleReplyBox(comment._id)}
                    className="text-xs font-semibold text-blue-700 hover:text-blue-800 cursor-pointer"
                  >
                    {openReplyBoxes[comment._id] ? 'Cancel' : 'Reply'}
                  </button>
                </div>

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-3 space-y-2 border-t border-[#E8EAF0] pt-3 pl-3">
                    {comment.replies.map((reply) => {
                      const isEditingReply = editingReply.commentId === comment._id && editingReply.replyId === reply._id
                      return (
                        <div key={reply._id} className="bg-blue-50 rounded p-3 border-l-2 border-blue-400">
                        <div className="flex items-start justify-between mb-1">
                          <p className="font-semibold text-xs text-blue-900">
                            {reply.authorName || 'Student'} <span className="text-blue-600 ml-1">↳</span>
                          </p>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-blue-600">{reply.date}</p>
                            {isCurrentUserAuthor(reply.authorId) && (
                              <>
                                <button
                                  onClick={() => startEditReply(comment._id, reply)}
                                  className="text-xs font-semibold text-blue-700 hover:text-blue-800 cursor-pointer"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteReply(comment._id, reply._id)}
                                  className="text-xs font-semibold text-red-700 hover:text-red-800 cursor-pointer"
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                        {isEditingReply ? (
                          <div className="space-y-2">
                            <textarea
                              value={editingReply.text}
                              onChange={(e) => setEditingReply((prev) => ({ ...prev, text: e.target.value }))}
                              rows="2"
                              className="w-full resize-none rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              disabled={submitting}
                            />
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleUpdateReply(comment._id, reply._id)}
                                disabled={!editingReply.text.trim() || submitting}
                                className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                              >
                                Save
                              </button>
                              <button
                                onClick={cancelEditReply}
                                className="rounded-md border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-900 transition hover:bg-blue-100 cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-blue-900">{reply.text}</p>
                        )}
                        <div className="mt-2 flex items-center gap-3">
                          <button
                            onClick={() => handleVoteReply(comment._id, reply._id, 'up')}
                            className="inline-flex items-center gap-1 text-xs text-green-700 hover:text-green-800 cursor-pointer"
                          >
                            <ThumbsUp size={13} />
                            {reply.upvotes || 0}
                          </button>
                          <button
                            onClick={() => handleVoteReply(comment._id, reply._id, 'down')}
                            className="inline-flex items-center gap-1 text-xs text-red-700 hover:text-red-800 cursor-pointer"
                          >
                            <ThumbsDown size={13} />
                            {reply.downvotes || 0}
                          </button>
                        </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Reply Form */}
                {openReplyBoxes[comment._id] && (
                  <div className="mt-3 border-t border-[#E8EAF0] pt-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Write your reply..."
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
            <p className="text-sm text-[#6B7280]">No discussion yet. Be the first to start a thread.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ReviewComments
