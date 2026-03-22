import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { img } from '../utils/image';

export default function Desserts() {
  const { t } = useLanguage();
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 100]);

  const signatureDesserts = [
    {
      title: t.desserts.items[0].title,
      price: 'Rs 280',
      image: 'https://i.ibb.co/DHXN6svQ/Banana-Split-Gourmand-202603182224.jpg',
      desc: t.desserts.items[0].desc
    },
    {
      title: t.desserts.items[1].title,
      price: 'Rs 320',
      image: 'https://i.ibb.co/BHCS2hHP/Warm-chocolate-cake-202603182228.jpg',
      desc: t.desserts.items[1].desc
    }
  ];

  return (
    <section id="desserts" ref={containerRef} className="py-24 bg-forest text-cream overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-gold font-medium tracking-widest uppercase text-sm mb-4 block"
            >
              {t.desserts.tagline}
            </motion.span>
            <h2 className="text-5xl md:text-6xl mb-8 leading-tight">
              <span className="block">{t.desserts.title}</span>
              <span className="italic font-light">{t.desserts.titleItalic}</span>
            </h2>
            <p className="text-cream/70 text-lg mb-12 max-w-md">
              {t.desserts.description}
            </p>

            <div className="space-y-12">
              {signatureDesserts.map((dessert, i) => (
                <motion.div
                  key={dessert.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.2 }}
                  data-cursor="🍽️"
                  className="flex gap-6 items-center group cursor-pointer"
                >
                  <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0">
                    <img src={img(dessert.image, 200)} alt={dessert.title} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-serif group-hover:text-gold transition-colors">{dessert.title}</h3>
                    <p className="text-cream/50 text-sm mb-1">{dessert.desc}</p>
                    <span className="text-gold font-bold">{dessert.price}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="hidden lg:grid relative grid-cols-2 gap-4 h-[600px]">
             <motion.div style={{ y: y1 }} className="space-y-4">
                <img src={img('https://i.ibb.co/Z1LN4KCD/Douceur-Macadamia-Coupe-202603181823.jpg', 700)} loading="lazy" decoding="async" className="rounded-3xl h-80 w-full object-cover" alt="Douceur Macadamia" />
                <img src={img('https://i.ibb.co/27jDZDxy/Gaufre-aux-fruits-202603181659.jpg', 700)} loading="lazy" decoding="async" className="rounded-3xl h-60 w-full object-cover" alt="Gaufre aux Fruits" />
             </motion.div>
             <motion.div style={{ y: y2 }} className="space-y-4 pt-20">
                <img src={img('https://i.ibb.co/fYmm9b3T/Generate-Chocolat-Icre-cream-202603181857.jpg', 700)} loading="lazy" decoding="async" className="rounded-3xl h-60 w-full object-cover" alt="Voyage en Terre Chocolat" />
                <img src={img('https://i.ibb.co/KxDPkfDf/Pitaya-Rose-Sauvage-202603181727.jpg', 700)} loading="lazy" decoding="async" className="rounded-3xl h-80 w-full object-cover" alt="Pitaya Rose Sauvage" />
             </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
