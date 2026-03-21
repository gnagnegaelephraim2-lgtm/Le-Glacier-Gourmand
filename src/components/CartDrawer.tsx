import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { getLocalizedText } from '../data';
import { img } from '../utils/image';

export default function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, setIsCheckoutOpen, removeItem, updateQuantity, totalItems, totalPrice } = useCart();
  const { t, language } = useLanguage();
  const cart = (t as any).cart;

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 250 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-cream z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-forest/10">
              <div className="flex items-center gap-3">
                <ShoppingCart size={20} className="text-forest" />
                <h2 className="text-lg font-serif text-forest">{cart?.title || 'Votre Panier'}</h2>
                {totalItems > 0 && (
                  <span className="px-2 py-0.5 bg-gold text-forest text-[11px] font-bold rounded-full">
                    {totalItems}
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-full hover:bg-forest/5 transition-colors text-forest/60 hover:text-forest"
              >
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <span className="text-6xl">🍦</span>
                  <p className="text-forest font-serif text-xl">{cart?.empty || 'Votre panier est vide'}</p>
                  <p className="text-forest/50 text-sm">{cart?.emptySubtitle || 'Explorez notre menu pour ajouter des articles'}</p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="mt-2 px-6 py-3 bg-forest text-cream rounded-full text-xs font-bold uppercase tracking-widest hover:bg-gold transition-all"
                  >
                    {cart?.continueShopping || 'Continuer'}
                  </button>
                </div>
              ) : (
                items.map(({ item, quantity }) => {
                  const name = getLocalizedText(item.title, language);
                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex gap-4 bg-white rounded-2xl p-3 shadow-sm border border-forest/5"
                    >
                      <img
                        src={img(item.image, 128)}
                        alt={name}
                        className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-forest truncate">{name}</p>
                        <p className="text-gold font-bold text-sm">{item.price}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.id, quantity - 1)}
                            className="w-7 h-7 rounded-full bg-forest/5 hover:bg-forest/10 flex items-center justify-center text-forest font-bold transition-colors text-sm"
                          >
                            −
                          </button>
                          <span className="w-6 text-center text-sm font-bold text-forest">{quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, quantity + 1)}
                            className="w-7 h-7 rounded-full bg-forest/5 hover:bg-forest/10 flex items-center justify-center text-forest font-bold transition-colors text-sm"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-forest/30 hover:text-red-400 transition-colors self-start"
                      >
                        <Trash2 size={16} />
                      </button>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-6 py-5 border-t border-forest/10 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold uppercase tracking-widest text-forest/60">
                    {cart?.subtotal || 'Sous-total'}
                  </span>
                  <span className="text-xl font-bold text-forest">Rs {totalPrice.toFixed(0)}</span>
                </div>
                <button
                  onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }}
                  className="w-full py-4 bg-forest text-cream rounded-2xl text-sm font-bold uppercase tracking-widest hover:bg-gold transition-all shadow-lg shadow-forest/20"
                >
                  {cart?.checkout || 'Procéder au paiement'}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
