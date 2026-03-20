import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Building2, Phone, Landmark } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { getLocalizedText } from '../data';

const MERCHANT_PHONE = '+23059890767';
const MERCHANT_DISPLAY = '+230 59890767';

type PaymentMethod = 'cash' | 'juice' | 'myt' | 'orange' | 'maucash' | 'virement';

interface PaymentOption {
  id: PaymentMethod;
  label: string;
  description: string;
  color: string;
  icon: React.ReactNode;
}

function generateRef() {
  return 'GL-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function CheckoutModal() {
  const { items, isCheckoutOpen, setIsCheckoutOpen, totalPrice, clearCart } = useCart();
  const { t, language } = useLanguage();
  const cart = (t as any).cart;

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [payment, setPayment] = useState<PaymentMethod>('cash');
  const [orderRef] = useState(generateRef);

  const paymentOptions: PaymentOption[] = [
    {
      id: 'cash',
      label: cart?.cash || 'Espèces',
      description: cart?.cashDesc || 'Payer au comptoir lors du retrait',
      color: '#16a34a',
      icon: <span className="text-xl">💵</span>,
    },
    {
      id: 'juice',
      label: 'Juice by MCB',
      description: `${cart?.sendTo || 'Envoyer à'} ${MERCHANT_DISPLAY}`,
      color: '#E8001C',
      icon: <Building2 size={20} />,
    },
    {
      id: 'myt',
      label: 'MyT Money',
      description: `${cart?.sendTo || 'Envoyer à'} ${MERCHANT_DISPLAY}`,
      color: '#009FE3',
      icon: <Phone size={20} />,
    },
    {
      id: 'orange',
      label: 'Orange Money',
      description: `${cart?.sendTo || 'Envoyer à'} ${MERCHANT_DISPLAY}`,
      color: '#FF6600',
      icon: <Phone size={20} />,
    },
    {
      id: 'maucash',
      label: 'MauCash (SBM)',
      description: `${cart?.sendTo || 'Envoyer à'} ${MERCHANT_DISPLAY}`,
      color: '#006400',
      icon: <Phone size={20} />,
    },
    {
      id: 'virement',
      label: cart?.bankTransfer || 'Virement bancaire',
      description: 'IBAN communiqué à la confirmation',
      color: '#1a1a2e',
      icon: <Landmark size={20} />,
    },
  ];

  const selectedPaymentLabel = paymentOptions.find(p => p.id === payment)?.label || payment;

  const buildWhatsAppMessage = () => {
    const lines = [
      '🍦 Nouvelle commande - Le Glacier Gourmand',
      '',
      `👤 ${name}`,
      `📞 ${phone}`,
      '',
      '📋 Commande:',
      ...items.map(({ item, quantity }) => {
        const itemName = getLocalizedText(item.title, language);
        return `• ${quantity}x ${itemName} — ${item.price}`;
      }),
      `💰 Total: Rs ${totalPrice.toFixed(0)}`,
      `💳 Paiement: ${selectedPaymentLabel}`,
      `📍 Retrait: Mahogany Shopping Promenade, Beau Plan`,
      '',
      `Réf: ${orderRef}`,
    ];
    return encodeURIComponent(lines.join('\n'));
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setStep(1);
    setName('');
    setPhone('');
    setPayment('cash');
  };

  const handleConfirmAndWhatsApp = () => {
    const msg = buildWhatsAppMessage();
    window.open(`https://wa.me/${MERCHANT_PHONE}?text=${msg}`, '_blank');
  };

  const handleBackToMenu = () => {
    clearCart();
    handleClose();
  };

  if (!isCheckoutOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-cream w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-forest/10">
            <div className="flex items-center gap-3">
              {/* Step indicators */}
              {[1, 2, 3].map(s => (
                <div key={s} className="flex items-center gap-1.5">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step === s ? 'bg-forest text-cream' : step > s ? 'bg-gold text-forest' : 'bg-forest/10 text-forest/40'
                  }`}>
                    {step > s ? <Check size={14} /> : s}
                  </div>
                  {s < 3 && <div className={`w-6 h-0.5 rounded-full ${step > s ? 'bg-gold' : 'bg-forest/10'}`} />}
                </div>
              ))}
            </div>
            <button onClick={handleClose} className="p-2 rounded-full hover:bg-forest/5 text-forest/50 hover:text-forest transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <h3 className="text-xl font-serif text-forest">{cart?.yourDetails || 'Vos informations'}</h3>

                  <div className="space-y-3">
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder={cart?.nameLabel || 'Prénom & Nom'}
                      className="w-full px-4 py-3 rounded-xl border border-forest/10 bg-white text-forest placeholder-forest/30 focus:outline-none focus:border-gold text-sm"
                    />
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder={cart?.phonePlaceholder || '+230 5XXX XXXX'}
                      className="w-full px-4 py-3 rounded-xl border border-forest/10 bg-white text-forest placeholder-forest/30 focus:outline-none focus:border-gold text-sm"
                    />
                  </div>

                  {/* Order summary */}
                  <div className="bg-white rounded-2xl p-4 space-y-2 border border-forest/5">
                    <p className="text-xs font-bold uppercase tracking-widest text-forest/40 mb-3">
                      {cart?.paymentTitle || 'Récapitulatif'}
                    </p>
                    {items.map(({ item, quantity }) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-forest/70">{quantity}× {getLocalizedText(item.title, language)}</span>
                        <span className="text-forest font-medium">Rs {(parseFloat(item.price.replace(/[^0-9.]/g, '')) * quantity).toFixed(0)}</span>
                      </div>
                    ))}
                    <div className="border-t border-forest/10 mt-3 pt-3 flex justify-between font-bold">
                      <span className="text-forest">{cart?.total || 'Total'}</span>
                      <span className="text-gold">Rs {totalPrice.toFixed(0)}</span>
                    </div>
                  </div>

                  <p className="text-xs text-forest/40 text-center">
                    📍 {cart?.pickupNote || 'Retrait uniquement : Mahogany Shopping Promenade, Beau Plan'}
                  </p>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h3 className="text-xl font-serif text-forest">{cart?.payment || 'Paiement'}</h3>
                  <div className="space-y-3">
                    {paymentOptions.map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setPayment(opt.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                          payment === opt.id
                            ? 'border-current shadow-sm'
                            : 'border-forest/5 bg-white hover:border-forest/20'
                        }`}
                        style={payment === opt.id ? { borderColor: opt.color, backgroundColor: opt.color + '10' } : {}}
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white"
                          style={{ backgroundColor: opt.color }}
                        >
                          {opt.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-forest">{opt.label}</p>
                          <p className="text-xs text-forest/50 truncate">{opt.description}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          payment === opt.id ? 'border-current' : 'border-forest/20'
                        }`} style={payment === opt.id ? { borderColor: opt.color } : {}}>
                          {payment === opt.id && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: opt.color }} />}
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6 text-center"
                >
                  {/* Animated checkmark */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 15, stiffness: 300, delay: 0.1 }}
                    className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto"
                  >
                    <Check size={36} className="text-green-600" />
                  </motion.div>

                  <div>
                    <h3 className="text-2xl font-serif text-forest mb-1">{cart?.orderConfirmed || 'Commande confirmée !'}</h3>
                    <p className="text-xs font-bold uppercase tracking-widest text-forest/40">
                      {cart?.orderRef || 'Référence'}: {orderRef}
                    </p>
                  </div>

                  {/* Summary pills */}
                  <div className="flex flex-wrap justify-center gap-2">
                    <span className="px-3 py-1.5 bg-forest/5 rounded-full text-xs font-bold text-forest">
                      {items.reduce((s, i) => s + i.quantity, 0)} article{items.reduce((s, i) => s + i.quantity, 0) > 1 ? 's' : ''}
                    </span>
                    <span className="px-3 py-1.5 bg-gold/10 rounded-full text-xs font-bold text-forest">
                      Rs {totalPrice.toFixed(0)}
                    </span>
                    <span className="px-3 py-1.5 bg-forest/5 rounded-full text-xs font-bold text-forest">
                      {selectedPaymentLabel}
                    </span>
                  </div>

                  <div className="bg-white rounded-2xl p-4 text-left border border-forest/5">
                    <p className="text-xs font-bold uppercase tracking-widest text-forest/40 mb-2">📍 Retrait</p>
                    <p className="text-sm text-forest">Mahogany Shopping Promenade, Beau Plan</p>
                  </div>

                  <p className="text-sm text-forest/60">
                    {cart?.whatsappConfirm || 'Envoyez votre commande sur WhatsApp pour confirmer'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer buttons */}
          <div className="px-6 py-5 border-t border-forest/10 space-y-3">
            {step === 1 && (
              <button
                onClick={() => { if (name.trim() && phone.trim()) setStep(2); }}
                disabled={!name.trim() || !phone.trim()}
                className="w-full py-4 bg-forest text-cream rounded-2xl text-sm font-bold uppercase tracking-widest hover:bg-gold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {cart?.payment || 'Paiement'} →
              </button>
            )}
            {step === 2 && (
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-4 border border-forest/20 text-forest rounded-2xl text-sm font-bold uppercase tracking-widest hover:bg-forest/5 transition-all"
                >
                  ← {cart?.backToMenu ? '' : 'Retour'}
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 py-4 bg-forest text-cream rounded-2xl text-sm font-bold uppercase tracking-widest hover:bg-gold transition-all"
                >
                  {cart?.confirm || 'Confirmer'} →
                </button>
              </div>
            )}
            {step === 3 && (
              <>
                <button
                  onClick={handleConfirmAndWhatsApp}
                  className="w-full py-4 bg-green-600 text-white rounded-2xl text-sm font-bold uppercase tracking-widest hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                  WhatsApp
                </button>
                <button
                  onClick={handleBackToMenu}
                  className="w-full py-3 text-forest/50 text-sm hover:text-forest transition-colors"
                >
                  {cart?.backToMenu || '← Retour au menu'}
                </button>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
