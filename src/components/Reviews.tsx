import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Star } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { TRANSLATIONS } from '../data/translations';
import { ReviewService } from '../services/ReviewService';
import { Review } from '../types';

export default function Reviews() {
  const { t } = useLanguage();
  const staticTestimonials = t.reviews.testimonials || TRANSLATIONS.fr.reviews.testimonials;
  const [firestoreReviews, setFirestoreReviews] = useState<Review[]>([]);

  useEffect(() => {
    const unsub = ReviewService.subscribeToAllReviews((reviews) => {
      setFirestoreReviews(reviews);
    });
    return () => unsub();
  }, []);

  const firestoreMapped = firestoreReviews.map(r => ({
    name: r.name,
    rating: r.rating,
    comment: r.comment,
    date: r.date || '',
  }));

  const testimonials = firestoreMapped.length > 0
    ? [...firestoreMapped, ...staticTestimonials]
    : staticTestimonials;

  return (
    <section id="reviews" className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-gold font-medium tracking-widest uppercase text-sm mb-4 block"
          >
            {t.reviews.tagline}
          </motion.span>
          <h2 className="text-4xl md:text-5xl mb-8">{t.reviews.title}</h2>
        </div>

        <div className="flex gap-4 sm:gap-8 animate-marquee">
          {[...testimonials, ...testimonials].map((review, i) => (
            <motion.div
              key={i}
              className="flex-shrink-0 w-[260px] sm:w-[350px] p-6 sm:p-8 bg-cream rounded-3xl border border-forest/5 shadow-lg"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(review.rating)].map((_, idx) => (
                  <Star key={idx} size={16} className="fill-gold text-gold" />
                ))}
              </div>
              <p className="text-forest/80 italic mb-6 leading-relaxed">
                "{review.comment}"
              </p>
              <div className="flex justify-between items-center">
                <span className="font-bold text-forest">{review.name}</span>
                <span className="text-xs text-forest/40 uppercase tracking-widest">{review.date}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: fit-content;
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
