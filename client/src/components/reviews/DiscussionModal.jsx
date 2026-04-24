import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, MessageCircle, Info } from 'lucide-react';
import ReviewComments from '../ReviewComments';

const DiscussionModal = ({ isOpen, onClose, review }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#1A1D27]/80 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-50 px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <MessageCircle size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#1A1D27]">Review Discussion</h2>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Discussion Thread for {review.company}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-400 transition-all hover:bg-red-50 hover:text-red-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* Review Context (Mini) */}
        <div className="bg-gray-50/50 px-8 py-4 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-3">
             <div className="h-2 w-2 rounded-full bg-blue-500"></div>
             <span className="text-sm font-bold text-[#1A1D27]">{review.role}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
            <Info size={14} />
            <span>Posting as {JSON.parse(localStorage.getItem('student') || '{}').firstName || 'Student'}</span>
          </div>
        </div>

        {/* Comments Section (Scrollable) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
          <ReviewComments reviewId={review._id || review.id} reviewAuthorId={review.authorId} />
        </div>

        {/* Footer */}
        <div className="border-t border-gray-50 px-8 py-4 bg-white text-center">
           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Guidelines: Be Respectful • Stay Constructive • No Confidential Info</p>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default DiscussionModal;
