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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-dark">Customer Reviews</h1>

      <div className="grid gap-6">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600">
                  {review.user.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-dark">{review.user}</h3>
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
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                        review.isApproved 
                        ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                        : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                    }`}
                >
                    {review.isApproved ? <Check size={12} /> : <X size={12} />}
                    {review.isApproved ? 'Approved' : 'Pending Approval'}
                </button>
              </div>
            </div>
            
            <p className="text-gray-600 mb-4">{review.comment}</p>
            
            <div className="flex items-center gap-4 border-t border-gray-100 pt-4">
               <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors">
                 <MessageSquare size={16} />
                 Reply
               </button>
               <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors">
                 <ThumbsUp size={16} />
                 Helpful
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reviews;
