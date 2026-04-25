import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, ThumbsUp, ThumbsDown, MoreVertical, Edit, Trash2, Clock, Share2, Sparkles, User, ChevronDown, ChevronUp } from 'lucide-react';
import DiscussionModal from './DiscussionModal';
import { summarizeReview } from '../../api/reviews';

function ThreadCard({ review, onDelete, onEdit, onVote }) {
  const navigate = useNavigate();
  const [showComments, setShowComments] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    return name.substring(0, 1).toUpperCase();
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <StarIcon key={star} filled={star <= rating} />
        ))}
      </div>
    );
  };

  return (
    <div className="group relative overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-sm transition-all hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1">
      {/* Action Header */}
      <div className="flex items-center justify-between px-6 pt-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F8F9FB] text-xl font-black text-[#1A1D27] shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
            {getInitials(review.company)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-[#1A1D27]">{review.company}</h3>
              {review.rating >= 4.5 && (
                <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-600 border border-green-100">Top Rated</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#9CA3AF]">
              <span className="text-blue-600">{review.authorName || 'Anonymous Student'}</span>
              <span className="h-1 w-1 rounded-full bg-gray-300"></span>
              <span className="flex items-center gap-1"><Clock size={12} /> {review.date || 'Just now'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {canManage && (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="rounded-xl p-2 text-gray-400 hover:bg-gray-50 hover:text-[#1A1D27] transition-colors"
              >
                <MoreVertical size={20} />
              </button>
              {showDropdown && (
                <div className="absolute right-0 top-full z-20 mt-2 w-40 origin-top-right rounded-2xl border border-gray-100 bg-white p-1.5 shadow-2xl animate-in zoom-in-95 duration-200">
                  <button onClick={handleEdit} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-gray-700 hover:bg-gray-50">
                    <Edit size={16} className="text-blue-500" /> Edit Review
                  </button>
                  <button onClick={handleDelete} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-red-600 hover:bg-red-50">
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-4">
        <div className="mb-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xl font-black text-[#1A1D27] tracking-tight">{review.role}</h4>
            <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-1.5 border border-amber-100">
              {renderStars(review.rating)}
              <span className="text-xs font-black text-amber-700">{review.rating?.toFixed(1)}</span>
            </div>
          </div>
          {review.title && <p className="text-sm font-bold text-gray-500">{review.title}</p>}
        </div>

        <div className="relative">
          <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-[#4B5563] font-medium">
            {review.text || review.description}
          </p>
        </div>

        {/* AI Summary Section */}
        {(summary || isSummarizing || summaryError) && (
          <div className="mt-6 overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-indigo-50/50 to-purple-50/50 p-5 border border-indigo-100/50 relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sparkles size={40} className="text-indigo-600" />
            </div>
            <div className="flex items-center gap-2 mb-3">
              <div className="rounded-lg bg-white p-1.5 text-indigo-600 shadow-sm">
                <Sparkles size={14} />
              </div>
              <span className="text-xs font-black uppercase tracking-wider text-indigo-900">AI Intelligent Summary</span>
            </div>
            {isSummarizing ? (
              <div className="flex items-center gap-3">
                <div className="h-4 w-full animate-pulse rounded bg-indigo-100/50"></div>
              </div>
            ) : summaryError ? (
              <p className="text-sm font-bold text-red-500">{summaryError}</p>
            ) : (
              <p className="text-[14px] font-bold text-indigo-900 leading-relaxed italic">
                "{summary}"
              </p>
            )}
          </div>
        )}
      </div>

      {/* Interaction Footer */}
      <div className="mt-2 flex items-center justify-between bg-gray-50/30 px-6 py-5 border-t border-gray-50">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl shadow-sm border border-gray-100">
            <button
              onClick={() => onVote(review._id || review.id, 'up')}
              className={`group flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition-all ${
                review.helpfulBy?.includes(currentUserId) 
                  ? 'bg-green-100 text-green-700 shadow-inner' 
                  : 'text-gray-500 hover:bg-green-50 hover:text-green-600'
              }`}
            >
              <ThumbsUp size={16} className={`transition-transform ${review.helpfulBy?.includes(currentUserId) ? '' : 'group-hover:-translate-y-0.5'}`} />
              <span>Helpful ({review.helpful || 0})</span>
            </button>
            <div className="h-4 w-px bg-gray-100"></div>
            <button
              onClick={() => onVote(review._id || review.id, 'down')}
              className={`group flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition-all ${
                review.unhelpfulBy?.includes(currentUserId) 
                  ? 'bg-red-100 text-red-700 shadow-inner' 
                  : 'text-gray-500 hover:bg-red-50 hover:text-red-600'
              }`}
            >
              <ThumbsDown size={16} className={`transition-transform ${review.unhelpfulBy?.includes(currentUserId) ? '' : 'group-hover:translate-y-0.5'}`} />
              <span>Unhelpful {review.unhelpful > 0 ? `(${review.unhelpful})` : ''}</span>
            </button>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="group flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-500 transition-all hover:bg-white hover:shadow-sm hover:text-blue-600"
          >
            <MessageSquare size={16} />
            <span>Discussion {review.commentsCount > 0 ? `(${review.commentsCount})` : ''}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
           {!summary && (
             <button
                onClick={handleSummarize}
                disabled={isSummarizing}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors disabled:opacity-50"
                title="AI Summary"
            >
                <Sparkles size={18} className={isSummarizing ? "animate-spin" : ""} />
            </button>
           )}
           <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">
            <Share2 size={18} />
          </button>
        </div>
      </div>

      {/* Discussion Modal */}
      <DiscussionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        review={review}
      />
    </div>
  );
}

const StarIcon = ({ filled }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={`h-3.5 w-3.5 ${filled ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`}
  >
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

export default ThreadCard;
