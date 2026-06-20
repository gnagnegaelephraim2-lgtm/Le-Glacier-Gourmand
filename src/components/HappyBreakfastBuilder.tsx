import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Coffee, Check, Clock, PlusCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { MenuItem } from '../types';

export default function HappyBreakfastBuilder() {
  const { addItem } = useCart();
  const { language } = useLanguage();
  
  // Simulation states
  const [isSimulated, setIsSimulated] = useState(true); // Default to true so they see it immediately!
  const [isPromoActive, setIsPromoActive] = useState(true);

  // Configuration states
  const [base, setBase] = useState<'gaufre' | 'crepe'>('gaufre');
  const [topping, setTopping] = useState<string>('Caramel Beurre Salé');
  const [quantity, setQuantity] = useState(1);

  // Check actual time (Mauritius timezone UTC+4)
  useEffect(() => {
    if (isSimulated) {
      setIsPromoActive(true);
      return;
    }
    const checkTime = () => {
      const now = new Date();
      // Add UTC+4 offset directly
      const muDate = new Date(now.getTime() + 4 * 60 * 60 * 1000);
      const hours = muDate.getUTCHours() + muDate.getUTCMinutes() / 60;
      setIsPromoActive(hours >= 8.5 && hours <= 10.5);
    };
    checkTime();
    const interval = setInterval(checkTime, 30000);
    return () => clearInterval(interval);
  }, [isSimulated]);

  // Topping list
  const toppings = language === 'fr' 
    ? ['Caramel Beurre Salé Maison', 'Chocolat Noir Artisanal', 'Fruits Tropicaux Frais', 'Sirop d\'Érable Bio']
    : ['Homemade Salted Caramel', 'Artisanal Dark Chocolate', 'Fresh Tropical Fruits', 'Organic Maple Syrup'];

  // Price calculations
  const basePrice = base === 'gaufre' ? 280 : 180;
  const juicePrice = 240;
  const toppingValue = 100;
  
  const discountPercent = 0.50;
  
  const promoBasePrice = basePrice * (1 - discountPercent);
  const promoJuicePrice = juicePrice * (1 - discountPercent);
  const promoToppingPrice = 0; // Offert!

  const regularTotal = basePrice + juicePrice + toppingValue;
  const promoTotal = promoBasePrice + promoJuicePrice + promoToppingPrice;

  const handleAddCombo = () => {
    const titleText = base === 'gaufre' 
      ? (language === 'fr' ? 'Formule Happy Breakfast Gaufre' : 'Happy Waffle Breakfast Combo')
      : (language === 'fr' ? 'Formule Happy Breakfast Crêpe' : 'Happy Crepe Breakfast Combo');
      
    const descText = language === 'fr'
      ? `${base === 'gaufre' ? 'Gaufre' : 'Crêpe'} + Jus d'orange frais + Topping ${topping} (Offert)`
      : `${base === 'gaufre' ? 'Waffle' : 'Crepe'} + Fresh Orange Juice + ${topping} Topping (Free)`;

    const comboItem: MenuItem = {
      id: `happy-breakfast-${base}-${topping.replace(/\s+/g, '-').toLowerCase()}-${isPromoActive ? 'promo' : 'regular'}`,
      title: {
        fr: titleText,
        en: titleText
      },
      description: {
        fr: descText,
        en: descText
      },
      price: `Rs ${isPromoActive ? promoTotal : regularTotal}`,
      category: 'sales',
      image: base === 'gaufre' 
        ? 'https://i.ibb.co/27jDZDxy/Gaufre-aux-fruits-202603181659.jpg'
        : 'https://i.ibb.co/ymY3FMqB/Caf-Gourmand-Cr-pe-202603182018.jpg',
      tags: isPromoActive ? ['Happy Breakfast', '50% OFF', 'Topping Offert'] : ['Breakfast']
    };

    for (let i = 0; i < quantity; i++) {
      addItem(comboItem);
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-12 bg-white/70 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-forest/10 shadow-2xl relative overflow-hidden">
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-gold via-forest to-gold" />

      {/* Simulator Control */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <label className="text-[10px] font-bold uppercase tracking-wider text-forest/60 select-none cursor-pointer flex items-center gap-1.5 bg-cream px-3 py-1.5 rounded-full border border-forest/5 hover:border-gold transition-colors">
          <input 
            type="checkbox" 
            checked={isSimulated}
            onChange={(e) => setIsSimulated(e.target.checked)}
            className="accent-forest"
          />
          {language === 'fr' ? 'Simuler Happy Hours' : 'Simulate Happy Hours'}
        </label>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-center mt-6">
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <span className="p-2 bg-gold/20 rounded-xl text-gold">
              <Coffee size={24} />
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-widest text-gold bg-gold/5 border border-gold/20 px-2.5 py-1 rounded-full">
                Promo
              </span>
              <div className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${isPromoActive ? 'bg-green-500 animate-pulse' : 'bg-red-400'}`} />
                <span className="text-[10px] font-bold uppercase tracking-widest text-forest/60">
                  {isPromoActive 
                    ? (language === 'fr' ? 'Active (08:30 - 10:30)' : 'Active (08:30 - 10:30)')
                    : (language === 'fr' ? 'Hors Heures' : 'Outside Hours')}
                </span>
              </div>
            </div>
          </div>

          <h3 className="text-3xl font-serif text-forest mb-3">Happy Breakfast</h3>
          <p className="text-sm text-forest/70 mb-6 leading-relaxed font-light">
            {language === 'fr'
              ? 'Commencez la journée avec notre formule spéciale. Profitez de 50% de réduction sur votre base et votre jus de fruits, avec le nappage de votre choix offert !'
              : 'Start your day with our special morning formula. Enjoy 50% off on your base and juice, with your choice of gourmet topping completely free!'}
          </p>

          {/* Interactive Steps */}
          <div className="space-y-4">
            {/* Step 1: Base */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-forest/40 block mb-2">
                {language === 'fr' ? '1. Choisissez votre base' : '1. Choose your base'}
              </span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setBase('gaufre')}
                  className={`p-3 rounded-2xl border text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-between ${
                    base === 'gaufre' 
                      ? 'border-forest bg-forest/5 text-forest' 
                      : 'border-forest/10 bg-white text-forest/60 hover:border-gold'
                  }`}
                >
                  <span>🥐 {language === 'fr' ? 'Gaufre' : 'Waffle'}</span>
                  <span className="text-[10px] text-gold font-bold">
                    {isPromoActive ? 'Rs 140' : 'Rs 280'}
                  </span>
                </button>
                <button
                  onClick={() => setBase('crepe')}
                  className={`p-3 rounded-2xl border text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-between ${
                    base === 'crepe' 
                      ? 'border-forest bg-forest/5 text-forest' 
                      : 'border-forest/10 bg-white text-forest/60 hover:border-gold'
                  }`}
                >
                  <span>🥞 {language === 'fr' ? 'Crêpe Nature' : 'Plain Crepe'}</span>
                  <span className="text-[10px] text-gold font-bold">
                    {isPromoActive ? 'Rs 90' : 'Rs 180'}
                  </span>
                </button>
              </div>
            </div>

            {/* Step 2: Topping */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-forest/40 block mb-2">
                {language === 'fr' ? '2. Sélectionnez votre Nappage (OFFERT)' : '2. Select your Topping (FREE)'}
              </span>
              <select
                value={topping}
                onChange={(e) => setTopping(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-forest/10 bg-white text-forest focus:outline-none focus:border-gold text-sm"
              >
                {toppings.map(t => (
                  <option key={t} value={t}>{t} ({language === 'fr' ? 'Offert' : 'Free'})</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Math Summary & Purchase Card */}
        <div className="bg-cream rounded-3xl p-6 border border-gold/20 shadow-xl flex flex-col justify-between h-full">
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-forest/60 mb-4 border-b border-forest/10 pb-2">
              {language === 'fr' ? 'Détails de la Formule' : 'Combo Summary'}
            </h4>
            
            <div className="space-y-3 mb-6 text-sm">
              <div className="flex justify-between">
                <span className="text-forest/70">
                  {base === 'gaufre' ? (language === 'fr' ? 'Base Gaufre' : 'Waffle Base') : (language === 'fr' ? 'Base Crêpe' : 'Crepe Base')}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-forest/30 line-through">Rs {basePrice}</span>
                  <span className="text-forest font-bold">Rs {isPromoActive ? promoBasePrice : basePrice}</span>
                </div>
              </div>

              <div className="flex justify-between">
                <span className="text-forest/70">🍊 {language === 'fr' ? 'Jus d\'orange frais' : 'Fresh Orange Juice'}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-forest/30 line-through">Rs {juicePrice}</span>
                  <span className="text-forest font-bold">Rs {isPromoActive ? promoJuicePrice : juicePrice}</span>
                </div>
              </div>

              <div className="flex justify-between">
                <span className="text-forest/70">✨ Topping {topping.split(' ')[0]}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-forest/30 line-through">Rs {toppingValue}</span>
                  <span className="text-green-600 font-bold uppercase tracking-widest text-xs">
                    {language === 'fr' ? 'Offert' : 'Free'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-forest/10 pt-4 mt-4">
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-forest/40">Total</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-forest/30 line-through">Rs {regularTotal}</span>
                  <span className="text-3xl font-serif font-bold text-gold">Rs {isPromoActive ? promoTotal : regularTotal}</span>
                </div>
              </div>
              
              {/* Quantity Select */}
              <div className="flex items-center border border-forest/10 rounded-xl bg-white overflow-hidden">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1.5 text-forest/60 hover:bg-forest/5 transition-colors font-bold"
                >
                  -
                </button>
                <span className="px-3 text-xs font-bold text-forest">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1.5 text-forest/60 hover:bg-forest/5 transition-colors font-bold"
                >
                  +
                </button>
              </div>
            </div>

            <button
              onClick={handleAddCombo}
              className="w-full py-4 bg-forest hover:bg-gold text-cream font-bold rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-forest/10 hover:scale-[1.01]"
            >
              <PlusCircle size={16} />
              {language === 'fr' ? 'Ajouter Formule Matin' : 'Add Morning Combo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
