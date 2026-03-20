import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';

export default function Story() {
  const { t } = useLanguage();

  return (
    <section id="story" className="py-24 px-6 max-w-7xl mx-auto">
      <div className="grid md:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          <div className="overflow-hidden rounded-2xl shadow-2xl">
            <img
              src="https://i.ibb.co/XZCnHpJB/K-D.jpg"
              alt="Artisan at work"
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              className="w-full h-auto block"
            />
          </div>
          <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-gold rounded-2xl -z-10" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span className="text-gold font-medium tracking-widest uppercase text-sm mb-4 block">
            {t.story.tagline}
          </span>
          <h2 className="text-4xl md:text-5xl mb-8 leading-tight">
            <span className="block">{t.story.title}</span>
            <span className="italic font-light text-gold">{t.story.titleItalic}</span>
          </h2>
          <p className="text-lg text-forest/80 mb-8 leading-relaxed">
            {t.story.description}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
