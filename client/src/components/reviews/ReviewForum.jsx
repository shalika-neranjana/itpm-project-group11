import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllReviews, deleteReview, markReviewHelpful, markReviewUnhelpful } from '../../api/reviews';
import { confirm as swalConfirm, error as swalError, toast as swalToast } from '../../utils/swal';
import { Search, Filter, MessageCircle, TrendingUp, Award, PenTool, Star, Briefcase, RefreshCw, ChevronRight, Sparkles, Info } from 'lucide-react';
import ThreadCard from './ThreadCard';
import useDebounce from '../../hooks/useDebounce';

const ReviewSkeleton = () => (
  <div className="animate-pulse rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
    <div className="flex items-center gap-4 mb-4">
      <div className="h-12 w-12 rounded-2xl bg-gray-100"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 w-1/4 rounded bg-gray-100"></div>
        <div className="h-3 w-1/3 rounded bg-gray-50"></div>
      </div>
    </div>
    <div className="space-y-3">
      <div className="h-4 w-3/4 rounded bg-gray-100"></div>
      <div className="h-4 w-1/2 rounded bg-gray-100"></div>
      <div className="h-20 w-full rounded-2xl bg-gray-50"></div>
    </div>
  </div>
);

const ReviewForum = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [sortBy, setSortBy] = useState('newest'); // newest, top

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    
    try {
      const allReviews = await getAllReviews();
      setReviews(allReviews);
    } catch (error) {
      console.error('Failed to fetch reviews', error);
      swalError('Could not load reviews. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
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
      if (debouncedSearch && 
          !r.company?.toLowerCase().includes(debouncedSearch.toLowerCase()) && 
          !r.role?.toLowerCase().includes(debouncedSearch.toLowerCase()) &&
          !r.title?.toLowerCase().includes(debouncedSearch.toLowerCase())) {
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
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      } else if (sortBy === 'top') {
        return (b.helpful || 0) - (a.helpful || 0);
      }
      return 0;
    });
  }, [reviews, debouncedSearch, selectedCompanies, selectedRatings, sortBy]);

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

  const SkeletonCard = () => (
    <div className="mb-6 animate-pulse rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-4 mb-4">
        <div className="h-12 w-12 rounded-xl bg-gray-100"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 w-1/4 rounded bg-gray-100"></div>
          <div className="h-3 w-1/3 rounded bg-gray-50"></div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-4 w-full rounded bg-gray-100"></div>
        <div className="h-4 w-full rounded bg-gray-100"></div>
        <div className="h-4 w-2/3 rounded bg-gray-100"></div>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight text-[#1A1D27] flex items-center gap-3">
            <div className="rounded-xl bg-blue-600 p-2 text-white shadow-blue-200 shadow-lg">
              <MessageCircle size={24} />
            </div>
            Review Forum
          </h2>
          <p className="text-[#6B7280] font-medium">Join the discussion and discover internship insights.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search companies, roles, topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-12 pr-4 text-sm font-medium transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none shadow-sm"
            />
          </div>

          <button
            onClick={() => navigate('/write-review')}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-[#1A1D27] px-6 py-3.5 text-sm font-bold text-white shadow-xl transition-all hover:bg-black hover:-translate-y-0.5 active:scale-95"
          >
            <PenTool size={18} />
            Write Review
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 h-[calc(100vh-140px)] overflow-hidden">
        {/* LEFT COLUMN - Advanced Filters */}
        <div className="hidden lg:block lg:col-span-3 h-full overflow-y-auto pr-4 custom-scrollbar space-y-6 pb-10">
          <div className="rounded-3xl border border-[#F3F4F6] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="flex items-center gap-2 text-base font-bold text-[#1A1D27]">
                <Filter size={18} className="text-blue-600" /> Filters
              </h3>
              {(selectedCompanies.length > 0 || selectedRatings.length > 0) && (
                <button
                  onClick={() => { setSelectedCompanies([]); setSelectedRatings([]); }}
                  className="text-xs font-bold text-red-500 hover:text-red-600"
                >
                  Reset
                </button>
              )}
            </div>

            <div className="space-y-8">
              <div>
                <h4 className="mb-3 text-xs font-black uppercase tracking-[0.1em] text-[#9CA3AF]">Rating Scale</h4>
                <div className="space-y-2.5">
                  {[5, 4, 3, 2, 1].map(rating => (
                    <label key={rating} className="flex cursor-pointer items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className="relative flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={selectedRatings.includes(rating)}
                            onChange={() => toggleRatingFilter(rating)}
                            className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-gray-200 transition-all checked:border-blue-600 checked:bg-blue-600 focus:outline-none"
                          />
                          <ChevronRight size={12} className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                        </div>
                        <div className="flex items-center gap-1 text-sm font-bold text-gray-700 group-hover:text-blue-600 transition-colors">
                          {rating} <Star size={14} className="fill-yellow-400 text-yellow-400" />
                          <span className="ml-1 text-gray-400 font-medium">& up</span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="mb-3 text-xs font-black uppercase tracking-[0.1em] text-[#9CA3AF]">Top Companies</h4>
                <div className="max-h-64 overflow-y-auto space-y-2.5 pr-2 custom-scrollbar">
                  {companies.map(company => (
                    <label key={company} className="flex cursor-pointer items-center justify-between group">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <input
                          type="checkbox"
                          checked={selectedCompanies.includes(company)}
                          onChange={() => toggleCompanyFilter(company)}
                          className="h-5 w-5 rounded-md border-2 border-gray-200 text-blue-600 focus:ring-blue-500 transition-all"
                        />
                        <span className="truncate text-sm font-bold text-gray-700 group-hover:text-blue-600 transition-colors">{company}</span>
                      </div>
                    </label>
                  ))}
                  {companies.length === 0 && <p className="text-xs text-gray-400 italic">No companies yet</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Community Stat */}
          <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white shadow-lg shadow-blue-200">
            <TrendingUp className="mb-4 opacity-50" size={32} />
            <h4 className="text-lg font-black leading-tight">Trusted by 2,000+ Students</h4>
            <p className="mt-2 text-sm font-medium text-blue-100/80">Real experiences from students at top tech companies worldwide.</p>
          </div>
        </div>

        {/* MIDDLE COLUMN - Activity Feed */}
        <div className="lg:col-span-6 h-full overflow-y-auto pr-2 custom-scrollbar pb-10">
          <div className="flex items-center justify-between bg-gray-50/50 p-2 rounded-2xl sticky top-0 z-10 backdrop-blur-md mb-6">
            <div className="flex p-1 bg-white rounded-xl shadow-sm border border-gray-100">
              <button
                onClick={() => setSortBy('newest')}
                className={`px-6 py-2 text-sm font-bold rounded-lg transition-all ${sortBy === 'newest' ? 'bg-[#1A1D27] text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}
              >
                Latest
              </button>
              <button
                onClick={() => setSortBy('top')}
                className={`px-6 py-2 text-sm font-bold rounded-lg transition-all ${sortBy === 'top' ? 'bg-[#1A1D27] text-white shadow-md border-blue-600' : 'text-gray-500 hover:text-gray-900 border-transparent'} border-2`}
              >
                Top Rated
              </button>
            </div>
            
            <button 
              onClick={() => fetchReviews(true)}
              disabled={refreshing}
              className="p-2 text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-50"
              title="Refresh Feed"
            >
              <RefreshCw size={20} className={refreshing ? "animate-spin" : ""} />
            </button>
          </div>

          <div className="space-y-6">
            {loading ? (
              [1, 2, 3].map(i => <ReviewSkeleton key={i} />)
            ) : filteredReviews.length > 0 ? (
              filteredReviews.map((review) => (
                <ThreadCard
                  key={review._id || review.id}
                  review={review}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                  onVote={handleVote}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center rounded-[3rem] border-2 border-dashed border-gray-100 bg-white">
                <div className="mb-6 rounded-full bg-gray-50 p-6 text-gray-300">
                  <MessageCircle size={48} />
                </div>
                <h3 className="text-xl font-black text-[#1A1D27] mb-2">No reviews found</h3>
                <p className="text-sm font-medium text-gray-400 max-w-[280px]">Try adjusting your search terms or filters.</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN - Insights & Guidelines */}
        <div className="hidden lg:block lg:col-span-3 h-full overflow-y-auto pl-4 custom-scrollbar space-y-6 pb-10">
          <div className="rounded-3xl border border-[#F3F4F6] bg-white p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-[#1A1D27]">
              <Sparkles size={18} className="text-amber-500" /> Hot Companies
            </h3>
            <div className="space-y-4">
              {companies.slice(0, 5).map((company, idx) => (
                <div key={company} className="flex items-center justify-between group cursor-pointer" onClick={() => { setSelectedCompanies([company]); }}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 text-xs font-black text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                      {idx + 1}
                    </div>
                    <span className="text-sm font-bold text-gray-600 group-hover:text-[#1A1D27] transition-colors">{company}</span>
                  </div>
                  <ChevronRight size={14} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                </div>
              ))}
              {companies.length === 0 && <p className="text-xs text-gray-400 font-medium">Data will appear as students post reviews.</p>}
            </div>
          </div>

          <div className="rounded-3xl border border-[#1A1D27] bg-[#1A1D27] p-6 text-white shadow-xl">
            <h3 className="mb-4 flex items-center gap-2 text-base font-black">
              <Award size={20} className="text-yellow-400" /> Community Rules
            </h3>
            <div className="space-y-4">
              {[
                { title: "Be Constructive", text: "Share honest feedback professionally.", color: "bg-blue-500" },
                { title: "No NDAs", text: "Avoid sharing proprietary company info.", color: "bg-indigo-500" },
                { title: "Stay Relevant", text: "Focus on learning and mentorship.", color: "bg-purple-500" }
              ].map((rule, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className={`h-2 w-2 rounded-full ${rule.color} mt-1.5 shrink-0`}></div>
                  <p className="text-xs font-medium text-gray-300 leading-relaxed">
                    <strong className="text-white block mb-0.5">{rule.title}</strong>
                    {rule.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewForum;
