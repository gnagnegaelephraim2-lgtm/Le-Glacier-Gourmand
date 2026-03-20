import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, CheckCircle2, Calendar } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import EventBookingModal from './EventBookingModal';

export default function Events() {
  const { t } = useLanguage();
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  return (
    <section id="events" className="py-24 bg-cream overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-gold font-bold uppercase tracking-[0.3em] text-sm mb-4 block">
              {t.events.tagline}
            </span>
            <h2 className="text-5xl md:text-6xl font-serif text-forest mb-8 leading-tight">
              {t.events.title} <br />
              <span className="italic font-light text-gold">{t.events.titleItalic}</span>
            </h2>
            <p className="text-forest/70 text-lg mb-10 leading-relaxed max-w-xl">
              {t.events.description}
            </p>

            <div className="space-y-4 mb-12">
              {t.events.features.map((feature: string, index: number) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle2 className="text-gold w-6 h-6 shrink-0" />
                  <span className="text-forest font-medium">{feature}</span>
                </div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsBookingOpen(true)}
              className="px-10 py-5 bg-forest text-white rounded-full font-bold shadow-xl hover:bg-gold transition-all flex items-center gap-3"
            >
              <Calendar size={20} />
              {t.events.cta}
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl aspect-[4/5]">
              <img 
                src="https://i.ibb.co/0VmSrZ3c/Ice-cream-cart-202603182313.jpg" 
                alt="Ice Cream Cart" 
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              
              <div className="absolute bottom-8 left-8 right-8 p-6 rounded-2xl border border-white/30 bg-forest/40 backdrop-blur-[4px]">
                <div className="flex items-center gap-2 mb-2 drop-shadow-lg">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className="fill-[#E9C46A] text-[#E9C46A]" />
                  ))}
                </div>
                <p className="text-white italic font-light drop-shadow-md">
                  "{t.events.testimonial}"
                </p>
                <p className="text-[#E9C46A] font-extrabold mt-2 text-base uppercase tracking-widest drop-shadow-lg">{t.events.testimonialAuthor}</p>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-gold/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-forest/5 rounded-full blur-3xl" />
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {isBookingOpen && (
          <EventBookingModal onClose={() => setIsBookingOpen(false)} />
        )}
      </AnimatePresence>
    </section>
  );
}
