import { useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Phone, Mail, Instagram, Facebook, Send } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { db } from '../firebase';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import Logo from './Logo';

export default function Footer() {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Check if already subscribed
      const existing = await getDocs(
        query(collection(db, 'newsletter'), where('email', '==', email.toLowerCase()))
      );

      if (!existing.empty) {
        showToast('Vous êtes déjà inscrit(e) !', 'info', '💌');
        setEmail('');
        return;
      }

      await addDoc(collection(db, 'newsletter'), {
        email: email.toLowerCase(),
        subscribedAt: serverTimestamp(),
      });

      showToast('Inscription confirmée ! Merci 🎉', 'success', '💌');
      setEmail('');
    } catch (err) {
      console.error(err);
      showToast('Une erreur est survenue. Réessayez.', 'error', '❌');
    } finally {
      setIsSubmitting(false);
    }
  };

  const navLinks = [
    { name: t.nav.home, href: '#hero' },
    { name: t.nav.story, href: '#story' },
    { name: t.nav.menu, href: '#menu' },
    { name: t.nav.events, href: '#events' },
    { name: t.nav.experience, href: '#gallery' },
    { name: t.nav.reviews, href: '#reviews' },
    { name: t.nav.contact, href: '#location' },
  ];

  return (
    <footer id="location" className="bg-forest text-cream pt-12 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-20">
          {/* Brand & Socials */}
          <div className="space-y-8">
            <Logo className="h-20" showText={false} />
            <p className="text-cream/50 text-sm leading-relaxed max-w-xs font-light">
              {t.hero.description.split('.')[0]}.
            </p>
            <div className="flex gap-4">
              <a 
                href="https://www.instagram.com/leglaciergourmand/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center border border-cream/10 rounded-full hover:bg-gold hover:text-forest transition-all duration-500 group"
              >
                <Instagram size={18} className="group-hover:scale-110 transition-transform" />
              </a>
              <a 
                href="https://www.facebook.com/p/Le-Glacier-Gourmand-61583599001010/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center border border-cream/10 rounded-full hover:bg-gold hover:text-forest transition-all duration-500 group"
              >
                <Facebook size={18} className="group-hover:scale-110 transition-transform" />
              </a>
            </div>
          </div>

          {/* Navigation & Newsletter */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 sm:gap-8">
            <div>
              <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-6 sm:mb-8 text-gold/60">{t.footer.navigation}</h4>
              <ul className="grid grid-cols-2 sm:grid-cols-1 gap-4">
                {navLinks.map((link) => (
                  <li key={link.name}>
                    <a 
                      href={link.href} 
                      className="text-xs text-cream/40 hover:text-gold transition-colors flex items-center group uppercase tracking-widest"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-6 sm:mb-8 text-gold/60">{t.location.newsletter}</h4>
              <p className="text-xs text-cream/40 mb-6 leading-relaxed">
                {t.footer.newsletterDesc}
              </p>
              <form className="relative" onSubmit={handleNewsletter}>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="E-mail"
                  required
                  className="w-full bg-white/5 border-b border-cream/10 py-2 text-xs focus:outline-none focus:border-gold transition-colors placeholder:text-cream/20"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="absolute right-0 bottom-2 text-gold hover:text-cream transition-colors disabled:opacity-40"
                >
                  <Send size={14} />
                </button>
              </form>
            </div>
          </div>

          {/* Contact & Hours - The "Blended" part */}
          <div className="bg-white/[0.02] p-8 rounded-3xl border border-white/5">
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-8 text-gold/60">{t.footer.contactVisit}</h4>
            <ul className="space-y-6 mb-8">
              <li className="flex gap-4 items-start">
                <MapPin size={16} className="text-gold mt-0.5 shrink-0" />
                <a 
                  href="https://www.google.com/maps/dir/?api=1&destination=Mahogany+Shopping+Promenade+Beau+Plan+Mauritius"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-cream/60 leading-relaxed hover:text-gold transition-colors"
                >
                  Mahogany Shopping Promenade,<br />Beau Plan, Maurice
                  <p className="text-[9px] italic text-gold/40 mt-1">{t.footer.viewOnMaps}</p>
                </a>
              </li>
              <li className="flex gap-4 items-center">
                <Phone size={16} className="text-gold shrink-0" />
                <span className="text-xs text-cream/60">+230 59890767</span>
              </li>
              <li className="flex gap-4 items-center">
                <Mail size={16} className="text-gold shrink-0" />
                <span className="text-xs text-cream/60">bonjour@leglaciergourmand.mu</span>
              </li>
            </ul>
            
            <div className="pt-6 border-t border-white/5">
              <ul className="space-y-2 text-[10px] text-cream/40 uppercase tracking-widest">
                <li className="flex justify-between"><span>{t.footer.monThu}</span> <span className="text-cream/60">08:30 - 18:00</span></li>
                <li className="flex justify-between"><span>{t.footer.friSat}</span> <span className="text-cream/60">08:30 - 20:00</span></li>
                <li className="flex justify-between"><span>{t.footer.sunday}</span> <span className="text-cream/60">08:30 - 15:00</span></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-cream/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] uppercase tracking-[0.3em] text-cream/30">
          <p>{t.location.copyright}</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-gold transition-colors">{t.footer.legalMentions}</a>
            <a href="#" className="hover:text-gold transition-colors">{t.footer.privacy}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
