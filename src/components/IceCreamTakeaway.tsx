import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Check, IceCream } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { getLocalizedText } from '../data';
import { img } from '../utils/image';
import { useMenu } from '../context/MenuContext';

const FORMATS = [
  { key: '500ml', label: '½ Litre', price: 800, maxFlavors: 2, desc: '2 parfums au choix' },
  { key: '1L',    label: '1 Litre',  price: 1500, maxFlavors: 3, desc: '3 parfums au choix' },
] as const;

type FormatKey = typeof FORMATS[number]['key'];

export default function IceCreamTakeaway() {
  const { addItem } = useCart();
  const { language } = useLanguage();
  const { menuItems } = useMenu();
  const ICE_CREAMS = menuItems.filter(item => item.category === 'glaces');
  const [format, setFormat] = useState<FormatKey>('500ml');
  const [selected, setSelected] = useState<string[]>([]);
  const [added, setAdded] = useState(false);

  const current = FORMATS.find(f => f.key === format)!;

  const toggleFlavor = (id: string) => {
    setSelected(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= current.maxFlavors) return prev;
      return [...prev, id];
    });
  };

  // Reset selection when format changes if over limit
  const switchFormat = (key: FormatKey) => {
    setFormat(key);
    const newMax = FORMATS.find(f => f.key === key)!.maxFlavors;
    setSelected(prev => prev.slice(0, newMax));
  };

  const handleAddToCart = () => {
    if (selected.length === 0) return;
    const names = selected.map(id => {
      const item = ICE_CREAMS.find(i => i.id === id)!;
      return getLocalizedText(item.title, language);
    });
    const firstItem = ICE_CREAMS.find(i => i.id === selected[0])!;

    addItem({
      id: `takeaway-${format}-${selected.join('-')}`,
      title: {
        fr: `Glace à Emporter ${current.label}`,
        en: `Ice Cream Takeaway ${current.label}`,
        cr: `Glas a Emporte ${current.label}`,
        ar: `آيس كريم للأخذ ${current.label}`,
        hi: `आइसक्रीम टेकअवे ${current.label}`,
        zh: `冰淇淋外带 ${current.label}`,
      },
      description: {
        fr: names.join(' + '),
        en: names.join(' + '),
        cr: names.join(' + '),
        ar: names.join(' + '),
        hi: names.join(' + '),
        zh: names.join(' + '),
      },
      price: `Rs ${current.price}`,
      category: 'glaces',
      image: firstItem.image,
      tags: ['À Emporter'],
    });

    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      setSelected([]);
    }, 1800);
  };

  const isFull = selected.length >= current.maxFlavors;

  return (
    <div className="max-w-5xl mx-auto my-8 sm:my-12 bg-forest rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl">
      {/* Gold top bar */}
      <div className="h-1.5 bg-gradient-to-r from-gold via-cream/60 to-gold" />

      <div className="p-4 sm:p-6 md:p-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <span className="p-2 sm:p-2.5 bg-gold/20 rounded-xl text-gold shrink-0">
            <IceCream size={20} />
          </span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gold/60 mb-0.5">Emporter chez vous</p>
            <h3 className="text-lg sm:text-2xl font-serif text-cream leading-tight">Glace Artisanale à Emporter</h3>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 items-start">
          {/* Left: Format + Flavor picker */}
          <div>
            {/* Format selector */}
            <p className="text-[10px] font-bold uppercase tracking-widest text-cream/40 mb-3">
              1. Choisissez votre format
            </p>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {FORMATS.map(f => (
                <button
                  key={f.key}
                  onClick={() => switchFormat(f.key)}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    format === f.key
                      ? 'border-gold bg-gold/10 text-cream'
                      : 'border-cream/10 bg-cream/5 text-cream/50 hover:border-gold/40'
                  }`}
                >
                  <span className="block text-xl font-serif font-bold">{f.label}</span>
                  <span className="block text-[10px] uppercase tracking-wider mt-1 opacity-70">{f.desc}</span>
                  <span className="block text-gold font-bold text-sm mt-2">Rs {f.price}</span>
                </button>
              ))}
            </div>

            {/* Flavor selector */}
            <p className="text-[10px] font-bold uppercase tracking-widest text-cream/40 mb-3">
              2. Sélectionnez {current.maxFlavors === 2 ? 'vos 2 parfums' : 'vos 3 parfums'}
              <span className="ml-2 text-gold">{selected.length}/{current.maxFlavors}</span>
            </p>

            <div className="flex flex-wrap gap-2 max-h-52 overflow-y-auto pr-1">
              {ICE_CREAMS.map(item => {
                const isSelected = selected.includes(item.id);
                const isDisabled = !isSelected && isFull;
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleFlavor(item.id)}
                    disabled={isDisabled}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-gold text-forest shadow-md shadow-gold/20'
                        : isDisabled
                        ? 'bg-cream/5 text-cream/20 cursor-not-allowed'
                        : 'bg-cream/10 text-cream/70 hover:bg-cream/20 hover:text-cream border border-cream/10'
                    }`}
                  >
                    {isSelected && <Check size={10} strokeWidth={3} />}
                    {getLocalizedText(item.title, language)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Summary & Cart */}
          <div className="bg-cream/5 rounded-2xl border border-cream/10 p-4 sm:p-6 flex flex-col justify-between sm:min-h-[260px]">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-cream/40 mb-4">Votre sélection</p>

              {selected.length === 0 ? (
                <p className="text-cream/30 italic text-sm">Aucun parfum sélectionné</p>
              ) : (
                <div className="space-y-2 mb-6">
                  {selected.map((id, i) => {
                    const item = ICE_CREAMS.find(x => x.id === id)!;
                    return (
                      <div key={id} className="flex items-center gap-3">
                        <img
                          src={img(item.image, 60)}
                          alt=""
                          className="w-10 h-10 rounded-xl object-cover opacity-90"
                        />
                        <div>
                          <p className="text-[10px] text-cream/40 uppercase tracking-widest">Parfum {i + 1}</p>
                          <p className="text-cream text-sm font-medium leading-tight">
                            {getLocalizedText(item.title, language)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="border-t border-cream/10 pt-4 mt-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-cream/40">Total</span>
                <span className="text-3xl font-serif font-bold text-gold">Rs {current.price}</span>
              </div>

              <AnimatePresence mode="wait">
                {added ? (
                  <motion.div
                    key="added"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full py-4 bg-green-600 text-white font-bold rounded-2xl text-[11px] uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    <Check size={16} />
                    Ajouté au panier !
                  </motion.div>
                ) : (
                  <motion.button
                    key="btn"
                    onClick={handleAddToCart}
                    disabled={selected.length === 0}
                    className="w-full py-4 bg-gold hover:bg-gold/90 text-forest font-bold rounded-2xl text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-gold/20"
                  >
                    <ShoppingBag size={16} />
                    Ajouter au Panier
                    {selected.length > 0 && <span className="ml-1 opacity-70">· {current.label}</span>}
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
