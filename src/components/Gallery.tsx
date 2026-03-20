import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { GALLERY_IMAGES } from '../data';
import { useLanguage } from '../context/LanguageContext';
import { GalleryImage } from '../types';

export default function Gallery() {
  const { t } = useLanguage();
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  return (
    <section id="gallery" className="py-24 bg-cream">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-gold font-medium tracking-widest uppercase text-sm mb-4 block"
          >
            {t.gallery.tagline}
          </motion.span>
          <h2 className="text-4xl md:text-5xl mb-8">{t.gallery.title}</h2>
        </div>

        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {GALLERY_IMAGES.map((img, i) => (
            <motion.div
              key={img.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative group overflow-hidden rounded-2xl break-inside-avoid cursor-pointer"
              onClick={() => setSelectedImage(img)}
            >
              <img
                src={img.url}
                alt={img.caption}
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-forest/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                <span className="text-cream font-serif italic text-xl">{img.caption}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-forest/95 backdrop-blur-sm"
            onClick={() => setSelectedImage(null)}
          >
            <motion.button
              className="absolute top-6 right-6 text-cream hover:text-gold transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <X size={32} />
            </motion.button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-5xl w-full flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage.url}
                alt={selectedImage.caption}
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                className="max-h-[80vh] w-auto rounded-2xl shadow-2xl"
              />
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-6 text-cream font-serif text-2xl italic text-center"
              >
                {selectedImage.caption}
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
