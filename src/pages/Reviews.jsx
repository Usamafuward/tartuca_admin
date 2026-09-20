import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, ThumbsUp, Check, X } from 'lucide-react';
import { fetchReviews, approveReview } from '../services/api';

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
        date: new Date(review.created_at).toLocaleDateString(),
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark">Customer Reviews</h1>
          <p className="text-sm text-gray-500 mt-1">Moderate customer testimonials and public feedback</p>
        </div>
        {pendingCount > 0 && (
          <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-semibold">
            {pendingCount} Pending Moderation
          </span>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <input
          type="text"
          placeholder="Search by customer name or feedback..."
          className="w-full sm:w-80 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <div className="flex gap-2 w-full sm:w-auto">
          {['all', 'pending', 'approved'].map(tab => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-colors ${
                filterTab === tab
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab} {tab === 'pending' && pendingCount > 0 && `(${pendingCount})`}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-500">Loading reviews...</div>
      ) : filteredReviews.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100 text-gray-500">
          No reviews match your filters.
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredReviews.map((review) => (
            <div key={review.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 text-primary font-bold rounded-full flex items-center justify-center">
                    {review.user ? review.user.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <h3 className="font-bold text-dark">{review.user || 'Anonymous Customer'}</h3>
                    <p className="text-xs text-gray-500">{review.date}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "" : "text-gray-300"} />
                    ))}
                  </div>
                  <button 
                    onClick={() => handleToggleApproval(review.id, review.isApproved)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all shadow-sm ${
                      review.isApproved 
                        ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-200' 
                        : 'bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-200'
                    }`}
                  >
                    {review.isApproved ? <Check size={13} /> : <X size={13} />}
                    {review.isApproved ? 'Approved (Visible)' : 'Pending Approval (Hidden)'}
                  </button>
                </div>
              </div>
              
              <p className="text-gray-700 mb-4 text-sm leading-relaxed bg-gray-50/50 p-4 rounded-lg border border-gray-100">
                "{review.comment}"
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reviews;
