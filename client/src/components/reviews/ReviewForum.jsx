import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllReviews, deleteReview, markReviewHelpful, markReviewUnhelpful } from '../../api/reviews';
import { confirm as swalConfirm, error as swalError, toast as swalToast } from '../../utils/swal';
import { Search, Filter, MessageCircle, TrendingUp, Award, PenTool, Star, Briefcase } from 'lucide-react';
import ThreadCard from './ThreadCard';

const ReviewForum = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [sortBy, setSortBy] = useState('newest'); // newest, top

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const allReviews = await getAllReviews();
      setReviews(allReviews);
    } catch (error) {
      console.error('Failed to fetch reviews', error);
    } finally {
      setLoading(false);
    }
  };

  const companies = useMemo(() => {
    const unique = [...new Set(reviews.map(r => r.company).filter(Boolean))];
    return unique.sort();
  }, [reviews]);

  const topCompanies = useMemo(() => {
    const counts = {};
    reviews.forEach(r => {
      if (r.company) counts[r.company] = (counts[r.company] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    return reviews.filter(r => {
      if (search && !r.company?.toLowerCase().includes(search.toLowerCase()) && !r.role?.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      if (selectedCompanies.length > 0 && !selectedCompanies.includes(r.company)) {
        return false;
      }
      if (selectedRatings.length > 0 && !selectedRatings.includes(Math.floor(r.rating))) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt || 0) < new Date(a.createdAt || 0) ? 1 : -1;
      } else if (sortBy === 'top') {
        return (b.rating || 0) < (a.rating || 0) ? 1 : -1;
      }
      return 0;
    });
  }, [reviews, search, selectedCompanies, selectedRatings, sortBy]);

  const handleDelete = async (id) => {
    const ok = await swalConfirm('Are you sure you want to delete this review?');
    if (!ok) return;
    try {
      await deleteReview(id);
      setReviews(prev => prev.filter(r => (r._id || r.id) !== id));
      swalToast('Review deleted successfully');
    } catch (error) {
      console.error('Failed to delete', error);
      swalError('Failed to delete review');
    }
  };

  const handleEdit = (review) => {
    navigate('/write-review', { state: { review } });
  };

  const handleVote = async (id, voteType) => {
    try {
      if (voteType === 'up') {
        const updatedReview = await markReviewHelpful(id);
        setReviews(prev => prev.map(r => (r._id || r.id) === id ? updatedReview : r));
        swalToast('Marked as helpful');
      } else {
        const updatedReview = await markReviewUnhelpful(id);
        setReviews(prev => prev.map(r => (r._id || r.id) === id ? updatedReview : r));
        swalToast('Marked as unhelpful');
      }
    } catch (error) {
      console.error('Failed to vote', error);
    }
  };

  const toggleCompanyFilter = (company) => {
    setSelectedCompanies(prev =>
      prev.includes(company) ? prev.filter(c => c !== company) : [...prev, company]
    );
  };

  const toggleRatingFilter = (rating) => {
    setSelectedRatings(prev =>
      prev.includes(rating) ? prev.filter(r => r !== rating) : [...prev, rating]
    );
  };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <h2 className="font-display text-2xl font-bold text-[#1A1D27] flex items-center gap-2">
          <MessageCircle className="text-blue-600" />
          Community Reviews
        </h2>

        <div className="flex w-full sm:w-auto items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search companies, roles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
            />
          </div>

          <button
            onClick={() => navigate('/write-review')}
            className="flex shrink-0 items-center gap-2 rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-md transition-transform hover:scale-105 hover:bg-blue-700"
          >
            <PenTool size={16} />
            <span className="hidden sm:inline">Write Review</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN - Filters */}
        <div className="hidden lg:block lg:col-span-3 space-y-6">
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-900">
              <Filter size={16} className="text-gray-500" /> Filters
            </h3>

            <div className="mb-5">
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Rating</h4>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map(rating => (
                  <label key={rating} className="flex cursor-pointer items-center gap-2 text-sm text-gray-700 hover:text-blue-600">
                    <input
                      type="checkbox"
                      checked={selectedRatings.includes(rating)}
                      onChange={() => toggleRatingFilter(rating)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="flex items-center gap-1">
                      {rating} <Star size={12} className="fill-yellow-400 text-yellow-400" /> & up
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Companies</h4>
              <div className="max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {companies.map(company => (
                  <label key={company} className="flex cursor-pointer items-center gap-2 text-sm text-gray-700 hover:text-blue-600">
                    <input
                      type="checkbox"
                      checked={selectedCompanies.includes(company)}
                      onChange={() => toggleCompanyFilter(company)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="truncate">{company}</span>
                  </label>
                ))}
                {companies.length === 0 && <p className="text-xs text-gray-500">No companies found</p>}
              </div>
            </div>

            {(selectedCompanies.length > 0 || selectedRatings.length > 0) && (
              <button
                onClick={() => { setSelectedCompanies([]); setSelectedRatings([]); }}
                className="mt-4 w-full rounded-lg bg-gray-50 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100"
              >
                Clear Filters
              </button>
            )}
          </div>

          <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-5">
            <h3 className="mb-2 text-sm font-bold text-blue-900">Your Voice Matters</h3>
            <p className="text-xs text-blue-800 leading-relaxed">
              Sharing your internship experience helps junior students make informed career decisions. Your reviews can be completely anonymous.
            </p>
          </div>
        </div>

        {/* MIDDLE COLUMN - Feed */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-200 pb-2">
            <div className="flex gap-4">
              <button
                onClick={() => setSortBy('newest')}
                className={`text-sm font-semibold pb-2 border-b-2 transition-colors ${sortBy === 'newest' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                Latest
              </button>
              <button
                onClick={() => setSortBy('top')}
                className={`text-sm font-semibold pb-2 border-b-2 transition-colors ${sortBy === 'top' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                Top Rated
              </button>
            </div>
            <span className="text-xs font-medium text-gray-500">{filteredReviews.length} discussions</span>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredReviews.length > 0 ? (
            <div className="space-y-4">
              {filteredReviews.map(review => (
                <ThreadCard
                  key={review.id || review._id}
                  review={review}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                  onVote={handleVote}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-16 text-center">
              <Briefcase size={40} className="mb-4 text-gray-300" />
              <h3 className="mb-1 text-lg font-bold text-gray-900">No reviews found</h3>
              <p className="text-sm text-gray-500">Try adjusting your search or filters.</p>
              <button
                onClick={() => { setSearch(''); setSelectedCompanies([]); setSelectedRatings([]); }}
                className="mt-4 text-sm font-semibold text-blue-600 hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN - Context & Insights */}
        <div className="hidden lg:block lg:col-span-3 space-y-6">
          {/* Trending Box */}
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-900">
              <TrendingUp size={16} className="text-green-500" /> Trending Companies
            </h3>
            <div className="space-y-3">
              {topCompanies.map((tc, idx) => (
                <div key={tc.name} className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400 w-4">{idx + 1}.</span>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 truncate max-w-[120px]">{tc.name}</span>
                  </div>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
                    {tc.count}
                  </span>
                </div>
              ))}
              {topCompanies.length === 0 && <p className="text-xs text-gray-500">Not enough data</p>}
            </div>
          </div>

          {/* Guidelines Box */}
          <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-[#1A1D27] to-[#2D3342] p-5 text-white shadow-md">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold">
              <Award size={16} className="text-yellow-400" /> Writing Guidelines
            </h3>
            <ul className="space-y-2 text-xs text-gray-300">
              <li className="flex items-start gap-2">
                <span className="mt-1 block h-1 w-1 shrink-0 rounded-full bg-blue-400"></span>
                <span>Be respectful and professional in your critique.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 block h-1 w-1 shrink-0 rounded-full bg-blue-400"></span>
                <span>Focus on your day-to-day responsibilities and learning.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 block h-1 w-1 shrink-0 rounded-full bg-blue-400"></span>
                <span>Do not share confidential company information.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewForum;
