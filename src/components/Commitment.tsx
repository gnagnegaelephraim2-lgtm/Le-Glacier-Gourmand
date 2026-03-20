import { motion } from 'motion/react';
import { ShieldCheck, Leaf, Wheat, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Commitment() {
  const { t } = useLanguage();

  const badges = [
    { icon: <ShieldCheck size={32} />, label: t.commitment.badges.additivesFree },
    { icon: <Leaf size={32} />, label: t.commitment.badges.natural },
    { icon: <Wheat size={32} />, label: t.commitment.badges.glutenFree },
    { icon: <span className="text-2xl font-bold">حلال</span>, label: t.commitment.badges.halal },
  ];

  return (
    <section className="py-24 bg-forest text-cream">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <span className="text-gold font-medium tracking-widest uppercase text-sm mb-4 block">
            {t.commitment.tagline}
          </span>
          <h2 className="text-4xl md:text-5xl mb-6 font-serif text-cream">{t.commitment.title}</h2>
          <div className="w-24 h-1 bg-gold mx-auto mb-8" />
          <h3 className="text-2xl md:text-3xl italic text-cream/90 mb-8 font-light">
            {t.commitment.subtitle}
          </h3>
        </motion.div>

        <div className="space-y-8 text-lg text-cream/80 leading-relaxed max-w-3xl mx-auto mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {t.commitment.description1}
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            {t.commitment.description2}
          </motion.p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 text-left max-w-3xl mx-auto mb-20">
          {t.commitment.points.map((point: string, i: number) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex gap-4 items-start"
            >
              <CheckCircle2 className="text-gold flex-shrink-0 mt-1" size={20} />
              <p className="text-cream/90 font-medium">{point}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-center">
          {badges.map((badge, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center gap-4 group"
            >
              <div className="w-24 h-24 rounded-full border-2 border-gold/30 flex items-center justify-center text-gold bg-cream/5 group-hover:bg-gold group-hover:text-forest transition-all duration-500 shadow-xl shadow-black/20">
                <div className="transform group-hover:scale-110 transition-transform duration-500">
                  {badge.icon}
                </div>
              </div>
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold group-hover:text-cream transition-colors">
                {badge.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
