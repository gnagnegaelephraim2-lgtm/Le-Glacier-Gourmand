import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-[99990] w-12 h-12 rounded-full bg-forest text-cream shadow-xl flex items-center justify-center text-xl border border-gold/20 hover:bg-gold hover:text-forest transition-colors"
          aria-label="Retour en haut"
        >
          🍦
        </motion.button>
      )}
    </AnimatePresence>
  );
}
