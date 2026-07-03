import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Coffee, Clock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function HappyBreakfastBuilder() {
  const { language } = useLanguage();

  // Simulation states
  const [isSimulated, setIsSimulated] = useState(true);
  const [isPromoActive, setIsPromoActive] = useState(true);

  // Configuration states
  const [base, setBase] = useState<'gaufre' | 'crepe'>('gaufre');
  const [topping, setTopping] = useState<string>('Caramel Beurre Salé');

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
    ? ['Sauce Chocolat Noir Maison', 'Caramel Mou Maison', 'Confiture Artisanale Moris']
    : ['Homemade Dark Chocolate Sauce', 'Homemade Soft Caramel', 'Artisanal Moris Jam'];

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


  return (
    <div className="max-w-4xl mx-auto my-8 sm:my-12 bg-white/70 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-forest/10 shadow-2xl relative overflow-hidden">
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-gold via-forest to-gold" />

      {/* Simulator Control */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
        <label className="text-[10px] font-bold uppercase tracking-wider text-forest/60 select-none cursor-pointer flex items-center gap-1.5 bg-cream px-2.5 py-2 rounded-full border border-forest/5 hover:border-gold transition-colors min-h-[36px] min-w-[36px]">
          <input
            type="checkbox"
            checked={isSimulated}
            onChange={(e) => setIsSimulated(e.target.checked)}
            className="accent-forest"
          />
          <span className="hidden sm:inline">{language === 'fr' ? 'Simuler Happy Hours' : 'Simulate Happy Hours'}</span>
        </label>
      </div>

      <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-start mt-8 sm:mt-6">
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
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-forest/40">Total</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-forest/30 line-through">Rs {regularTotal}</span>
                  <span className="text-3xl font-serif font-bold text-gold">Rs {isPromoActive ? promoTotal : regularTotal}</span>
                </div>
              </div>
            </div>

            <div className="w-full py-3 px-4 bg-gold/10 border border-gold/30 rounded-2xl flex items-center justify-center gap-2">
              <Clock size={15} className="text-gold shrink-0" />
              <p className="text-[11px] font-bold uppercase tracking-widest text-forest/70 text-center">
                {language === 'fr'
                  ? 'Commande en salon · 08:30 – 10:30'
                  : 'Order in-store · 08:30 – 10:30'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
