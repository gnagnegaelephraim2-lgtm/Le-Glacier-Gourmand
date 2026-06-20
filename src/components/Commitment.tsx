import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { img } from '../utils/image';
import { ChefHat, Flame, Croissant } from 'lucide-react';

export default function Commitment() {
  const { t, language } = useLanguage();

  const columns = [
    {
      icon: <ChefHat className="text-gold" size={36} />,
      title: language === 'fr' ? 'Les Salés & Omelettes' : 'Savory & Omelettes',
      desc: language === 'fr' 
        ? 'Gaufres salées et crêpes de sarrasin sans gluten garnies de saumon, avocat ou champignons frais, accompagnées de nos omelettes moelleuses.'
        : 'Savory waffles and gluten-free buckwheat crepes topped with fresh salmon, avocado, or mushrooms, paired with our fluffy omelettes.',
      items: language === 'fr'
        ? ['Saumon & Avocat', 'Champignons & 3 Fromages', 'Omelette & 3 Fromages', '100% Ingrédients Frais']
        : ['Salmon & Avocado', 'Mushrooms & 3-Cheese', 'Omelette & 3-Cheese', '100% Fresh Ingredients']
    },
    {
      icon: <Flame className="text-gold" size={36} />,
      title: language === 'fr' ? 'Créations & Desserts' : 'Signature Desserts',
      desc: language === 'fr'
        ? 'Nos desserts d’exception conçus sur assiette : fondants au chocolat chaud, bananes caramélisées et coupes signatures de gelato.'
        : 'Plated creations designed to delight: warm chocolate fondants, local caramelized bananas, and signature gelato cups.',
      items: language === 'fr'
        ? ['Banana Split Gourmand', 'Rêve de Chocolat Fondant', 'Coupe Macadamia', 'L\'Or de Moris']
        : ['Gourmet Banana Split', 'Chocolate Fondant Dream', 'Macadamia Delight', 'The Gold of Moris']
    },
    {
      icon: <Croissant className="text-gold" size={36} />,
      title: language === 'fr' ? 'Les Sucrés & Glaces' : 'Sweet Treats & Gelato',
      desc: language === 'fr'
        ? 'Notre gelato 100% naturel, sorbets plein fruit intenses et gaufres croustillantes dorées avec toppings artisanaux offerts.'
        : 'Our 100% natural gelato, intense full-fruit sorbets, and crispy golden waffles served with free gourmet toppings.',
      items: language === 'fr'
        ? ['12+ Glaces Régulières & Veganes', 'Gaufres Banane & Caramel', 'Sorbets Exotiques', 'Toppings Offerts']
        : ['12+ Regular & Vegan Flavors', 'Banana & Caramel Waffles', 'Seasonal Exotic Sorbets', 'Free Toppings']
    }
  ];

  const creations = [
    { url: 'https://i.ibb.co/DHXN6svQ/Banana-Split-Gourmand-202603182224.jpg', title: 'Banana Split' },
    { url: 'https://i.ibb.co/BHCS2hHP/Warm-chocolate-cake-202603182228.jpg', title: 'Fondant Chocolat' },
    { url: 'https://i.ibb.co/Z1LN4KCD/Douceur-Macadamia-Coupe-202603181823.jpg', title: 'Coupe Macadamia' },
    { url: 'https://i.ibb.co/27jDZDxy/Gaufre-aux-fruits-202603181659.jpg', title: 'Gaufre aux Fruits' },
    { url: 'https://i.ibb.co/ns1Yd23r/Cr-pe-Salmon-Avocado-202603182013.jpg', title: 'Crêpe Saumon' },
    { url: 'https://i.ibb.co/fYmm9b3T/Generate-Chocolat-Icre-cream-202603181857.jpg', title: 'Terre Chocolat' }
  ];

  return (
    <section id="savoir-faire" className="py-24 bg-forest text-cream relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <span className="text-gold font-medium tracking-widest uppercase text-sm mb-4 block">
            {language === 'fr' ? 'Savoir-faire Unique' : 'Unique Expertise'}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl mb-6 font-serif text-cream">
            {language === 'fr' ? 'NOTRE SAVOIR-FAIRE' : 'OUR EXPERTISE'}
          </h2>
          <div className="w-24 h-1 bg-gold mx-auto mb-8" />
          <h3 className="text-xl md:text-2xl italic text-cream/90 mb-8 font-light max-w-2xl mx-auto">
            {language === 'fr' 
              ? 'Une harmonie parfaite entre traditions artisanales et produits locaux de Maurice.'
              : 'A perfect harmony between artisanal traditions and local Mauritian products.'}
          </h3>
        </motion.div>

        {/* 3 Columns Layout */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10 mb-16 md:mb-24 max-w-6xl mx-auto text-left">
          {columns.map((col, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15 }}
              className="bg-white/[0.03] border border-white/10 rounded-3xl p-5 md:p-8 hover:border-gold/30 hover:bg-white/[0.05] transition-all duration-500 shadow-xl"
            >
              <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center mb-6">
                {col.icon}
              </div>
              <h4 className="text-2xl font-serif text-gold mb-4">{col.title}</h4>
              <p className="text-cream/70 text-sm leading-relaxed mb-6 font-light">{col.desc}</p>
              <ul className="space-y-2.5 border-t border-white/5 pt-6">
                {col.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-cream/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Carousel / Slideshow of Creations */}
        <div className="mt-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-10 text-center"
          >
            <h3 className="text-3xl font-serif text-cream">
              {language === 'fr' ? 'Nos Créations' : 'Our Creations'}
            </h3>
            <p className="text-cream/50 text-sm mt-2">
              {language === 'fr' ? 'Faites glisser pour explorer nos spécialités' : 'Swipe to explore our specialties'}
            </p>
          </motion.div>

          <div className="relative w-full overflow-hidden py-4">
            <div className="flex gap-6 overflow-x-auto pb-8 hide-scrollbar px-6 md:justify-center">
              {creations.map((item, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="flex-shrink-0 w-64 h-80 rounded-2xl overflow-hidden relative shadow-2xl border border-white/5 group cursor-pointer"
                >
                  <img 
                    src={img(item.url, 400)} 
                    alt={item.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 brightness-[0.8]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent flex items-end p-6">
                    <div>
                      <span className="text-[10px] font-bold tracking-widest text-gold uppercase">Artisanal</span>
                      <h4 className="text-lg font-serif text-white mt-1">{item.title}</h4>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
