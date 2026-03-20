import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Calendar, Users, ChevronRight, ChevronLeft,
  Phone, Mail, User, MessageSquare, CheckCircle,
  Sparkles, Send,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  onClose: () => void;
}

const EVENT_TYPE_IDS = [
  { id: 'mariage',      emoji: '💍' },
  { id: 'anniversaire', emoji: '🎂' },
  { id: 'corporate',    emoji: '🏢' },
  { id: 'fete',         emoji: '🎉' },
  { id: 'trophee',      emoji: '🏆' },
  { id: 'autre',        emoji: '✨' },
];

const GUEST_OPTIONS = ['10 – 30', '30 – 80', '80 – 150', '150 – 300', '300+'];

const FLAVOUR_SUGGESTIONS = [
  'Mangue de Maurice', 'Pitaya Rose', 'Pistache de Sicile',
  'Caramel Beurre Salé', 'Chocolat Noir 70%', 'Coco Givré',
  'Vanille Bourbon', 'Fraise des Bois', 'Passion Exotique',
  'Citron Meringué', 'Noix de Macadamia', 'Café Réunion',
  'Banane Flambée', 'Litchi Rose', 'Tiramisu', 'Spéculoos',
  'Baies de Goji', 'Menthe Glaciale', 'Framboise Royale', 'Ananas Rôti',
];

export default function EventBookingModal({ onClose }: Props) {
  const { t } = useLanguage();

  const EVENT_TYPES = EVENT_TYPE_IDS.map(et => ({
    ...et,
    label: t.booking[et.id as keyof typeof t.booking] as string,
  }));

  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [selectedFlavours, setSelectedFlavours] = useState<string[]>([]);
  const [form, setForm] = useState({
    eventType: '',
    date: '',
    guests: '',
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const set = (key: string, value: string) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const toggleFlavour = (f: string) =>
    setSelectedFlavours(prev =>
      prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]
    );

  const step1Valid = form.eventType && form.date && form.guests;
  const step2Valid = form.name.trim() && form.email.trim();

  const selectedEventLabel = EVENT_TYPES.find(e => e.id === form.eventType)?.label ?? form.eventType;
  const whatsappText = encodeURIComponent(
    `Bonjour Le Glacier Gourmand ! 🍦\n\n` +
    `${t.booking.eventTypeLabel} : ${selectedEventLabel}\n` +
    `${t.booking.dateLabel} : ${form.date}\n` +
    `${t.booking.guestsLabel} : ${form.guests}\n` +
    `${t.booking.nameLabel} : ${form.name}\n` +
    (selectedFlavours.length ? `${t.booking.flavoursLabel} : ${selectedFlavours.join(', ')}\n` : '') +
    (form.message ? `${t.booking.messageLabel} : ${form.message}\n` : '')
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-forest/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, y: 30, opacity: 0 }}
        animate={{ scale: 1,    y: 0,  opacity: 1 }}
        exit={{   scale: 0.92, y: 30,  opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="bg-cream w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ─────────────────────────────────────── */}
        <div className="bg-forest px-8 py-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                <Sparkles size={18} className="text-gold" />
              </div>
              <div>
                <h3 className="text-cream font-serif text-lg leading-none">
                  {t.booking.title}
                </h3>
                <p className="text-cream/40 text-[10px] uppercase tracking-widest mt-0.5">
                  {t.booking.subtitle}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-cream/40 hover:text-gold transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Step progress bar */}
          {!submitted && (
            <div className="mt-5 flex items-center gap-2">
              {[1, 2].map(s => (
                <div
                  key={s}
                  className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                    s <= step ? 'bg-gold' : 'bg-cream/15'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Body ───────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-8 py-7">
          <AnimatePresence mode="wait">

            {/* SUCCESS */}
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
                  className="w-20 h-20 rounded-full bg-gold/15 flex items-center justify-center mx-auto mb-5"
                >
                  <CheckCircle size={38} className="text-gold" />
                </motion.div>

                <h4 className="font-serif text-2xl text-forest mb-2">
                  {t.booking.successTitle}
                </h4>
                <p className="text-forest/55 text-sm leading-relaxed mb-8 max-w-xs mx-auto">
                  {t.booking.successDesc}
                </p>

                {/* Summary pill */}
                <div className="flex flex-wrap justify-center gap-2 mb-8">
                  {[
                    EVENT_TYPES.find(e => e.id === form.eventType)?.label,
                    form.date,
                    `${form.guests} ${t.booking.guests}`,
                  ].filter(Boolean).map((v, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-forest/5 border border-forest/10 rounded-full text-xs text-forest font-medium"
                    >
                      {v}
                    </span>
                  ))}
                </div>

                {/* Contact card */}
                <div className="bg-forest rounded-2xl p-5 text-left mb-4">
                  <p className="text-[10px] uppercase tracking-widest text-cream/40 mb-3 font-bold">
                    {t.booking.directContact}
                  </p>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                      <User size={14} className="text-gold" />
                    </div>
                    <div>
                      <p className="font-bold text-cream text-sm">Kaddour Djilali</p>
                      <p className="text-cream/40 text-xs">{t.booking.eventManagerTitle}</p>
                    </div>
                  </div>
                  <a
                    href="tel:+23059890767"
                    className="flex items-center gap-2 text-cream/70 hover:text-gold transition-colors"
                  >
                    <Phone size={13} className="text-gold" />
                    <span className="text-sm">+230 5989 0767</span>
                  </a>
                </div>

                {/* WhatsApp CTA */}
                <a
                  href={`https://wa.me/23059890767?text=${whatsappText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#25D366] text-white rounded-xl font-bold text-sm hover:bg-[#1da851] transition-colors shadow-lg"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  {t.booking.whatsappBtn}
                </a>
              </motion.div>

            /* STEP 1 */
            ) : step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{   opacity: 0, x: -24 }}
                transition={{ duration: 0.25 }}
              >
                <p className="text-[10px] uppercase tracking-widest text-forest/40 font-bold mb-5">
                  {t.booking.step1}
                </p>

                {/* Event type */}
                <p className="text-xs font-bold text-forest/60 mb-2">{t.booking.eventTypeLabel}</p>
                <div className="grid grid-cols-3 gap-2 mb-6">
                  {EVENT_TYPES.map(et => (
                    <button
                      key={et.id}
                      onClick={() => set('eventType', et.id)}
                      className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl border-2 transition-all ${
                        form.eventType === et.id
                          ? 'border-gold bg-gold/10 scale-[1.03] shadow-sm'
                          : 'border-forest/10 bg-white text-forest/50 hover:border-gold/40 hover:bg-gold/5'
                      }`}
                    >
                      <span className="text-2xl">{et.emoji}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wide leading-tight text-center text-forest">
                        {et.label}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Date */}
                <div className="mb-4">
                  <label className="text-xs font-bold text-forest/60 mb-1.5 block">
                    {t.booking.dateLabel}
                  </label>
                  <div className="relative">
                    <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-forest/30 pointer-events-none" />
                    <input
                      type="date"
                      value={form.date}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={e => set('date', e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-white border border-forest/10 rounded-xl text-sm text-forest focus:outline-none focus:ring-2 focus:ring-gold/30"
                    />
                  </div>
                </div>

                {/* Guests */}
                <div>
                  <label className="text-xs font-bold text-forest/60 mb-2 block">
                    {t.booking.guestsLabel}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {GUEST_OPTIONS.map(g => (
                      <button
                        key={g}
                        onClick={() => set('guests', g)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border-2 transition-all ${
                          form.guests === g
                            ? 'border-gold bg-gold/10 text-forest'
                            : 'border-forest/10 bg-white text-forest/50 hover:border-gold/30'
                        }`}
                      >
                        <Users size={11} />
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>

            /* STEP 2 */
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{   opacity: 0, x: -24 }}
                transition={{ duration: 0.25 }}
              >
                <p className="text-[10px] uppercase tracking-widest text-forest/40 font-bold mb-5">
                  {t.booking.step2}
                </p>

                {/* Fields */}
                {[
                  { key: 'name',  label: t.booking.nameLabel,  Icon: User,  type: 'text',  placeholder: t.booking.namePlaceholder },
                  { key: 'email', label: t.booking.emailLabel, Icon: Mail,  type: 'email', placeholder: t.booking.emailPlaceholder },
                  { key: 'phone', label: t.booking.phoneLabel, Icon: Phone, type: 'tel',   placeholder: t.booking.phonePlaceholder },
                ].map(({ key, label, Icon, type, placeholder }) => (
                  <div key={key} className="mb-4">
                    <label className="text-xs font-bold text-forest/60 mb-1.5 block">{label}</label>
                    <div className="relative">
                      <Icon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-forest/30 pointer-events-none" />
                      <input
                        type={type}
                        value={form[key as keyof typeof form]}
                        onChange={e => set(key, e.target.value)}
                        placeholder={placeholder}
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-forest/10 rounded-xl text-sm text-forest focus:outline-none focus:ring-2 focus:ring-gold/30 placeholder:text-forest/20"
                      />
                    </div>
                  </div>
                ))}

                {/* Flavour suggestions */}
                <div className="mb-4">
                  <label className="text-xs font-bold text-forest/60 mb-2 block">
                    {t.booking.flavoursLabel} <span className="font-normal opacity-60">{t.booking.optional}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {FLAVOUR_SUGGESTIONS.map(f => (
                      <button
                        key={f}
                        onClick={() => toggleFlavour(f)}
                        className={`px-3 py-1 rounded-full text-[11px] font-medium border transition-all ${
                          selectedFlavours.includes(f)
                            ? 'bg-forest text-cream border-forest'
                            : 'bg-white text-forest/60 border-forest/10 hover:border-gold/40'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div className="mb-5">
                  <label className="text-xs font-bold text-forest/60 mb-1.5 block">
                    {t.booking.messageLabel} <span className="font-normal opacity-60">{t.booking.optional}</span>
                  </label>
                  <div className="relative">
                    <MessageSquare size={14} className="absolute left-3.5 top-3 text-forest/30 pointer-events-none" />
                    <textarea
                      value={form.message}
                      onChange={e => set('message', e.target.value)}
                      placeholder={t.booking.messagePlaceholder}
                      rows={3}
                      className="w-full pl-9 pr-4 py-2.5 bg-white border border-forest/10 rounded-xl text-sm text-forest focus:outline-none focus:ring-2 focus:ring-gold/30 resize-none placeholder:text-forest/20"
                    />
                  </div>
                </div>

                {/* Contact card */}
                <div className="flex items-center gap-3 p-4 bg-forest/5 rounded-2xl border border-forest/10">
                  <div className="w-9 h-9 rounded-full bg-gold/15 flex items-center justify-center flex-shrink-0">
                    <Phone size={14} className="text-gold" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-forest/40 font-bold">
                      {t.booking.contactQuestion}
                    </p>
                    <p className="text-sm font-bold text-forest">Kaddour Djilali</p>
                    <a
                      href="tel:+23059890767"
                      className="text-xs text-forest/50 hover:text-gold transition-colors"
                    >
                      +230 5989 0767
                    </a>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Footer ─────────────────────────────────────── */}
        {!submitted && (
          <div className="px-8 pb-7 pt-2 flex gap-3 flex-shrink-0 border-t border-forest/5 bg-cream">
            {step === 2 && (
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 px-5 py-3 border border-forest/10 rounded-xl text-sm text-forest/60 hover:text-forest transition-colors"
              >
                <ChevronLeft size={15} />
                {t.booking.backBtn}
              </button>
            )}
            {step === 1 ? (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setStep(2)}
                disabled={!step1Valid}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-forest text-cream rounded-xl font-bold text-sm hover:bg-gold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {t.booking.continueBtn}
                <ChevronRight size={15} />
              </motion.button>
            ) : (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setSubmitted(true)}
                disabled={!step2Valid}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-gold text-forest rounded-xl font-bold text-sm hover:bg-forest hover:text-cream transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send size={14} />
                {t.booking.sendBtn}
              </motion.button>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
