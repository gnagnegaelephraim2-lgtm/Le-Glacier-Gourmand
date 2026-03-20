import { useState, useEffect, FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, MessageSquare, Star, Send, LogIn, User as UserIcon } from 'lucide-react';
import { auth } from '../firebase';
import { ReviewService } from '../services/ReviewService';
import { Review, ProductStats, MenuItem } from '../types';
import { getLocalizedText } from '../data';
import { useLanguage } from '../context/LanguageContext';
import StarRating from './StarRating';
import { onAuthStateChanged, User } from 'firebase/auth';
import AuthModal from './AuthModal';

interface ProductReviewSectionProps {
  product: MenuItem;
  onClose: () => void;
}

export default function ProductReviewSection({ product, onClose }: ProductReviewSectionProps) {
  const { language, t } = useLanguage();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ProductStats | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    const unsubscribeStats = ReviewService.subscribeToProductStats(product.id, (stats) => {
      setStats(stats);
    });

    const unsubscribeReviews = ReviewService.subscribeToProductReviews(product.id, (reviews) => {
      setReviews(reviews);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeStats();
      unsubscribeReviews();
    };
  }, [product.id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (newComment.trim().length < 3) {
      setError(t.reviews.commentTooShort);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await ReviewService.addReview(
        product.id,
        newRating,
        newComment,
        user.displayName || user.email?.split('@')[0] || t.auth.defaultName
      );
      setNewComment('');
      setNewRating(5);
    } catch (err) {
      setError(t.reviews.submitError);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-cream w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-forest text-white rounded-full hover:bg-gold transition-colors shadow-lg"
        >
          <X size={20} />
        </button>

        <div className="p-6 sm:p-8 border-b border-forest/10 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
          <img 
            src={product.image} 
            alt={getLocalizedText(product.title, language)}
            loading="lazy"
            decoding="async"
            className="w-32 h-32 sm:w-28 sm:h-28 rounded-2xl object-cover shadow-md flex-shrink-0"
            referrerPolicy="no-referrer"
          />
          <div className="flex-1 w-full flex flex-col items-center sm:items-start">
            <h3 className="text-2xl font-serif text-forest">{getLocalizedText(product.title, language)}</h3>
            <div className="flex items-center justify-center sm:justify-start gap-3 mt-2">
              <StarRating rating={stats?.averageRating || 0} size={14} />
              <span className="text-xs text-forest/60 font-medium">
                {stats ? `${stats.averageRating.toFixed(1)} (${stats.reviewCount} ${t.reviews.reviewCount})` : t.menu.noReviews}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          {/* Review Form */}
          <div className="bg-white/50 rounded-2xl p-6 border border-forest/5">
            {user ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-forest uppercase tracking-widest">{t.reviews.leaveReview}</span>
                  <StarRating 
                    rating={newRating} 
                    interactive 
                    onRatingChange={setNewRating} 
                    size={20} 
                  />
                </div>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={t.reviews.sharePlaceholder}
                  className="w-full bg-white border border-forest/10 rounded-xl p-4 text-sm focus:outline-none focus:border-gold transition-colors min-h-[100px] resize-none"
                />
                {error && <p className="text-red-500 text-xs">{error}</p>}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-forest text-cream rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-gold transition-all disabled:opacity-50"
                >
                  {isSubmitting ? t.reviews.sending : t.reviews.publish}
                  <Send size={14} />
                </button>
              </form>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-forest/60 mb-4">{t.reviews.loginPrompt}</p>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-6 py-3 bg-white border border-forest/10 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:border-gold transition-all mx-auto"
                >
                  <LogIn size={14} />
                  {t.reviews.loginBtn}
                </button>
              </div>
            )}
          </div>

          {/* Reviews List */}
          <div className="space-y-6">
            <h4 className="text-xs font-bold text-forest uppercase tracking-[0.2em] flex items-center gap-2">
              <MessageSquare size={14} />
              {t.reviews.recentReviews}
            </h4>
            
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <motion.div 
                    key={review.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white/30 rounded-2xl p-5 border border-forest/5"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold">
                          <UserIcon size={14} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-forest">{review.name}</p>
                          <p className="text-[10px] text-forest/40 uppercase tracking-widest">{review.date}</p>
                        </div>
                      </div>
                      <StarRating rating={review.rating} size={10} />
                    </div>
                    <p className="text-sm text-forest/70 leading-relaxed italic">
                      "{review.comment}"
                    </p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 opacity-40">
                <MessageSquare size={32} className="mx-auto mb-3" />
                <p className="text-sm">{t.reviews.firstReview}</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </motion.div>,
    document.body
  );
}
