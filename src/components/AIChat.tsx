import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Sparkles, Trash2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { auth } from '../firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

const MOCK_ORDERS: Record<string, string> = {
  'GL-1234': 'Votre commande est en cours de préparation avec des mangues fraîches de Maurice.',
  'GL-5678': 'Votre commande est en cours de livraison dans la région de Beau Plan.',
  'GL-9012': 'Votre commande a été livrée. Savourez votre gelato artisanal !',
  'GL-0000': 'Numéro de commande introuvable. Veuillez vérifier votre reçu.',
  'GL-1111': 'Commande reçue et confirmée. Nos artisans vont commencer la préparation sous peu.',
  'GL-2222': 'Votre commande a un léger retard dû à un grand nombre de demandes artisanales. Merci de votre patience !',
  'GL-3333': 'Votre commande est prête à être récupérée dans notre boutique de Beau Plan. À bientôt !',
  'GL-4444': 'Malheureusement, cette commande a été annulée. Veuillez contacter notre support pour plus de détails.',
  'GL-5555': "Votre commande est en transit vers la région de Grand Baie. Elle devrait arriver d'ici une heure.",
  'GL-7777': "Votre commande est en cours d'emballage dans nos boîtes de luxe spéciales à température contrôlée.",
};

const SUGGESTIONS: Record<string, string[]> = {
  fr: ['Quels sont vos parfums ?', 'Êtes-vous ouverts ?', 'Louer le chariot', 'Ingrédients naturels ?'],
  en: ['What flavors do you have?', 'Are you open today?', 'Rent the cart', 'Natural ingredients?'],
  cr: ['Ki parfum ou ena?', 'Ou ouver zordi?', 'Loue sario glas', 'Ingreyan natirél?'],
  ar: ['ما هي نكهاتكم؟', 'هل أنتم مفتوحون؟', 'استئجار العربة', 'مكونات طبيعية؟'],
  hi: ['कौन से स्वाद हैं?', 'क्या आज खुले हैं?', 'गाड़ी किराए पर लें', 'प्राकृतिक सामग्री?'],
  zh: ['你们有什么口味？', '今天营业吗？', '租用冰淇淋车', '天然食材？'],
};

type Message = { role: 'user' | 'ai'; text: string; timestamp: Date };

export default function AIChat() {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [user, setUser] = useState<User | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const orderInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, []);

  const userName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || null;

  useEffect(() => {
    const welcome = userName
      ? t.chat.welcome.replace('{name}', userName)
      : t.chat.welcome.replace(', {name}', '').replace('{name}', '');
    setMessages([{ role: 'ai', text: welcome, timestamp: new Date() }]);
  }, [language, t.chat.welcome, userName]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Auto-focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const hasUnread = !isOpen && messages.length > 1 && messages[messages.length - 1].role === 'ai';

  const getOrderStatus = (orderId: string) =>
    MOCK_ORDERS[orderId] || t.chat.notFound;

  const handleSend = async (text?: string) => {
    const userMsg = text || input;
    if (!userMsg.trim() || isLoading) return;

    setInput('');
    const updatedMessages: Message[] = [...messages, { role: 'user', text: userMsg, timestamp: new Date() }];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          language,
          history: messages.map(m => ({ role: m.role, text: m.text })),
          userName,
        }),
      });

      const data = await response.json();
      const aiText = data.text || t.chat.unavailable;
      setMessages(prev => [...prev, { role: 'ai', text: aiText, timestamp: new Date() }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'ai',
        text: t.chat.connectionError,
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrderTrack = () => {
    const val = orderInputRef.current?.value?.trim();
    if (!val) return;
    setMessages(prev => [
      ...prev,
      { role: 'user', text: `${t.chat.orderTrackingPrefix} ${val}`, timestamp: new Date() },
      { role: 'ai', text: getOrderStatus(val), timestamp: new Date() },
    ]);
    if (orderInputRef.current) orderInputRef.current.value = '';
  };

  const clearChat = () => {
    setMessages([{ role: 'ai', text: t.chat.welcome, timestamp: new Date() }]);
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const renderText = (text: string) => {
    // Convert basic markdown to JSX
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**'))
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      if (part.startsWith('*') && part.endsWith('*'))
        return <em key={i}>{part.slice(1, -1)}</em>;
      return part;
    });
  };

  const suggestions = SUGGESTIONS[language] ?? SUGGESTIONS.fr;
  const showSuggestions = messages.length <= 1 && !isLoading;

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-8 left-6 z-50">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(true)}
          className="relative w-16 h-16 bg-forest text-white rounded-full shadow-2xl flex items-center justify-center"
        >
          {/* Pulse ring */}
          <motion.div
            className="absolute inset-0 rounded-full bg-forest"
            animate={{ scale: [1, 1.35, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="relative z-10"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          {/* Unread badge */}
          <AnimatePresence>
            {hasUnread && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1 w-4 h-4 bg-gold rounded-full border-2 border-white"
              />
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-28 left-4 sm:left-8 z-50 w-[calc(100vw-2rem)] sm:w-[380px] h-[520px] glass rounded-3xl shadow-2xl flex flex-col overflow-hidden border-forest/10"
          >
            {/* Header */}
            <div className="p-5 bg-forest text-cream flex justify-between items-center flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                  <Sparkles size={20} className="text-gold" />
                </div>
                <div>
                  <h4 className="font-serif text-lg leading-none">Chrys</h4>
                  <span className="text-[10px] uppercase tracking-widest opacity-60">{t.chat.online}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={clearChat}
                  className="hover:text-gold transition-colors opacity-50 hover:opacity-100"
                  title={t.chat.clearChat}
                >
                  <Trash2 size={16} />
                </button>
                <button onClick={() => setIsOpen(false)} className="hover:text-gold transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Order Tracking Quick Access */}
            <div className="px-5 py-3 bg-gold/10 border-b border-forest/5 flex flex-col gap-2 flex-shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-widest text-forest/60">
                {t.chat.trackOrder}
              </span>
              <div className="flex gap-2">
                <input
                  ref={orderInputRef}
                  type="text"
                  placeholder={t.chat.orderPlaceholder}
                  className="flex-1 px-3 py-1.5 bg-white rounded-lg text-xs focus:outline-none border border-forest/10"
                  onKeyDown={e => e.key === 'Enter' && handleOrderTrack()}
                />
                <button
                  onClick={handleOrderTrack}
                  className="px-3 py-1.5 bg-forest text-cream rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-gold transition-colors"
                >
                  {t.chat.trackBtn}
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-cream/50">
              {messages.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  {msg.role === 'ai' && (
                    <div className="w-6 h-6 rounded-full bg-forest/10 flex items-center justify-center mb-1">
                      <Sparkles size={11} className="text-forest/50" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-forest text-cream rounded-tr-none'
                        : 'bg-white text-forest shadow-sm rounded-tl-none border border-forest/5'
                    }`}
                  >
                    {renderText(msg.text)}
                  </div>
                  <span className="text-[10px] text-forest/30 mt-0.5 px-1">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              ))}

              {/* Quick Suggestions */}
              {showSuggestions && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(s)}
                      className="px-3 py-1.5 bg-white border border-forest/10 rounded-full text-xs text-forest hover:bg-forest hover:text-cream transition-colors shadow-sm"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-forest/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles size={11} className="text-forest/50" />
                  </div>
                  <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none shadow-sm border border-forest/5">
                    <motion.div
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="flex gap-1"
                    >
                      <div className="w-1.5 h-1.5 bg-forest rounded-full" />
                      <div className="w-1.5 h-1.5 bg-forest rounded-full" />
                      <div className="w-1.5 h-1.5 bg-forest rounded-full" />
                    </motion.div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-forest/10 flex gap-2 flex-shrink-0">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder={t.chat.placeholder}
                className="flex-1 px-4 py-2 bg-cream rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-gold"
              />
              <button
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                className="p-2 bg-forest text-cream rounded-xl hover:bg-gold transition-colors disabled:opacity-40"
              >
                <Send size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
