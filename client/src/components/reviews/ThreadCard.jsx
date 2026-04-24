import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, ThumbsUp, ThumbsDown, MoreVertical, Edit, Trash2, Clock, Share2, Sparkles } from 'lucide-react';
import ReviewComments from '../ReviewComments';
import { summarizeReview } from '../../api/reviews';

function ThreadCard({ review, onDelete, onEdit, onVote }) {
  const navigate = useNavigate();
  const [showComments, setShowComments] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [summary, setSummary] = useState(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryError, setSummaryError] = useState('');

  // Parse student info
  const currentUser = JSON.parse(localStorage.getItem('student') || '{}');
  const currentUserId = currentUser._id || currentUser.id;

  const canManage = review.authorId === currentUserId || (review.authorId && review.authorId._id === currentUserId);

  const handleDelete = (e) => {
    e.stopPropagation();
    setShowDropdown(false);
    onDelete(review._id || review.id);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    setShowDropdown(false);
    onEdit(review);
  };

  const handleSummarize = async () => {
    if (summary) return;
    setIsSummarizing(true);
    setSummaryError('');
    try {
      const result = await summarizeReview(review._id || review.id);
      setSummary(result);
    } catch (error) {
      console.error("Failed to summarize review:", error);
      setSummaryError('Failed to generate summary.');
    } finally {
      setIsSummarizing(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'C';
    return name.substring(0, 2).toUpperCase();
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <span key={star} className={star <= rating ? 'text-yellow-400 text-sm' : 'text-gray-300 text-sm'}>
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="mb-6 rounded-xl border border-[#E8EAF0] bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between p-5 pb-3">
        <div className="flex items-center gap-3">
          {/* Company Logo/Initial */}
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-lg font-bold text-white shadow-sm">
            {getInitials(review.company)}
          </div>
          <div>
            <h3 className="font-bold text-[#1A1D27]">{review.company}</h3>
            <div className="flex items-center gap-2 text-xs text-[#6B7280]">
              <span className="font-medium text-[#3B6FE8]">{review.authorName || 'Anonymous Student'}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Clock size={12} /> {review.date || 'Recently'}</span>
            </div>
          </div>
        </div>

        {/* Actions Dropdown */}
        {canManage && (
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100"
            >
              <MoreVertical size={18} />
            </button>
            {showDropdown && (
              <div className="absolute right-0 top-full z-10 mt-1 w-32 rounded-lg border border-gray-100 bg-white shadow-lg">
                <button onClick={handleEdit} className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">
                  <Edit size={14} /> Edit
                </button>
                <button onClick={handleDelete} className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50">
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-5 py-2">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-lg font-bold text-[#1A1D27]">{review.role}</h4>
          <div className="flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1">
            {renderStars(review.rating)}
            <span className="text-xs font-bold text-blue-700">{review.rating?.toFixed(1)}</span>
          </div>
        </div>

        <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#4B5563]">
          {review.text || review.description}
        </p>

        {/* AI Summary Section */}
        {(summary || isSummarizing || summaryError) && (
          <div className="mt-4 rounded-lg bg-purple-50/50 p-3 border border-purple-100">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={14} className="text-purple-600" />
              <span className="text-xs font-bold text-purple-900">AI Summary</span>
            </div>
            {isSummarizing ? (
              <p className="text-sm text-purple-700 animate-pulse">Generating summary...</p>
            ) : summaryError ? (
              <p className="text-sm text-red-500">{summaryError}</p>
            ) : (
              <p className="text-sm text-purple-800 leading-relaxed italic">"{summary}"</p>
            )}
          </div>
        )}
      </div>

      {/* Footer / Interaction Bar */}
      <div className="mt-2 flex items-center justify-between border-t border-gray-50 px-5 py-3">
        <div className="flex gap-4">
          <button
            onClick={() => onVote(review._id || review.id, 'up')}
            className="group flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold text-gray-500 transition-colors hover:bg-green-50 hover:text-green-600"
          >
            <ThumbsUp size={16} className="transition-transform group-hover:-translate-y-0.5" />
            <span>Helpful {review.helpful > 0 && `(${review.helpful})`}</span>
          </button>
          <button
            onClick={() => onVote(review._id || review.id, 'down')}
            className="group flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <ThumbsDown size={16} className="transition-transform group-hover:translate-y-0.5" />
            {review.unhelpful > 0 && <span>({review.unhelpful})</span>}
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className={`group flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold transition-colors ${showComments ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600'}`}
          >
            <MessageSquare size={16} />
            <span>Discuss {review.commentsCount > 0 && `(${review.commentsCount})`}</span>
          </button>

          <button
            onClick={handleSummarize}
            disabled={isSummarizing}
            className="group flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold text-gray-500 transition-colors hover:bg-purple-50 hover:text-purple-600 disabled:opacity-50"
          >
            <Sparkles size={16} className={isSummarizing ? "animate-pulse text-purple-500" : ""} />
            <span>{isSummarizing ? 'Summarizing...' : 'AI Summary'}</span>
          </button>
        </div>

        <button className="flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold text-gray-500 transition-colors hover:bg-gray-100">
          <Share2 size={16} /> Share
        </button>
      </div>

      {/* Nested Comments Section */}
      {showComments && (
        <div className="border-t border-gray-100 bg-gray-50/50 p-4">
          <ReviewComments reviewId={review._id || review.id} reviewAuthorId={review.authorId} />
        </div>
      )}
    </div>
  );
}

export default ThreadCard;
