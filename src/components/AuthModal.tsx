import { useState, FormEvent, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Mail, Lock, User as UserIcon, LogIn, UserPlus, AlertCircle, Chrome
} from 'lucide-react';
import {
  auth,
  signInWithGoogle,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from '../firebase';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        if (!displayName.trim()) {
          throw new Error(t.auth.nameRequired);
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      let message = t.auth.genericError;
      if (err.code === 'auth/email-already-in-use') message = t.auth.emailInUse;
      if (err.code === 'auth/invalid-email') message = t.auth.invalidEmail;
      if (err.code === 'auth/weak-password') message = t.auth.weakPassword;
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') message = t.auth.wrongCredentials;
      if (err.message && !err.code) message = err.message;
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignIn = async (providerName: string, signInFunc: () => Promise<any>) => {
    setError(null);
    try {
      await signInFunc();
      showToast(`Connecté via ${providerName} !`, 'success', '🎉');
      onClose();
    } catch (err: any) {
      console.error(err);
      let message = `${t.auth.socialError} ${providerName}.`;
      if (err.code === 'auth/popup-closed-by-user') message = t.auth.popupClosed;
      if (err.code === 'auth/unauthorized-domain') message = t.auth.unauthorizedDomain;
      if (err.code === 'auth/operation-not-allowed') message = `${providerName} n'est pas encore activé. Configurez-le dans Firebase Console.`;
      if (err.code === 'auth/account-exists-with-different-credential') message = 'Un compte existe déjà avec cet email. Essayez une autre méthode.';
      setError(message);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-cream w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-forest text-white rounded-full hover:bg-gold transition-colors shadow-lg"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-serif text-forest mb-2">
              {mode === 'login' ? t.auth.welcomeBack : t.auth.welcome}
            </h3>
            <p className="text-sm text-forest/60">
              {mode === 'login' ? t.auth.loginSubtitle : t.auth.signupSubtitle}
            </p>
          </div>

          <div className="flex bg-forest/5 rounded-xl p-1 mb-8">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${
                mode === 'login' ? 'bg-white text-forest shadow-sm' : 'text-forest/40 hover:text-forest'
              }`}
            >
              {t.auth.login}
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${
                mode === 'signup' ? 'bg-white text-forest shadow-sm' : 'text-forest/40 hover:text-forest'
              }`}
            >
              {t.auth.signup}
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={mode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {mode === 'signup' && (
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-forest/40" size={18} />
                  <input
                    type="text"
                    placeholder={t.auth.namePlaceholder}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-white border border-forest/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-gold transition-colors"
                    required
                  />
                </div>
              )}
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-forest/40" size={18} />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-forest/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-gold transition-colors"
                  required
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-forest/40" size={18} />
                <input
                  type="password"
                  placeholder={t.auth.passwordPlaceholder}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-forest/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-gold transition-colors"
                  required
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-500 text-xs bg-red-50 p-3 rounded-lg border border-red-100">
                  <AlertCircle size={14} />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-forest text-cream rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-gold transition-all disabled:opacity-50 shadow-lg"
              >
                {isLoading ? t.auth.loading : mode === 'login' ? t.auth.loginBtn : t.auth.signupBtn}
                {mode === 'login' ? <LogIn size={16} /> : <UserPlus size={16} />}
              </button>
            </motion.form>
          </AnimatePresence>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-forest/10"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-cream px-4 text-forest/40 font-bold tracking-widest">{t.auth.orContinueWith}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={() => handleSocialSignIn('Google', signInWithGoogle)}
              className="py-3 bg-white border border-forest/10 text-forest rounded-xl font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:border-gold hover:text-gold transition-all shadow-sm"
            >
              <Chrome size={16} />
              Google
            </button>
          </div>
        </div>
      </motion.div>
      </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
