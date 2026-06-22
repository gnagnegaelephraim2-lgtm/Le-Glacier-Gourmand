import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getLocalizedText } from '../data';
import { img } from '../utils/image';

export default function Desserts() {
  const { t, language } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);

  const signaturePlats = [
    {
      title: {
        fr: "Gaufre Saumon & Avocat",
        en: "Salmon & Avocado Waffle",
        cr: "Gofr Somon ek Avoka",
        ar: "وافل السلمون والأفوكادو",
        hi: "सामन और एवोकैडो वेफल",
        zh: "三文鱼牛油果华夫饼"
      },
      ingredients: {
        fr: "Gaufre de Bruxelles sans gluten, saumon fumé premium, avocat écrasé, fromage frais aux herbes, roquette sauvage, filet de citron.",
        en: "Gluten-free Brussels waffle, premium smoked salmon, mashed avocado, herb cream cheese, wild arugula, lemon drizzle.",
        cr: "Gofr san gliten, somon fime premium, avoka ekraze, krim fwamaz ar zerb, roket sovaz, sitron.",
        ar: "وافل خالي من الجلوتين، سلمون مدخن ممتاز، أفوكادو مهروس، جبنة كريمية بالأعشاب، جرجير بري، قطرات ليمون.",
        hi: "ग्लूटन-मुक्त वेफल, प्रीमियम स्मोक्ड सामन, मैश किया हुआ एवोकैडो, हर्ब क्रीम चीज़, जंगली अरुगुला, नींबू का रस।",
        zh: "无麸质布鲁塞尔华夫饼，优质熏三文鱼，牛油果泥，香草奶油芝士，野生芝麻菜，柠檬汁。"
      },
      price: "Rs 380",
      image: "/images/Gaufre-salmon-avocado-202603181957.jpg"
    },
    {
      title: {
        fr: "Gaufre Champignons Sauvages",
        en: "Wild Mushroom Waffle",
        cr: "Gofr Samignon Sovaz",
        ar: "وافل الفطر البري",
        hi: "जंगली मशरूम वेफल",
        zh: "野生菌菇华夫饼"
      },
      ingredients: {
        fr: "Gaufre croustillante sans gluten, fricassée de champignons (pleurotes, cèpes), crème d'ail rôti, copeaux de parmesan, persil frais.",
        en: "Crunchy gluten-free waffle, sautéed wild mushrooms (oyster, porcini), roasted garlic cream, parmesan shavings, fresh parsley.",
        cr: "Gofr san gliten, fricassee samignon, laktet lay rotye, kopo parmesan, persil fre.",
        ar: "وافل مقرمش خالي من الجلوتين، فطر بري سوتيه، كريمة الثوم المحمص، رقائق البارميزان، بقدونس طازج.",
        hi: "कुरकुरा ग्लूटन-मुक्त वेफल, सौतेले जंगली मशरूम, भुना हुआ लहसुन क्रीम, परमेसन शेविंग्स, ताजा अजमोद।",
        zh: "无麸质酥脆华夫饼，分切野生菌菇（平菇、牛肝菌），烤大蒜奶油，帕马森干酪碎，新鲜欧芹。"
      },
      price: "Rs 340",
      image: "/images/Gaufre-Champignons-3-202603181958.jpg"
    },
    {
      title: {
        fr: "Gaufre Omelette & 3 Fromages",
        en: "Omelette & 3 Cheeses Waffle",
        cr: "Gofr Omelet ek 3 Fromaz",
        ar: "وافل الأومليت والأجبان الثلاثة",
        hi: "ऑमलेट और 3 चीज़ वेफल",
        zh: "煎蛋三色芝士华夫饼"
      },
      ingredients: {
        fr: "Gaufre légère sans gluten, omelette soufflée aux œufs bio, cheddar affiné, mozzarella, emmental, ciboulette.",
        en: "Light gluten-free waffle, souffléed organic egg omelette, aged cheddar, mozzarella, emmental, fresh chives.",
        cr: "Gofr san gliten, omelet dize bio, cheddar, mozzarella, emmental, ciboulet.",
        ar: "وافل خفيف خالي من الجلوتين، أومليت بيض عضوي، جبن شيدر، موزاريللا، إيمنتال، ثوم معمر.",
        hi: "हल्का ग्लूटन-मुक्त वेफल, जैविक अंडे का ऑमलेट, वृद्ध चेडर, मोज़ारेला, एमेंटल, ताज़ा चाइव्स।",
        zh: "无麸质轻盈华夫饼，有机蛋制作蓬松煎蛋，陈年切达干酪，马苏里拉，大孔干酪，新鲜细香葱。"
      },
      price: "Rs 320",
      image: "/images/Gaufre-Omelette-3-202603182003.jpg"
    },
    {
      title: {
        fr: "Pain Perdu Brioché",
        en: "Brioche French Toast",
        cr: "Dipen Perdi Briose",
        ar: "توست فرنسي بالبريوش",
        hi: "ब्रियोश फ्रेंच टोस्ट",
        zh: "法式黄油面包吐司"
      },
      ingredients: {
        fr: "Brioche maison dorée, caramel de sucre de canne local, crème anglaise infusée à la vanille de Moris, coulis de fruits frais.",
        en: "Golden homemade brioche, local cane sugar caramel, custard sauce infused with Mauritian vanilla, fresh fruit coulis.",
        cr: "Dipen briose dore, karamel disik kann lokal, krem angle infusyone ar vaniy Moris, kouli fri fre.",
        ar: "خبز بريوش منزلي ذهبي، كراميل سكر القصب المحلي، صلصة كاسترد بنكهة فانيليا موريشيوس، كوليس الفاكهة الطازجة.",
        hi: "सुनहरा घर का बना ब्रियोश, स्थानीय गन्ने की चीनी का कैरेमल, मॉरीशस वेनिला युक्त कस्टर्ड सॉस, ताज़ा फलों का कूलिस।",
        zh: "金黄自制法式面包，本地甘蔗糖焦糖，毛里求斯香草卡仕达酱，新鲜水果酱。"
      },
      price: "Rs 290",
      image: "/images/Brioche-perdue-caramel-202603182021.jpg"
    }
  ];

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % signaturePlats.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + signaturePlats.length) % signaturePlats.length);

  return (
    <section id="plats-signature" className="py-16 md:py-24 bg-forest text-cream overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">

        {/* Full-width presentation text */}
        <div className="max-w-3xl mx-auto text-center mb-20">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-gold font-medium tracking-widest uppercase text-sm block mb-4"
          >
            {t.desserts.tagline}
          </motion.span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight mb-8 md:mb-10">
            <span className="block">{t.desserts.title}</span>
            <span className="italic font-light">{t.desserts.titleItalic}</span>
          </h2>
          <div className="text-cream/80 text-base leading-relaxed space-y-5 text-left">
            {t.desserts.description.split('\n\n').map((p: string, i: number) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>

        {/* Wide slideshow of past creations */}
        <div className="relative max-w-5xl mx-auto">
          <div className="overflow-hidden rounded-3xl border border-cream/10 shadow-2xl">
            {/* popLayout keeps container height stable during transitions, preventing page scroll */}
            <AnimatePresence mode="popLayout">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -60 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="grid md:grid-cols-2"
              >
                {/* Photo */}
                <div className="relative aspect-video sm:aspect-square md:aspect-auto md:min-h-[380px] lg:min-h-[420px] overflow-hidden">
                  <img
                    src={img(signaturePlats[currentIndex].image, 800)}
                    alt={getLocalizedText(signaturePlats[currentIndex].title, language)}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-forest/60 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-forest/30" />
                  <div className="absolute top-4 left-4 bg-gold text-forest px-4 py-1.5 rounded-full font-bold text-sm shadow-md">
                    {signaturePlats[currentIndex].price}
                  </div>
                </div>

                {/* Info */}
                <div className="bg-cream/5 p-10 flex flex-col justify-center space-y-6">
                  <div>
                    <p className="text-gold/70 text-[10px] font-bold uppercase tracking-widest mb-3">Création du jour</p>
                    <h3 className="text-3xl font-serif text-gold leading-snug">
                      {getLocalizedText(signaturePlats[currentIndex].title, language)}
                    </h3>
                  </div>
                  <div className="h-[1px] w-16 bg-gold/30" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-cream/40 mb-2">Ingrédients</p>
                    <p className="text-cream/75 text-sm leading-relaxed italic">
                      {getLocalizedText(signaturePlats[currentIndex].ingredients, language)}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 px-2">
            {/* Progress dots */}
            <div className="flex gap-2">
              {signaturePlats.map((_, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentIndex === i ? 'w-8 bg-gold' : 'w-2 bg-cream/20 hover:bg-cream/40'
                  }`}
                  aria-label={`Aller à la création ${i + 1}`}
                />
              ))}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={prevSlide}
                className="p-3 bg-cream/10 hover:bg-gold hover:text-forest rounded-full transition-all border border-cream/10"
                aria-label="Création précédente"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={nextSlide}
                className="p-3 bg-cream/10 hover:bg-gold hover:text-forest rounded-full transition-all border border-cream/10"
                aria-label="Création suivante"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
