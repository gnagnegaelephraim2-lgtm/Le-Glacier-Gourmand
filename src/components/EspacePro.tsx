import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { MenuItem } from '../types';
import { Check, ClipboardList, ShoppingCart, Calendar, Phone, MapPin, Building, FileText, Send } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const FLAVORS = [
  'Pistache de Sicile',
  'Vanille Maurice',
  'Noix de Cajou',
  'Cacahuète Gourmande',
  'Chocolat Noir 70%',
  'Caramel Beurre Salé',
  'Fraise des Champs',
  'Pitaya Rose Sauvage',
  'Mangue de Maurice',
  'Citron Givré',
  'Passion Exotique',
  'Coco Givré'
];

export default function EspacePro() {
  const { language } = useLanguage();
  const { addItem, showToast } = useCart() as any;
  const { showToast: toast } = useToast();

  const [activeTab, setActiveTab] = useState<'catalog' | 'builder'>('catalog');
  
  // Custom Mix states
  const [format, setFormat] = useState<'1/2' | '1kg'>('1/2');
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
  const [flavor1, setFlavor1] = useState<string>(FLAVORS[0]);
  const [flavor2, setFlavor2] = useState<string>(FLAVORS[1]);
  const [flavor3, setFlavor3] = useState<string>(FLAVORS[2]);
  
  const [quantity, setQuantity] = useState(1);
  const [pickupDate, setPickupDate] = useState('');
  
  // Pro Client states
  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyGsm, setCompanyGsm] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'virement' | 'cash'>('virement');
  
  // Checkout & Ref state
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderRef, setOrderRef] = useState('');

  // Localized Labels
  const labels = {
    fr: {
      title: 'ESPACE PROFESSIONNEL & B2B',
      subtitle: 'Portail de Commande pour Glaciers, Hôtels & Restaurants',
      tabCatalog: 'Parfums Disponibles',
      tabBuilder: 'Créateur de Bacs sur Mesure',
      formatSelect: '1. Choisissez le format',
      liquidFormat: '1/2 Litre Liquide (Rs 450)',
      solidFormat: 'Bac 1kg Solide (Rs 750)',
      flavorsSelect: '2. Composez vos parfums',
      flavorsSelectCount: 'Sélectionnez vos parfums (1 à 2 pour les bacs de 1kg, 1 à 3 pour le 1/2 liquide)',
      pickupDate: 'Date de retrait souhaitée',
      qty: 'Quantité',
      addCart: 'Ajouter au Panier Pro',
      contactInfo: 'Informations de l\'Entreprise',
      companyName: 'Nom de l\'entreprise / Client Pro',
      address: 'Adresse de l\'établissement',
      gsm: 'N° de Téléphone / GSM',
      payment: 'Mode de paiement',
      bank: 'Virement Bancaire (Pro-forma)',
      cash: 'Espèces au retrait',
      checkoutBtn: 'Valider ma commande B2B',
      invoiceSummary: 'Facture Pro-Forma & Récapitulatif',
      orderSuccess: 'Commande Pro reçue !',
      whatsappConfirm: 'Confirmer via WhatsApp',
      bankDetails: 'Un e-mail contenant la facture pro-forma et les coordonnées bancaires a été envoyé.',
      catalogTitle: 'Notre Catalogue de Parfums en Gros',
      catalogDesc: 'Sélectionnez des bacs standards de 1kg ou bouteilles de 1/2 liquide.',
    },
    en: {
      title: 'PROFESSIONAL & B2B PORTAL',
      subtitle: 'Wholesale Ordering for Hotels, Restaurants & Cafés',
      tabCatalog: 'Available Flavors',
      tabBuilder: 'Custom Mix & Tub Builder',
      formatSelect: '1. Choose your format',
      liquidFormat: '1/2 Litre Liquid Mix (Rs 450)',
      solidFormat: '1kg Frozen Tub (Rs 750)',
      flavorsSelect: '2. Compose your flavors',
      flavorsSelectCount: 'Select flavors (1-2 for 1kg solid tub, 1-3 for 1/2 liquid mix)',
      pickupDate: 'Desired pickup date',
      qty: 'Quantity',
      addCart: 'Add to Pro Cart',
      contactInfo: 'Company Details',
      companyName: 'Company Name / Pro Client',
      address: 'Company Address',
      gsm: 'Phone Number / GSM',
      payment: 'Payment Method',
      bank: 'Bank Transfer (Pro-forma invoice)',
      cash: 'Cash on pickup',
      checkoutBtn: 'Validate B2B Order',
      invoiceSummary: 'Pro-Forma Invoice & Summary',
      orderSuccess: 'B2B Order Received!',
      whatsappConfirm: 'Confirm via WhatsApp',
      bankDetails: 'An email containing your pro-forma invoice and bank details has been sent.',
      catalogTitle: 'Wholesale Flavors Catalog',
      catalogDesc: 'Select standard 1kg tubs or 1/2 litre liquid mix bottles.',
    }
  };

  const t = language === 'en' ? labels.en : labels.fr;

  const handleCheckboxChange = (flavor: string) => {
    if (selectedFlavors.includes(flavor)) {
      setSelectedFlavors(prev => prev.filter(f => f !== flavor));
    } else {
      if (format === '1kg' && selectedFlavors.length >= 2) {
        toast('Vous pouvez sélectionner maximum 2 parfums pour un bac de 1kg.', 'info', '🍦');
        return;
      }
      setSelectedFlavors(prev => [...prev, flavor]);
    }
  };

  const handleAddCustomToCart = () => {
    let chosen: string[] = [];
    if (format === '1/2') {
      chosen = [flavor1, flavor2, flavor3];
    } else {
      chosen = selectedFlavors;
      if (chosen.length === 0) {
        toast('Veuillez sélectionner au moins 1 parfum.', 'error', '❌');
        return;
      }
    }

    const price = format === '1/2' ? 450 : 750;
    const titleText = format === '1/2' 
      ? `Bac B2B - 1/2 Liquide Mix` 
      : `Bac B2B - 1kg Tub`;

    const customItem: MenuItem = {
      id: `b2b-${format}-${chosen.join('-').replace(/\s+/g, '').toLowerCase()}-${Date.now()}`,
      title: { fr: titleText, en: titleText },
      description: {
        fr: `Taille: ${format === '1/2' ? '1/2 Litre Liquide' : '1kg Solide'} | Parfums: ${chosen.join(', ')} | Date de retrait: ${pickupDate || 'Non spécifiée'}`,
        en: `Size: ${format === '1/2' ? '1/2 Litre Liquid' : '1kg Solid'} | Flavors: ${chosen.join(', ')} | Pickup date: ${pickupDate || 'Not specified'}`
      },
      price: `Rs ${price}`,
      category: 'glaces',
      image: format === '1/2' 
        ? '/images/La-Foresti-re-mushrooms-202603182024.jpg' 
        : '/images/Douceur-Macadamia-Coupe-202603181823.jpg',
      tags: ['B2B Custom', format === '1/2' ? 'Liquide' : '1kg']
    };

    for (let i = 0; i < quantity; i++) {
      addItem(customItem);
    }
    toast(`${titleText} ajouté au panier Pro!`, 'success', '🛒');
  };

  const handleB2BCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !companyAddress.trim() || !companyGsm.trim()) {
      toast('Veuillez remplir toutes les informations d\'entreprise.', 'error', '❌');
      return;
    }

    const ref = 'PRO-' + Math.floor(100000 + Math.random() * 900000);
    setOrderRef(ref);
    setOrderPlaced(true);
    toast('Commande B2B validée !', 'success', '🎉');
  };

  const triggerWhatsApp = () => {
    const lines = [
      `💼 Nouvelle Commande Professionnelle B2B - Le Glacier Gourmand`,
      `Réf: ${orderRef}`,
      `---------------------------------------`,
      `🏢 Entreprise: ${companyName}`,
      `📍 Adresse: ${companyAddress}`,
      `📞 GSM: ${companyGsm}`,
      `📅 Date de retrait souhaitée: ${pickupDate || 'Non spécifiée'}`,
      `💳 Mode de paiement: ${paymentMethod === 'virement' ? 'Virement Bancaire (Pro-forma)' : 'Espèces au retrait'}`,
      `---------------------------------------`,
      `📦 Détails du Mix:`,
      `Format: ${format === '1/2' ? '1/2 Litre Liquide' : '1kg Solide'}`,
      `Quantité: ${quantity}x`,
      `Parfums: ${format === '1/2' ? [flavor1, flavor2, flavor3].join(', ') : selectedFlavors.join(', ')}`,
      `Prix total estimé: Rs ${quantity * (format === '1/2' ? 450 : 750)}`
    ];

    const url = `https://wa.me/+23059890767?text=${encodeURIComponent(lines.join('\n'))}`;
    window.open(url, '_blank');
  };

  return (
    <section id="espace-pro" className="py-24 bg-cream text-forest relative">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Banner Section */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-gold font-medium tracking-widest uppercase text-sm mb-4 block"
          >
            B2B
          </motion.span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-6 font-serif">{t.title}</h2>
          <p className="text-forest/70 text-base max-w-2xl mx-auto font-light leading-relaxed">
            {t.subtitle}
          </p>
          <div className="w-24 h-1 bg-gold mx-auto mt-8" />
        </div>

        {/* Tab Controls */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 mb-12">
          <button
            onClick={() => { setActiveTab('catalog'); setOrderPlaced(false); }}
            className={`px-6 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
              activeTab === 'catalog'
                ? 'bg-forest text-cream shadow-xl shadow-forest/10'
                : 'bg-white text-forest border border-forest/10 hover:border-gold'
            }`}
          >
            <ClipboardList size={14} />
            {t.tabCatalog}
          </button>
          <button
            onClick={() => { setActiveTab('builder'); setOrderPlaced(false); }}
            className={`px-6 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
              activeTab === 'builder'
                ? 'bg-forest text-cream shadow-xl shadow-forest/10'
                : 'bg-white text-forest border border-forest/10 hover:border-gold'
            }`}
          >
            <ShoppingCart size={14} />
            {t.tabBuilder}
          </button>
        </div>

        {/* Layout Switcher */}
        <AnimatePresence mode="wait">
          {!orderPlaced ? (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'catalog' ? (
                // TAB 1: Catalog
                <div className="bg-white/40 backdrop-blur-md rounded-3xl p-8 border border-forest/10 shadow-2xl max-w-5xl mx-auto">
                  <div className="mb-10 text-center">
                    <h3 className="text-2xl font-serif text-forest">{t.catalogTitle}</h3>
                    <p className="text-xs text-forest/50 mt-2">{t.catalogDesc}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {FLAVORS.map(flavor => (
                      <div key={flavor} className="bg-white rounded-2xl p-5 border border-forest/5 shadow-md flex flex-col justify-between hover:scale-[1.02] hover:border-gold transition-all duration-300">
                        <div>
                          <span className="text-xl block mb-2">🍦</span>
                          <h4 className="text-sm font-bold text-forest">{flavor}</h4>
                          <p className="text-[10px] text-forest/40 uppercase tracking-widest mt-1">Wholesale Pro</p>
                        </div>
                        <button
                          onClick={() => {
                            const catalogItem: MenuItem = {
                              id: `b2b-catalog-${flavor.replace(/\s+/g, '-').toLowerCase()}`,
                              title: { fr: `${flavor} (Bac Pro 1kg)`, en: `${flavor} (Wholesale Pro 1kg)` },
                              description: {
                                fr: `Bac de 1kg d'ice cream premium pour grossiste.`,
                                en: `1kg wholesale tub of premium ice cream.`
                              },
                              price: 'Rs 750',
                              category: 'glaces',
                              image: '/images/Douceur-Macadamia-Coupe-202603181823.jpg',
                              tags: ['B2B', 'Bac 1kg']
                            };
                            addItem(catalogItem);
                            toast(`${flavor} ajouté au panier Pro!`, 'success', '🛒');
                          }}
                          className="mt-4 w-full py-2 bg-forest/5 hover:bg-forest hover:text-cream text-forest text-[9px] font-bold uppercase tracking-wider rounded-xl transition-all"
                        >
                          + {language === 'fr' ? 'Ajouter 1kg' : 'Add 1kg'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                // TAB 2: Custom Tub/Mix Builder
                <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto items-start">
                  
                  {/* Left Column: Configuration */}
                  <div className="bg-white/50 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-forest/10 shadow-2xl space-y-8">
                    
                    {/* Size Select */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-forest/40 mb-3">
                        {t.formatSelect}
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => { setFormat('1/2'); setSelectedFlavors([]); }}
                          className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                            format === '1/2'
                              ? 'border-forest bg-forest/5 text-forest'
                              : 'border-forest/10 bg-white text-forest/60 hover:border-gold'
                          }`}
                        >
                          <span className="text-xl">🧴</span>
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wide mt-2">1/2 Litre Liquide</p>
                            <p className="text-[10px] text-gold font-bold mt-1">Rs 450</p>
                          </div>
                        </button>

                        <button
                          onClick={() => setFormat('1kg')}
                          className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                            format === '1kg'
                              ? 'border-forest bg-forest/5 text-forest'
                              : 'border-forest/10 bg-white text-forest/60 hover:border-gold'
                          }`}
                        >
                          <span className="text-xl">📦</span>
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wide mt-2">Bac 1kg Solide</p>
                            <p className="text-[10px] text-gold font-bold mt-1">Rs 750</p>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Flavors Select */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-forest/40 mb-3">
                        {t.flavorsSelect}
                      </h4>
                      <p className="text-[10px] text-forest/50 mb-4">{t.flavorsSelectCount}</p>

                      {format === '1/2' ? (
                        /* 1/2 Litre Mix Dropdowns */
                        <div className="space-y-3">
                          <div>
                            <label className="text-[10px] text-forest/40 uppercase tracking-widest font-bold block mb-1">Parfum 1</label>
                            <select
                              value={flavor1}
                              onChange={e => setFlavor1(e.target.value)}
                              className="w-full px-4 py-3 rounded-xl border border-forest/10 bg-white text-sm"
                            >
                              {FLAVORS.map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] text-forest/40 uppercase tracking-widest font-bold block mb-1">Parfum 2</label>
                            <select
                              value={flavor2}
                              onChange={e => setFlavor2(e.target.value)}
                              className="w-full px-4 py-3 rounded-xl border border-forest/10 bg-white text-sm"
                            >
                              {FLAVORS.map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] text-forest/40 uppercase tracking-widest font-bold block mb-1">Parfum 3</label>
                            <select
                              value={flavor3}
                              onChange={e => setFlavor3(e.target.value)}
                              className="w-full px-4 py-3 rounded-xl border border-forest/10 bg-white text-sm"
                            >
                              {FLAVORS.map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                          </div>
                        </div>
                      ) : (
                        /* 1kg Solid Checkboxes */
                        <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto border border-forest/10 p-4 rounded-2xl bg-white">
                          {FLAVORS.map(flavor => {
                            const isChecked = selectedFlavors.includes(flavor);
                            return (
                              <label key={flavor} className="flex items-center gap-2 text-xs font-semibold text-forest cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleCheckboxChange(flavor)}
                                  className="accent-forest"
                                />
                                <span className={isChecked ? 'text-forest' : 'text-forest/60'}>{flavor}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Quantity & Date */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-forest/40 block mb-2">{t.qty}</label>
                        <div className="flex items-center border border-forest/10 rounded-xl bg-white overflow-hidden w-full max-w-[120px]">
                          <button 
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="px-3 py-2 text-forest/60 hover:bg-forest/5 transition-colors font-bold"
                          >
                            -
                          </button>
                          <span className="flex-1 text-center text-xs font-bold text-forest">{quantity}</span>
                          <button 
                            onClick={() => setQuantity(quantity + 1)}
                            className="px-3 py-2 text-forest/60 hover:bg-forest/5 transition-colors font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-forest/40 block mb-2">{t.pickupDate}</label>
                        <input
                          type="date"
                          value={pickupDate}
                          onChange={e => setPickupDate(e.target.value)}
                          className="w-full px-4 py-2 text-xs border border-forest/10 rounded-xl bg-white focus:outline-none focus:border-gold"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleAddCustomToCart}
                      className="w-full py-4 bg-forest hover:bg-gold text-cream font-bold rounded-2xl text-[11px] uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
                    >
                      {t.addCart}
                    </button>
                  </div>

                  {/* Right Column: Pro Checkout Details */}
                  <form onSubmit={handleB2BCheckout} className="bg-cream rounded-3xl p-6 sm:p-8 border border-gold/20 shadow-xl space-y-6">
                    <h3 className="text-xl font-serif text-forest flex items-center gap-2">
                      <Building size={20} className="text-gold" />
                      {t.contactInfo}
                    </h3>
                    
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={companyName}
                        onChange={e => setCompanyName(e.target.value)}
                        placeholder={t.companyName}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-forest/10 bg-white text-sm"
                      />
                      <input
                        type="text"
                        value={companyAddress}
                        onChange={e => setCompanyAddress(e.target.value)}
                        placeholder={t.address}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-forest/10 bg-white text-sm"
                      />
                      <input
                        type="tel"
                        value={companyGsm}
                        onChange={e => setCompanyGsm(e.target.value)}
                        placeholder={t.gsm}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-forest/10 bg-white text-sm"
                      />
                    </div>

                    <div className="border-t border-forest/10 pt-4">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-forest/40 block mb-3">{t.payment}</label>
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('virement')}
                          className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left text-xs font-bold ${
                            paymentMethod === 'virement'
                              ? 'border-forest bg-forest/5 text-forest'
                              : 'border-forest/5 bg-white text-forest/60'
                          }`}
                        >
                          <span className="text-lg">🏦</span>
                          <span>{t.bank}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('cash')}
                          className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left text-xs font-bold ${
                            paymentMethod === 'cash'
                              ? 'border-forest bg-forest/5 text-forest'
                              : 'border-forest/5 bg-white text-forest/60'
                          }`}
                        >
                          <span className="text-lg">💵</span>
                          <span>{t.cash}</span>
                        </button>
                      </div>
                    </div>

                    {/* Order summary math */}
                    <div className="bg-white rounded-2xl p-4 border border-forest/5">
                      <div className="flex justify-between text-xs font-bold text-forest/50 uppercase tracking-wider mb-2">
                        <span>Format</span>
                        <span>Total</span>
                      </div>
                      <div className="flex justify-between text-sm text-forest">
                        <span>{quantity}x {format === '1/2' ? '1/2 Litre' : '1kg Tub'}</span>
                        <span>Rs {quantity * (format === '1/2' ? 450 : 750)}</span>
                      </div>
                      <div className="border-t border-forest/10 mt-3 pt-3 flex justify-between text-sm font-bold">
                        <span className="text-forest">Total HT (Excl. Tax)</span>
                        <span className="text-gold">Rs {quantity * (format === '1/2' ? 450 : 750)}</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 bg-forest hover:bg-gold text-cream font-bold rounded-2xl text-[11px] uppercase tracking-widest transition-all duration-300"
                    >
                      {t.checkoutBtn}
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          ) : (
            // TAB 3: B2B Order Confirmed
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-2xl mx-auto bg-white rounded-3xl p-8 border border-gold/20 shadow-2xl space-y-8 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto text-green-600">
                <Check size={40} />
              </div>

              <div>
                <h3 className="text-3xl font-serif text-forest mb-2">{t.orderSuccess}</h3>
                <p className="text-xs font-bold uppercase tracking-widest text-gold">Ref: {orderRef}</p>
              </div>

              {/* Order breakdown */}
              <div className="bg-cream rounded-2xl p-6 text-left border border-forest/5 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-forest/50 flex items-center gap-2">
                  <FileText size={16} />
                  {t.invoiceSummary}
                </h4>

                <div className="space-y-2 text-sm text-forest font-light">
                  <p><strong>{language === 'fr' ? 'Entreprise' : 'Company'}:</strong> {companyName}</p>
                  <p><strong>GSM:</strong> {companyGsm}</p>
                  <p><strong>Adresse:</strong> {companyAddress}</p>
                  <p><strong>{language === 'fr' ? 'Date de retrait' : 'Pickup date'}:</strong> {pickupDate || 'Non spécifiée'}</p>
                  <p><strong>{language === 'fr' ? 'Mode de paiement' : 'Payment'}:</strong> {paymentMethod === 'virement' ? t.bank : t.cash}</p>
                </div>

                <div className="border-t border-forest/10 pt-4 flex justify-between font-bold text-base text-forest">
                  <span>Total</span>
                  <span className="text-gold">Rs {quantity * (format === '1/2' ? 450 : 750)}</span>
                </div>
              </div>

              <p className="text-sm text-forest/60">
                {t.bankDetails}
              </p>

              <div className="flex gap-4">
                <button
                  onClick={() => setOrderPlaced(false)}
                  className="flex-1 py-4 border border-forest/20 text-forest font-bold rounded-2xl text-xs uppercase tracking-widest hover:bg-forest/5 transition-all"
                >
                  ← {language === 'fr' ? 'Nouvelle Commande' : 'New Order'}
                </button>
                <button
                  onClick={triggerWhatsApp}
                  className="flex-1 py-4 bg-green-600 text-white font-bold rounded-2xl text-xs uppercase tracking-widest hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                >
                  <Send size={16} />
                  {t.whatsappConfirm}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
