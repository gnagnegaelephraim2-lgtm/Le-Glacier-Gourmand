import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, ShoppingCart, Instagram, Facebook, User as UserIcon, LogOut, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../data/translations';
import { useCart } from '../context/CartContext';
import Logo from './Logo';
import { auth, logout } from '../firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import AuthModal from './AuthModal';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [user, setUser] = useState<User | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  // Mauritius timezone UTC+4 (direct offset calculation — no browser timezone dependency)
  useEffect(() => {
    const checkOpen = () => {
      const now = new Date();
      // Add UTC+4 offset directly
      const muDate = new Date(now.getTime() + 4 * 60 * 60 * 1000);
      const day = muDate.getUTCDay(); // 0=Sun, 1=Mon ... 6=Sat
      const hours = muDate.getUTCHours() + muDate.getUTCMinutes() / 60;
      if (day >= 1 && day <= 4) setIsOpen(hours >= 8.5 && hours < 18);       // Mon–Thu
      else if (day === 5 || day === 6) setIsOpen(hours >= 8.5 && hours < 20); // Fri–Sat
      else setIsOpen(hours >= 8.5 && hours < 15);                             // Sun
    };
    checkOpen();
    const interval = setInterval(checkOpen, 60000);
    return () => clearInterval(interval);
  }, []);
  const { t, language, setLanguage } = useLanguage();
  const { totalItems, setIsCartOpen } = useCart();

  const LANGUAGES: { code: Language; label: string; flag: string }[] = [
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'cr', label: 'Kreol', flag: '🇲🇺' },
    { code: 'ar', label: 'العربية', flag: '🇸🇦' },
    { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
    { code: 'zh', label: '中文', flag: '🇨🇳' },
  ];

  const [isLangOpen, setIsLangOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      unsubscribe();
    };
  }, []);


  const openAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
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
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? 'bg-forest/95 backdrop-blur-md py-4 shadow-lg text-white' : 'bg-transparent py-6 text-white'
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-shrink-0"
        >
          <Logo className={`h-16 md:h-20 ${isScrolled ? 'text-forest' : 'text-white'}`} showText={false} />
        </motion.div>

        {/* Open/Closed badge */}
        <div className={`hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${isOpen ? 'bg-green-500/20 border-green-400/40 text-green-300' : 'bg-red-500/20 border-red-400/40 text-red-300'}`}>
          <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isOpen ? 'bg-green-400' : 'bg-red-400'}`} />
          {isOpen ? 'Ouvert' : 'Fermé'}
        </div>

        {/* Center: Links */}
        <div className="hidden md:flex items-center gap-4 lg:gap-6 xl:gap-8">
          {navLinks.map((link, i) => (
            <motion.a
              key={link.name}
              href={link.href}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="text-[9px] lg:text-[10px] xl:text-xs font-bold uppercase tracking-[0.1em] lg:tracking-[0.2em] hover:text-gold transition-colors whitespace-nowrap relative group"
            >
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gold transition-all duration-300 group-hover:w-full" />
            </motion.a>
          ))}
        </div>

        {/* Right Side Actions */}
        <div className="hidden md:flex items-center gap-6">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-6 h-6 rounded-full" />
                ) : (
                  <UserIcon size={14} />
                )}
                <span className="text-[10px] font-bold uppercase tracking-widest">{user.displayName?.split(' ')[0]}</span>
              </div>
              <button 
                onClick={logout}
                className="p-2 rounded-full bg-white/10 hover:bg-red-500/20 transition-colors text-white border border-white/20"
                title={t.nav.logout}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <button
                onClick={() => openAuth('login')}
                className="px-5 py-2.5 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-gold hover:text-forest transition-all"
              >
                {t.nav.login}
              </button>
            </div>
          )}
          {/* Language switcher */}
          <div className="relative">
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-gold hover:text-forest transition-all"
            >
              <span>{LANGUAGES.find(l => l.code === language)?.flag}</span>
              <span>{language.toUpperCase()}</span>
            </button>
            <AnimatePresence>
              {isLangOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute right-0 top-full mt-2 w-40 bg-cream rounded-2xl shadow-xl border border-forest/10 overflow-hidden z-50"
                >
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => { setLanguage(lang.code); setIsLangOpen(false); }}
                      className={`w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-forest hover:bg-gold/20 transition-colors ${language === lang.code ? 'bg-gold/10' : ''}`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.label}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCartOpen(true)}
           
            className="relative p-2 rounded-full bg-forest/20 backdrop-blur-md text-white border border-white/20 hover:bg-gold transition-colors"
          >
            <ShoppingCart size={20} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-gold rounded-full border-2 border-forest" />
            )}
          </motion.button>
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden flex items-center gap-2">
          {/* Language quick-pick (mobile top bar) */}
          <div className="relative">
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[10px] font-bold uppercase tracking-widest"
            >
              <span>{LANGUAGES.find(l => l.code === language)?.flag}</span>
              <span>{language.toUpperCase()}</span>
            </button>
            <AnimatePresence>
              {isLangOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute right-0 top-full mt-2 w-40 bg-cream rounded-2xl shadow-xl border border-forest/10 overflow-hidden z-[60]"
                >
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => { setLanguage(lang.code); setIsLangOpen(false); }}
                      className={`w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-forest hover:bg-gold/20 transition-colors ${language === lang.code ? 'bg-gold/10' : ''}`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.label}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button className="relative p-2" onClick={() => setIsCartOpen(true)}>
            <ShoppingCart size={24} />
            {totalItems > 0 && (
              <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-gold rounded-full border-2 border-white" />
            )}
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2"
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[99999] md:hidden bg-cream/98 backdrop-blur-xl flex flex-col pt-24"
          >
            <div className="flex flex-col p-8 gap-6 overflow-y-auto">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-2xl font-serif text-forest hover:text-gold transition-colors flex items-center justify-between group"
                >
                  <span>{link.name}</span>
                  <ChevronRight size={20} className="text-gold opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                </a>
              ))}
            </div>

            <div className="mt-auto p-8 border-t border-forest/10 space-y-8">
              <div className="flex flex-col gap-4">
                {user ? (
                  <div className="flex items-center justify-between bg-forest/5 p-4 rounded-2xl">
                    <div className="flex items-center gap-3">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt="" className="w-10 h-10 rounded-full border-2 border-gold/20" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold">
                          <UserIcon size={20} />
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-forest uppercase tracking-widest truncate max-w-[150px]">{user.displayName}</span>
                        <span className="text-[10px] text-forest/40 truncate max-w-[150px]">{user.email}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="p-3 text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                    >
                      <LogOut size={20} />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <button
                      onClick={() => {
                        openAuth('login');
                        setTimeout(() => setIsMobileMenuOpen(false), 200);
                      }}
                      className="w-full py-4 bg-forest text-cream rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-gold transition-all shadow-lg shadow-forest/20"
                    >
                      {t.nav.login}
                    </button>
                  </div>
                )}
              </div>

              {/* Language selector in mobile menu */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-forest/40 block mb-3">{t.nav.languageLabel}</span>
                <div className="grid grid-cols-3 gap-2">
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={`flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl border transition-all text-center ${
                        language === lang.code
                          ? 'border-gold bg-gold/10 text-forest'
                          : 'border-forest/10 bg-white text-forest/60 hover:border-gold/40 hover:bg-gold/5'
                      }`}
                    >
                      <span className="text-xl leading-none">{lang.flag}</span>
                      <span className="text-[9px] font-bold uppercase tracking-wider leading-none">{lang.code.toUpperCase()}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex gap-4">
                  <a
                    href="https://www.instagram.com/leglaciergourmand/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full border border-forest/10 flex items-center justify-center text-forest/60 hover:text-gold transition-colors"
                  >
                    <Instagram size={20} />
                  </a>
                  <a
                    href="https://www.facebook.com/p/Le-Glacier-Gourmand-61583599001010/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full border border-forest/10 flex items-center justify-center text-forest/60 hover:text-gold transition-colors"
                  >
                    <Facebook size={20} />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        initialMode={authMode}
      />
    </nav>
  );
}
