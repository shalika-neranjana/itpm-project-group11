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
import { error as swalError } from '../utils/swal'
import { MessageCircle, Send, ThumbsUp, ThumbsDown, User, MoreHorizontal, CornerDownRight, Edit3, Trash2 } from 'lucide-react'

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
      swalError('Failed to add comment. Please try again.')
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

      setComments(comments.map(c => c._id === commentId ? updatedComment : c))
      setReplyText({ ...replyText, [commentId]: '' })
      setOpenReplyBoxes({ ...openReplyBoxes, [commentId]: false })
    } catch (error) {
      console.error('Failed to add reply:', error)
      swalError('Failed to add reply. Please try again.')
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
    }
  }

  const handleVoteReply = async (commentId, replyId, vote) => {
    try {
      const updatedComment = await voteReviewReply(reviewId, commentId, replyId, vote)
      setComments(comments.map(c => c._id === commentId ? updatedComment : c))
    } catch (error) {
      console.error('Failed to vote on reply:', error)
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
      swalError(error.message || 'Failed to update comment.')
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
    } catch (error) {
      console.error('Failed to delete comment:', error)
      swalError(error.message || 'Failed to delete comment.')
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
      swalError(error.message || 'Failed to update reply.')
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
    } catch (error) {
      console.error('Failed to delete reply:', error)
      swalError(error.message || 'Failed to delete reply.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-6 space-y-8 max-w-4xl mx-auto">
      {/* Discussion Stats & Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <MessageCircle size={20} />
            </div>
            <div>
                <h3 className="text-sm font-black text-[#1A1D27]">Community Thread</h3>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{comments.length} participants</p>
            </div>
        </div>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-600 outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="newest">Latest Discussions</option>
          <option value="top">Most Helpful</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      {/* Post Box */}
      <div className="relative group">
        <form onSubmit={handleAddComment} className="relative z-10 rounded-[2rem] border border-gray-100 bg-white p-4 shadow-sm transition-all focus-within:shadow-xl focus-within:shadow-blue-500/5 focus-within:border-blue-200">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="What are your thoughts on this internship?"
            rows="3"
            className="w-full resize-none bg-transparent px-4 py-2 text-sm font-medium text-gray-700 outline-none placeholder:text-gray-400"
            disabled={submitting}
          />
          <div className="mt-2 flex items-center justify-between border-t border-gray-50 pt-3">
             <div className="flex items-center gap-2 px-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Be professional</span>
             </div>
             <button
                type="submit"
                disabled={!newComment.trim() || submitting}
                className="flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-2.5 text-xs font-black text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50"
              >
                <Send size={14} />
                Post Message
              </button>
          </div>
        </form>
      </div>

      {/* Comments List */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading thread...</p>
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => {
            const isEditingComment = editingComment.commentId === comment._id
            return (
              <div key={comment._id} className="group/card animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm transition-all group-hover/card:shadow-md">
                  {/* Comment Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-400">
                        <User size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-black text-[#1A1D27]">
                            {comment.authorName || 'Anonymous Student'}
                          </p>
                          {isReviewAuthor(comment.authorId) && (
                            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[9px] font-black uppercase text-blue-600 border border-blue-100">Review Author</span>
                          )}
                        </div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{comment.date}</p>
                      </div>
                    </div>
                    {isCurrentUserAuthor(comment.authorId) && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEditComment(comment)}
                          className="rounded-lg p-2 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Comment Text */}
                  {isEditingComment ? (
                    <div className="mb-4 space-y-3">
                      <textarea
                        value={editingComment.text}
                        onChange={(e) => setEditingComment((prev) => ({ ...prev, text: e.target.value }))}
                        rows="3"
                        className="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium outline-none focus:border-blue-500"
                        disabled={submitting}
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateComment(comment._id)}
                          disabled={!editingComment.text.trim() || submitting}
                          className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-blue-100 transition-all hover:bg-blue-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEditComment}
                          className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-600 transition-all hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[15px] font-medium leading-relaxed text-gray-600 mb-6">{comment.text}</p>
                  )}

                  {/* Footer Stats & Actions */}
                  <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                    <div className="flex items-center gap-1.5 bg-gray-50/50 p-1 rounded-xl">
                      <button
                        onClick={() => handleVoteComment(comment._id, 'up')}
                        className="group flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-black text-gray-500 transition-all hover:bg-white hover:text-green-600 hover:shadow-sm"
                      >
                        <ThumbsUp size={14} className="group-hover:-translate-y-0.5 transition-transform" />
                        <span>{comment.upvotes || 0}</span>
                      </button>
                      <div className="h-3 w-px bg-gray-200"></div>
                      <button
                        onClick={() => handleVoteComment(comment._id, 'down')}
                        className="group flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-black text-gray-500 transition-all hover:bg-white hover:text-red-600 hover:shadow-sm"
                      >
                        <ThumbsDown size={14} className="group-hover:translate-y-0.5 transition-transform" />
                        <span>{comment.downvotes || 0}</span>
                      </button>
                    </div>

                    <button
                      onClick={() => toggleReplyBox(comment._id)}
                      className="flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2.5 text-xs font-black text-blue-600 hover:bg-blue-100 transition-colors"
                    >
                      <CornerDownRight size={14} />
                      {openReplyBoxes[comment._id] ? 'Cancel' : 'Reply'}
                    </button>
                  </div>

                  {/* Replies Thread */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-6 space-y-4 border-l-2 border-gray-50 ml-4 pl-6">
                      {comment.replies.map((reply) => {
                        const isEditingReply = editingReply.commentId === comment._id && editingReply.replyId === reply._id
                        return (
                          <div key={reply._id} className="relative group/reply animate-in slide-in-from-left-4 duration-500">
                             <div className="rounded-2xl bg-blue-50/30 p-4 border border-blue-50/50">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                     <div className="h-6 w-6 rounded-lg bg-blue-100 flex items-center justify-center text-[10px] font-black text-blue-600">
                                        {reply.authorName?.[0] || 'S'}
                                     </div>
                                     <div>
                                        <p className="text-xs font-black text-blue-900">{reply.authorName || 'Student'}</p>
                                        <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">{reply.date}</p>
                                     </div>
                                  </div>
                                  
                                  {isCurrentUserAuthor(reply.authorId) && (
                                    <div className="flex items-center gap-0.5">
                                      <button onClick={() => startEditReply(comment._id, reply)} className="p-1.5 text-blue-400 hover:text-blue-700 transition-colors">
                                        <Edit3 size={14} />
                                      </button>
                                      <button onClick={() => handleDeleteReply(comment._id, reply._id)} className="p-1.5 text-red-300 hover:text-red-600 transition-colors">
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  )}
                                </div>

                                {isEditingReply ? (
                                  <div className="space-y-2">
                                    <textarea
                                      value={editingReply.text}
                                      onChange={(e) => setEditingReply((prev) => ({ ...prev, text: e.target.value }))}
                                      rows="2"
                                      className="w-full resize-none rounded-xl border border-blue-100 bg-white px-3 py-2 text-sm font-medium text-blue-900 outline-none focus:border-blue-500"
                                      disabled={submitting}
                                    />
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => handleUpdateReply(comment._id, reply._id)}
                                        disabled={!editingReply.text.trim() || submitting}
                                        className="rounded-lg bg-blue-600 px-3 py-1.5 text-[10px] font-black text-white shadow-lg shadow-blue-100"
                                      >
                                        Save
                                      </button>
                                      <button
                                        onClick={cancelEditReply}
                                        className="rounded-lg border border-blue-100 bg-white px-3 py-1.5 text-[10px] font-black text-blue-900"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-sm font-medium text-blue-900/80 leading-relaxed mb-3">{reply.text}</p>
                                )}

                                <div className="flex items-center gap-3">
                                  <button onClick={() => handleVoteReply(comment._id, reply._id, 'up')} className="flex items-center gap-1 text-[11px] font-black text-blue-400 hover:text-green-600 transition-colors">
                                    <ThumbsUp size={12} /> {reply.upvotes || 0}
                                  </button>
                                  <button onClick={() => handleVoteReply(comment._id, reply._id, 'down')} className="flex items-center gap-1 text-[11px] font-black text-blue-400 hover:text-red-600 transition-colors">
                                    <ThumbsDown size={12} /> {reply.downvotes || 0}
                                  </button>
                                </div>
                             </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Reply Form */}
                  {openReplyBoxes[comment._id] && (
                    <div className="mt-6 border-t border-gray-50 pt-6 animate-in zoom-in-95 duration-300">
                      <div className="flex gap-3">
                        <div className="flex-1 relative group/replybox">
                          <input
                            type="text"
                            placeholder="Write a thoughtful reply..."
                            value={replyText[comment._id] || ''}
                            onChange={(e) => setReplyText({ ...replyText, [comment._id]: e.target.value })}
                            className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 outline-none focus:bg-white focus:border-blue-500 transition-all"
                            disabled={submitting}
                          />
                        </div>
                        <button
                          onClick={() => handleReply(comment._id)}
                          disabled={!replyText[comment._id]?.trim() || submitting}
                          className="rounded-2xl bg-[#1A1D27] px-4 py-3 text-white shadow-xl transition-all hover:bg-black active:scale-95 disabled:opacity-50"
                        >
                          <Send size={18} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center rounded-[3rem] border-2 border-dashed border-gray-100 bg-white">
            <div className="mb-6 rounded-full bg-blue-50 p-6 text-blue-200">
                <MessageCircle size={48} />
            </div>
            <h3 className="text-xl font-black text-[#1A1D27] mb-2">No discussions yet</h3>
            <p className="text-sm font-medium text-gray-400 max-w-[200px]">Be the first to share your thoughts on this review.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ReviewComments
