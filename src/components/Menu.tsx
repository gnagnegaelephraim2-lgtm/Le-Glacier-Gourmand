import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Star } from 'lucide-react';
import { MENU_ITEMS, getLocalizedText } from '../data';
import { Category, MenuItem, ProductStats } from '../types';
import { useLanguage } from '../context/LanguageContext';
import ProductReviewSection from './ProductReviewSection';
import { ReviewService } from '../services/ReviewService';
import StarRating from './StarRating';
import { TRANSLATIONS } from '../data/translations';

export default function Menu() {
  const { t, language } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
  const [activeTag, setActiveTag] = useState<string | 'All'>('All');
  const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(null);
  const [productStats, setProductStats] = useState<Record<string, ProductStats>>({});

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

  const categories: { key: Category | 'All'; label: string }[] = [
    { key: 'All', label: t.menu.categories.all },
    { key: 'Ice Cream', label: t.menu.categories.iceCream },
    { key: 'Sorbet', label: t.menu.categories.sorbet },
    { key: 'Desserts', label: t.menu.categories.desserts },
    { key: 'Drinks', label: t.menu.categories.drinks },
    { key: 'Breakfast', label: t.menu.categories.breakfast },
    { key: 'Lunch', label: t.menu.categories.lunch },
  ];

  // Extract unique tags and helper to translate
  const allTags = Array.from(new Set(MENU_ITEMS.flatMap(item => item.tags))).sort();
  
  const getTagLabel = (tag: string) => {
    const frTags = TRANSLATIONS.fr.tags as Record<string, string>;
    const currentTags = (t as any).tags || frTags;
    return currentTags[tag] || frTags[tag] || tag;
  };

  const filteredItems = MENU_ITEMS.filter(item => {
    const categoryMatch = activeCategory === 'All' || item.category === activeCategory;
    const tagMatch = activeTag === 'All' || item.tags.includes(activeTag);
    return categoryMatch && tagMatch;
  });

  return (
    <section id="menu" className="py-24 bg-white/30 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-gold font-medium tracking-widest uppercase text-sm mb-4 block"
          >
            {t.menu.tagline}
          </motion.span>
          <h2 className="text-4xl md:text-5xl mb-8">{t.menu.title}</h2>
          
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-4 sm:px-8 py-3 rounded-full text-sm font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeCategory === cat.key 
                    ? 'bg-forest text-cream shadow-lg' 
                    : 'bg-cream text-forest border border-forest/10 hover:border-gold'
                }`}
              >
                {cat.label}
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

        <motion.div 
          layout
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -10 }}
                className="bg-cream rounded-3xl overflow-hidden shadow-xl border border-forest/5 group"
              >
                <div className="aspect-square overflow-hidden relative">
                  <img
                    key={item.image}
                    src={item.image}
                    alt={getLocalizedText(item.title, language)}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                    {item.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-white/95 backdrop-blur-md shadow-sm text-[10px] font-bold uppercase tracking-tighter rounded-full text-forest">
                        {getTagLabel(tag)}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-2xl font-serif">{getLocalizedText(item.title, language)}</h3>
                    <span className="text-gold font-bold">{item.price}</span>
                  </div>
                  
                  {/* Rating Display */}
                  <div className="flex items-center gap-2 mb-4">
                    <StarRating rating={productStats[item.id]?.averageRating || 0} size={10} />
                    <span className="text-[10px] text-forest/40 uppercase tracking-widest font-bold">
                      {productStats[item.id] ? `${productStats[item.id].averageRating.toFixed(1)} (${productStats[item.id].reviewCount})` : t.menu.noReviews}
                    </span>
                  </div>

                  <p className="text-forest/70 text-sm leading-relaxed mb-6">
                    {getLocalizedText(item.description, language)}
                  </p>
                  
                  <div className="flex gap-3">
                    <button className="flex-1 py-3 bg-forest text-cream rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-gold transition-all">
                      {t.menu.cta}
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
            ))}
          </AnimatePresence>
        </motion.div>
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
