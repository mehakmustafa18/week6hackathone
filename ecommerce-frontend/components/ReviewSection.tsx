'use client';

import { useState, useEffect } from 'react';
import { SlidersHorizontal, ChevronDown, Star, CheckCircle2, MessageSquareReply } from 'lucide-react';
import styles from './ReviewSection.module.css';
import api from '@/utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

interface ReviewSectionProps {
  productId: string;
  initialReviews?: any[];
}

export default function ReviewSection({ productId, initialReviews = [] }: ReviewSectionProps) {
  const [activeTab, setActiveTab] = useState('Reviews');
  const [reviews, setReviews] = useState<any[]>(initialReviews);
  const [showForm, setShowForm] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [formData, setFormData] = useState({ rating: 0, comment: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  // Update local state if initialReviews change (e.g. after product fetch)
  useEffect(() => {
    if (initialReviews && initialReviews.length > 0) {
      setReviews(initialReviews);
    }
  }, [initialReviews]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return toast.error('Please login to write a review');
    if (formData.rating === 0) return toast.error('Please select a star rating');
    if (!formData.comment.trim()) return toast.error('Please write a comment');

    setIsSubmitting(true);
    try {
      const { data } = await api.post(`/products/${productId}/reviews`, formData);
      toast.success('Review submitted!');
      // Backend returns the updated product, we want the reviews
      setReviews(data.reviews);
      setFormData({ rating: 0, comment: '' });
      setShowForm(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async (reviewId: string) => {
    if (!replyText.trim()) return;
    setIsReplying(true);
    try {
      const { data } = await api.patch(`/products/${productId}/reviews/${reviewId}/reply`, {
        message: replyText
      });
      toast.success('Reply sent!');
      setReviews(data.reviews);
      setReplyingTo(null);
      setReplyText('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send reply');
    } finally {
      setIsReplying(false);
    }
  };

  const renderStars = (rating: number, interactive = false) => {
    const display = interactive ? (hoveredStar || formData.rating) : rating;
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={interactive ? 28 : 16}
        fill={i < display ? 'gold' : 'none'}
        color={i < display ? 'gold' : '#ccc'}
        style={interactive ? { cursor: 'pointer' } : {}}
        onMouseEnter={interactive ? () => setHoveredStar(i + 1) : undefined}
        onMouseLeave={interactive ? () => setHoveredStar(0) : undefined}
        onClick={interactive ? () => setFormData(p => ({ ...p, rating: i + 1 })) : undefined}
      />
    ));
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <section className="container">
      {/* Tab bar */}
      <div className={styles.tabs}>
        {['Product Details', 'Rating & Reviews', 'FAQs'].map((tab) => (
          <button
            key={tab}
            className={`${styles.tabBtn} ${activeTab === tab || (tab === 'Rating & Reviews' && activeTab === 'Reviews') ? styles.activeTab : ''}`}
            onClick={() => setActiveTab(tab === 'Rating & Reviews' ? 'Reviews' : tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {(activeTab === 'Reviews' || activeTab === 'Rating & Reviews') && (
        <>
          {/* Header row */}
          <div className={styles.header}>
            <div className={styles.titleRow}>
              <h3>All Reviews <span>({reviews.length})</span></h3>
              <div className={styles.actions}>
                <button className={styles.iconBtn}><SlidersHorizontal size={18} /></button>
                <button className={styles.sortBtn}>Latest <ChevronDown size={16} /></button>
                {!isAdmin && (
                   <button className="btn-black" onClick={() => setShowForm(v => !v)}>
                    {showForm ? 'Cancel' : 'Write a Review'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Write review form */}
          {showForm && !isAdmin && (
            <div className={styles.reviewForm}>
              <h4>Your Review</h4>
              <div className={styles.starPicker}>
                {renderStars(formData.rating, true)}
              </div>
              <form onSubmit={handleSubmitReview}>
                <textarea
                  className={styles.commentInput}
                  placeholder="Share your thoughts about this product..."
                  value={formData.comment}
                  onChange={e => setFormData(p => ({ ...p, comment: e.target.value }))}
                  rows={4}
                />
                <button type="submit" className="btn-black" disabled={isSubmitting} style={{ marginTop: '0.75rem' }}>
                  {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>
          )}

          {/* Review grid */}
          <div className={styles.reviewGrid}>
            {reviews.length === 0 ? (
              <p style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem', color: 'var(--dark-gray)' }}>
                No reviews yet. Be the first to share your experience!
              </p>
            ) : (
              reviews.map((r) => (
                <div key={r._id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <div className={styles.stars}>{renderStars(r.rating)}</div>
                  </div>
                  <div className={styles.nameRow}>
                    <h4>{r.userName || 'Anonymous'}</h4>
                    <CheckCircle2 size={15} color="#01AB31" fill="#01AB31" stroke="white" />
                  </div>
                  <p className={styles.text}>"{r.comment}"</p>
                  <p className={styles.date}>Posted on {formatDate(r.date)}</p>

                  {/* Admin Reply Display */}
                  {r.reply && (
                    <div className={styles.adminReply}>
                      <span className={styles.replyBadge}>Admin Response</span>
                      <p className={styles.adminText}>{r.reply.message}</p>
                      <p className={styles.date}>{formatDate(r.reply.date)}</p>
                    </div>
                  )}

                  {/* Admin Reply Action */}
                  {isAdmin && !r.reply && replyingTo !== r._id && (
                    <button className={styles.replyBtn} onClick={() => setReplyingTo(r._id)}>
                      Reply to Review
                    </button>
                  )}

                  {/* Admin Reply Form */}
                  {replyingTo === r._id && (
                    <div className={styles.replyFormTiny}>
                      <textarea 
                        className={styles.replyInputTiny}
                        placeholder="Write your response..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        rows={3}
                      />
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          className="btn-black" 
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                          onClick={() => handleReply(r._id)}
                          disabled={isReplying}
                        >
                          {isReplying ? 'Sending...' : 'Send Reply'}
                        </button>
                        <button 
                          className={styles.replyBtn} 
                          style={{ marginTop: 0 }}
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyText('');
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {reviews.length > 6 && (
            <div className={styles.loadMoreRow}>
              <button className={styles.loadMoreBtn}>Load More Reviews</button>
            </div>
          )}
        </>
      )}

      {activeTab === 'Product Details' && (
        <div style={{ padding: '2rem 0', color: 'var(--dark-gray)' }}>
          <p>Detailed product specifications and material info will appear here.</p>
        </div>
      )}

      {activeTab === 'FAQs' && (
        <div style={{ padding: '2rem 0', color: 'var(--dark-gray)' }}>
          <p>Frequently asked questions will appear here.</p>
        </div>
      )}
    </section>
  );
}
