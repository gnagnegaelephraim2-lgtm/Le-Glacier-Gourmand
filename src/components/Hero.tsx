import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, MapPin, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const BACKGROUND_IMAGES = [
  ...Array.from({ length: 17 }, (_, i) => `/hero${i + 1}.png`)
];

export default function Hero() {
  const { t } = useLanguage();
  const [currentImage, setCurrentImage] = useState(0);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isFirstImageLoaded, setIsFirstImageLoaded] = useState(false);

  useEffect(() => {
    // Preload the first image with a more robust method
    const img = new Image();
    img.referrerPolicy = "no-referrer";
    img.src = BACKGROUND_IMAGES[0];
    img.onload = () => {
      setIsFirstImageLoaded(true);
    };
    img.onerror = () => {
      // Fallback if the first image fails
      setIsFirstImageLoaded(true);
    };
  }, []);

  useEffect(() => {
    if (!isFirstImageLoaded) return;

    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % BACKGROUND_IMAGES.length);
    }, 10000);

    // Preload the next image
    const nextIndex = (currentImage + 1) % BACKGROUND_IMAGES.length;
    const nextImg = new Image();
    nextImg.referrerPolicy = "no-referrer";
    nextImg.src = BACKGROUND_IMAGES[nextIndex];

    return () => clearInterval(timer);
  }, [currentImage, isFirstImageLoaded]);

  return (
    <section id="hero" className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-black">
      {/* Background Image Slider */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-black">
        <AnimatePresence initial={false}>
          {isFirstImageLoaded && (
            <motion.img
              key={currentImage}
              src={BACKGROUND_IMAGES[currentImage]}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, ease: "linear" }}
              alt="Hero background"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover brightness-[0.75]"
            />
          )}
        </AnimatePresence>
        {/* Dark overlay to ensure text readability and hide loading artifacts */}
        <div className="absolute inset-0 bg-black/40 z-10" />
      </div>

      <div className="relative z-10 text-center px-6 max-w-5xl pt-20">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-white mb-8 leading-[0.9] font-serif text-balance"
        >
          <span className="block font-normal tracking-tight">{t.hero.title}</span>
          <motion.span 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="block italic font-light mt-2 sm:mt-4 text-gold/90"
          >
            {t.hero.titleItalic}
          </motion.span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-white/90 text-sm sm:text-base md:text-lg mb-10 max-w-2xl mx-auto font-light leading-relaxed tracking-wide text-balance px-4"
        >
          {t.hero.description}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 px-6"
        >
          <a
            href="#menu"
            className="w-full sm:w-auto px-10 py-5 bg-gold text-forest font-bold rounded-full transition-all hover:scale-105 shadow-xl text-center text-sm sm:text-base uppercase tracking-widest"
          >
            {t.hero.ctaMenu}
          </a>
          <a
            href="#location"
            onClick={(e) => {
              e.preventDefault();
              setIsMapOpen(true);
              document.getElementById('location')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full sm:w-auto px-10 py-5 bg-white/5 backdrop-blur-md border border-white/20 text-white font-bold rounded-full hover:bg-white/10 transition-all flex items-center justify-center gap-2 text-sm sm:text-base uppercase tracking-widest"
          >
            <MapPin size={18} className="shrink-0" />
            <span className="whitespace-nowrap">{t.hero.ctaVisit}</span>
          </a>
        </motion.div>
      </div>

      {/* Map Modal */}
      <AnimatePresence>
        {isMapOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-cream w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl relative"
            >
              <button 
                onClick={() => setIsMapOpen(false)}
                className="absolute top-4 right-4 z-10 p-2 bg-forest text-white rounded-full hover:bg-gold transition-colors shadow-lg"
              >
                <X size={24} />
              </button>
              
              <div className="p-8 md:p-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gold/20 rounded-xl text-gold">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-serif text-forest">{t.hero.interactiveMap}</h3>
                    <p className="text-forest/60 text-sm">Mahogany Shopping Promenade, Beau Plan</p>
                  </div>
                </div>

                <div className="aspect-video w-full bg-forest/5 rounded-2xl overflow-hidden border border-forest/10 relative group">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3745.343516641544!2d57.56846137604589!3d-20.09915698126343!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x217c5567373f769f%3A0x8898950f5859560f!2sMahogany%20Shopping%20Promenade!5e0!3m2!1sen!2smu!4v1710680000000!5m2!1sen!2smu"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="grayscale hover:grayscale-0 transition-all duration-700"
                  ></iframe>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="text-center sm:text-left">
                    <p className="text-forest font-medium">{t.hero.openingHours}</p>
                    <div className="text-forest/60 text-[10px] uppercase tracking-wider space-y-0.5 mt-1">
                      <p>{t.hero.monThuHours}</p>
                      <p>{t.hero.friSatHours}</p>
                      <p>{t.hero.sunHours}</p>
                    </div>
                  </div>
                  <a 
                    href="https://www.google.com/maps/dir/?api=1&destination=Mahogany+Shopping+Promenade+Beau+Plan+Mauritius" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-8 py-4 bg-forest text-white rounded-full font-bold hover:bg-gold transition-all shadow-md flex items-center gap-2"
                  >
                    {t.hero.openInMaps}
                    <ArrowRight size={18} />
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Elements - More Subtle */}
      <motion.div
        animate={{ 
          y: [0, -20, 0],
          rotate: [0, 5, 0]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[25%] left-[12%] hidden lg:block"
      >
        <div className="w-24 h-24 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center text-4xl shadow-2xl opacity-60 hover:opacity-100 transition-opacity">
          🍦
        </div>
      </motion.div>
      
      <motion.div
        animate={{ 
          y: [0, 20, 0],
          rotate: [0, -5, 0]
        }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[35%] right-[10%] hidden lg:block"
      >
        <div className="w-20 h-20 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center text-4xl shadow-2xl opacity-60 hover:opacity-100 transition-opacity">
          🍓
        </div>
      </motion.div>
    </section>
  );
}
