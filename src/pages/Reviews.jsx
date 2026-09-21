import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Check, X, Search } from 'lucide-react';
import { fetchReviews, approveReview } from '../services/api';
import { ReviewsSkeleton } from '../components/common/Skeleton';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const data = await fetchReviews();
      const mappedReviews = data.map(review => ({
        id: review.id,
        user: review.author_name,
        rating: review.rating,
        date: new Date(review.created_at).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
        comment: review.comment,
        isApproved: review.is_approved,
        sentiment: review.rating >= 4 ? 'positive' : review.rating === 3 ? 'neutral' : 'negative'
      }));
      setReviews(mappedReviews);
    } catch (error) {
      console.error('Failed to load reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleApproval = async (id, currentStatus) => {
    try {
      const updatedReview = await approveReview(id, !currentStatus);
      setReviews(reviews.map(r => 
        r.id === id ? { ...r, isApproved: updatedReview.is_approved } : r
      ));
    } catch (error) {
      console.error("Failed to update approval status");
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState('all');

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = (review.user && review.user.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (review.comment && review.comment.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTab = filterTab === 'all' ||
      (filterTab === 'pending' && !review.isApproved) ||
      (filterTab === 'approved' && review.isApproved);
    return matchesSearch && matchesTab;
  });

  const pendingCount = reviews.filter(r => !r.isApproved).length;
  const approvedCount = reviews.filter(r => r.isApproved).length;
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : '5.0';

  return (
    <div className="space-y-6 min-w-0 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight">Customer Reviews</h1>
          <p className="text-xs text-slate-400 mt-1">Moderate customer feedback and public reviews</p>
        </div>

        {/* Quick badges */}
        <div className="flex items-center gap-2">
          <div className="glass-card px-3.5 py-1.5 border border-white/5 flex items-center gap-2">
            <Star size={14} className="text-amber-400 fill-amber-400" />
            <span className="text-xs font-bold text-slate-200 tnum">{averageRating}</span>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Average Rating</span>
          </div>
          {pendingCount > 0 && (
            <div className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>{pendingCount} Pending Moderation</span>
            </div>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card p-4 sm:p-5 border border-white/5 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search reviews by customer name..."
            className="w-full pl-10 pr-4 py-2 bg-[#08090C] border border-white/10 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 text-xs transition-all"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Reviews', count: reviews.length },
            { id: 'pending', label: 'Pending', count: pendingCount },
            { id: 'approved', label: 'Approved', count: approvedCount },
          ].map(tab => {
            const isActive = filterTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                  isActive
                    ? 'bg-amber-500 text-obsidian-950 shadow-md shadow-amber-500/20'
                    : 'bg-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10 border border-white/5'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${
                  isActive ? 'bg-obsidian-950/20 text-obsidian-950 font-black' : 'bg-white/5 text-slate-400'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Reviews Stream */}
      {loading ? (
        <ReviewsSkeleton count={4} />
      ) : filteredReviews.length === 0 ? (
        <div className="glass-card border border-white/5 rounded-2xl text-center py-16 text-slate-400">
          <MessageSquare size={36} className="mx-auto text-slate-600 mb-3" />
          <p className="text-sm font-semibold text-slate-300">No reviews match your filters</p>
          <p className="text-xs text-slate-500 mt-1">Try changing your search terms or filter tab</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReviews.map((review) => (
            <div 
              key={review.id} 
              className="glass-card p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3 pb-3 border-b border-white/5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 text-amber-400 font-black text-sm flex items-center justify-center shadow-md shadow-amber-500/10">
                      {review.user ? review.user.charAt(0).toUpperCase() : 'C'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-100 text-sm truncate">{review.user || 'Customer'}</h3>
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider shrink-0">#{review.id}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{review.date}</p>
                    </div>
                  </div>

                  {/* Toggle Approval Button */}
                  <button 
                    onClick={() => handleToggleApproval(review.id, review.isApproved)}
                    className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                      review.isApproved 
                        ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20' 
                        : 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20'
                    }`}
                  >
                    {review.isApproved ? (
                      <>
                        <Check size={13} className="stroke-[3]" />
                        <span>Approved</span>
                      </>
                    ) : (
                      <>
                        <X size={13} />
                        <span>Approve</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Rating Stars Bar */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1 bg-[#08090C] px-2.5 py-1 rounded-lg border border-white/5">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={13} 
                        className={i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'} 
                      />
                    ))}
                    <span className="ml-1 text-xs font-bold text-amber-400 tnum">{review.rating}.0</span>
                  </div>
                </div>

                {/* Comment */}
                <div className="bg-[#08090C] p-4 rounded-xl border border-white/5">
                  <p className="text-slate-200 text-sm leading-relaxed italic">
                    "{review.comment}"
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reviews;
