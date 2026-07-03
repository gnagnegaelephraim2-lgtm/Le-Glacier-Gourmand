import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Search, X } from 'lucide-react';
import { getLocalizedText } from '../data';
import { Category, MenuItem, ProductStats } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useMenu } from '../context/MenuContext';
import { img } from '../utils/image';
import ProductReviewSection from './ProductReviewSection';
import { ReviewService } from '../services/ReviewService';
import StarRating from './StarRating';
import { TRANSLATIONS } from '../data/translations';
import { useCart } from '../context/CartContext';
import HappyBreakfastBuilder from './HappyBreakfastBuilder';
import IceCreamTakeaway from './IceCreamTakeaway';

export default function Menu() {
  const { t, language } = useLanguage();
  const { addItem } = useCart();
  const { menuItems: MENU_ITEMS } = useMenu();
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
  const [activeTag, setActiveTag] = useState<string | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(null);
  const [productStats, setProductStats] = useState<Record<string, ProductStats>>({});
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});

  const handleAddToCart = (item: MenuItem) => {
    addItem(item);
    setAddedItems(prev => ({ ...prev, [item.id]: true }));
    setTimeout(() => setAddedItems(prev => ({ ...prev, [item.id]: false })), 1500);
  };

  useEffect(() => {
    const unsubscribes = MENU_ITEMS.map(item => 
      ReviewService.subscribeToProductStats(item.id, (stats) => {
        if (stats) {
          setProductStats(prev => ({ ...prev, [item.id]: stats }));
        }
      })
    );
    return () => unsubscribes.forEach(unsub => unsub());
  }, []);

  const CATEGORY_CURSOR: Record<string, string> = {
    'hotDrinks': 'drinks',
    'glaces':    'icecream',
    'sucres':    'dessert',
    'frappes':   'drinks',
    'sales':     'lunch',
  };

  const CATEGORY_EMOJI: Record<string, string> = {
    'hotDrinks': '☕',
    'glaces':    '🍦',
    'sucres':    '🥞',
    'frappes':   '🥛',
    'sales':     '🍽️',
  };

  const ITEM_EMOJI: Record<string, string> = {
    'drink-detox':            '🍹',
    'drink-amore-pistacchio': '🥛',
  };

  const categories: { key: Category | 'All'; label: string }[] = [
    { key: 'All', label: t.menu.categories.all },
    { key: 'hotDrinks', label: t.menu.categories.hotDrinks },
    { key: 'glaces', label: t.menu.categories.glaces },
    { key: 'sucres', label: t.menu.categories.sucres },
    { key: 'frappes', label: t.menu.categories.frappes },
    { key: 'sales', label: t.menu.categories.sales },
  ];

  // Extract unique tags and helper to translate
  const allTags: string[] = Array.from(new Set<string>(MENU_ITEMS.flatMap(item => item.tags))).sort();
  
  const getTagLabel = (tag: string) => {
    const frTags = TRANSLATIONS.fr.tags as Record<string, string>;
    const currentTags = (t as any).tags || frTags;
    return currentTags[tag] || frTags[tag] || tag;
  };

  const filteredItems = MENU_ITEMS.filter(item => {
    const categoryMatch = activeCategory === 'All' || item.category === activeCategory;
    const tagMatch = activeTag === 'All' || item.tags.includes(activeTag);
    const searchMatch = searchQuery.trim() === '' ||
      getLocalizedText(item.title, language).toLowerCase().includes(searchQuery.toLowerCase()) ||
      getLocalizedText(item.description, language).toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && tagMatch && searchMatch;
  });

  const artisanales = filteredItems.filter(item => item.subcategory !== 'creations');
  const creations = filteredItems.filter(item => item.subcategory === 'creations');

  const renderMenuItem = (item: MenuItem) => (
    <motion.div
      key={item.id}
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -10 }}
      data-cursor={ITEM_EMOJI[item.id] ?? CATEGORY_CURSOR[item.category] ?? 'icecream'}
      className="bg-cream rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg sm:shadow-xl border border-forest/5 group"
    >
      <div className="aspect-square overflow-hidden relative">
        <img
          key={item.image}
          src={img(item.image, 400)}
          alt={getLocalizedText(item.title, language)}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
          {item.tags.map(tag => (
            <span key={tag} className="px-3 py-1 bg-white/95 backdrop-blur-md shadow-sm text-[10px] font-bold uppercase tracking-tighter rounded-full text-forest">
              {getTagLabel(tag)}
            </span>
          ))}
        </div>
      </div>
      <div className="p-4 sm:p-6 md:p-8">
        <div className="flex justify-between items-start gap-2 mb-2">
          <h3 className="text-lg sm:text-xl md:text-2xl font-serif leading-tight">{getLocalizedText(item.title, language)}</h3>
          <span className="text-gold font-bold shrink-0">{item.price}</span>
        </div>
        
        {/* Rating Display */}
        <div className="flex items-center gap-2 mb-4">
          <StarRating rating={productStats[item.id]?.averageRating || 0} size={10} />
          <span className="text-[10px] text-forest/40 uppercase tracking-widest font-bold">
            {productStats[item.id] ? `${productStats[item.id].averageRating.toFixed(1)} (${productStats[item.id].reviewCount})` : t.menu.noReviews}
          </span>
        </div>

        <p className="text-forest/70 text-sm leading-relaxed mb-4 sm:mb-6">
          {getLocalizedText(item.description, language)}
        </p>

        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={() => handleAddToCart(item)}
            className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
              addedItems[item.id]
                ? 'bg-green-600 text-white'
                : 'bg-forest text-cream hover:bg-gold'
            }`}
          >
            {addedItems[item.id] ? `${ITEM_EMOJI[item.id] ?? CATEGORY_EMOJI[item.category] ?? '✓'} ${(t as any).cart?.added || 'Ajouté'}` : t.menu.cta}
          </button>
          <button 
            onClick={() => setSelectedProduct(item)}
            className="p-3 border border-forest/10 rounded-xl text-forest/40 hover:text-gold hover:border-gold transition-all group/btn"
            title="Voir les avis"
          >
            <MessageSquare size={18} className="group-hover/btn:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    </motion.div>
  );

  const renderNoResults = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="col-span-3 text-center py-20 text-forest/40"
    >
      <span className="text-5xl block mb-4">🍦</span>
      <p className="text-sm font-bold uppercase tracking-widest">
        {t.menu.noResults || 'Aucun résultat trouvé'}
      </p>
    </motion.div>
  );

  return (
    <section id="menu" className="py-12 md:py-24 bg-white/30 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 md:mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-gold font-medium tracking-widest uppercase text-sm mb-4 block"
          >
            {t.menu.tagline}
          </motion.span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl mb-6 md:mb-8">{t.menu.title}</h2>

          {/* Search Bar */}
          <div className="relative max-w-md mx-auto mt-6 mb-2">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-forest/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t.menu.searchPlaceholder || 'Rechercher une glace...'}
              className="w-full pl-10 pr-10 py-3 bg-white border border-forest/10 rounded-full text-sm focus:outline-none focus:border-gold transition-colors shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-forest/30 hover:text-forest transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-4 mt-8">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                data-cursor={cat.key === 'All' ? undefined : CATEGORY_CURSOR[cat.key]}
                className={`px-3 sm:px-5 md:px-6 py-2 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wider transition-all text-center leading-tight ${
                  activeCategory === cat.key
                    ? 'bg-forest text-cream shadow-lg'
                    : 'bg-cream text-forest border border-forest/10 hover:border-gold'
                }`}
              >
                {cat.label.split('|').map((line: string, i: number) => (
                  <span key={i} className="block">{line}</span>
                ))}
              </button>
            ))}
          </div>

          {/* Tag Filter Row - Scrollable horizontally to prevent massive wrapping */}
          <div className="mt-12 w-full">
            <div className="flex overflow-x-auto pb-4 hide-scrollbar gap-2 max-w-5xl mx-auto px-4 justify-start md:justify-center">
              <button
                onClick={() => setActiveTag('All')}
                className={`flex-shrink-0 px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                  activeTag === 'All'
                    ? 'bg-gold text-forest'
                    : 'bg-white text-forest/60 border border-forest/5 hover:border-gold/30'
                }`}
              >
                {t.menu.allTags}
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(activeTag === tag ? 'All' : tag)}
                  className={`flex-shrink-0 px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                    activeTag === tag
                      ? 'bg-gold text-forest'
                      : 'bg-white text-forest/60 border border-forest/5 hover:border-gold/30'
                  }`}
                >
                  {getTagLabel(tag)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {(activeCategory === 'All' || activeCategory === 'sales' || activeCategory === 'hotDrinks') && (
          <HappyBreakfastBuilder />
        )}

        {activeCategory === 'glaces' ? (
          <div className="space-y-16">
            <IceCreamTakeaway />
            {artisanales.length > 0 && (
              <div>
                {/* Premium Vegan Gelato Banner */}
                <div className="mb-10 rounded-3xl bg-forest text-cream overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-gold via-cream/40 to-gold" />
                  <div className="p-6 sm:p-8">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gold/70 mb-3">
                      {language === 'fr' ? 'À propos de nos glaces' : 'About our ice creams'}
                    </p>
                    <h4 className="text-xl sm:text-2xl font-serif text-gold mb-4 leading-snug">
                      Mauritius' First Premium Vegan Gelato.
                    </h4>
                    <p className="text-sm text-cream/75 leading-relaxed font-light mb-6">
                      {language === 'fr'
                        ? "Nous avons créé ce qui n'existait pas — un gelato artisanal d'exception, entièrement vegan, ancré dans l'île Maurice. Sept créations signatures, sept histoires, sept raisons de redécouvrir le plaisir de la glace. Sans compromis sur la qualité. Sans compromis sur vos valeurs. Chaque bac est une promesse — d'ingrédients nobles, de saveurs authentiques, d'un artisanat qui ne se compromet jamais. Goûtez la différence."
                        : "We created what didn't exist — an exceptional artisan gelato, entirely vegan, rooted in Mauritius. Seven signature creations, seven stories, seven reasons to rediscover the pleasure of ice cream. No compromise on quality. No compromise on your values. Every tub is a promise — of noble ingredients, authentic flavours, craftsmanship that never compromises. Taste the difference."}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {[
                        { icon: '🌿', label: language === 'fr' ? 'Sans Gluten' : 'Gluten Free' },
                        { icon: '🌱', label: language === 'fr' ? '100 % Vegan' : '100% Vegan' },
                        { icon: '✅', label: language === 'fr' ? 'Certifié Halal' : 'Halal Certified' },
                      ].map(({ icon, label }) => (
                        <span key={label} className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-cream/10 border border-cream/20 text-xs font-bold uppercase tracking-wider text-cream/90">
                          <span>{icon}</span>
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-8">
                  <h3 className="text-2xl font-serif text-forest whitespace-nowrap">
                    {t.menu.artisanalesHeading || 'Nos Glaces Artisanales'}
                  </h3>
                  <div className="h-[1px] w-full bg-forest/10" />
                </div>
                <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                  <AnimatePresence mode="popLayout">
                    {artisanales.map((item) => renderMenuItem(item))}
                  </AnimatePresence>
                </motion.div>
              </div>
            )}
            {creations.length > 0 && (
              <div>
                <div className="flex items-center gap-4 mb-8">
                  <h3 className="text-2xl font-serif text-forest whitespace-nowrap">
                    {t.menu.creationsHeading || 'Nos Glaces Créations'}
                  </h3>
                  <div className="h-[1px] w-full bg-forest/10" />
                </div>
                <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                  <AnimatePresence mode="popLayout">
                    {creations.map((item) => renderMenuItem(item))}
                  </AnimatePresence>
                </motion.div>
              </div>
            )}
            {filteredItems.length === 0 && renderNoResults()}
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mt-8">
            <AnimatePresence mode="popLayout">
              {filteredItems.length === 0 && renderNoResults()}
              {filteredItems.map((item) => renderMenuItem(item))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {selectedProduct && (
          <ProductReviewSection 
            product={selectedProduct} 
            onClose={() => setSelectedProduct(null)} 
          />
        )}
      </AnimatePresence>
    </section>
  );
}
