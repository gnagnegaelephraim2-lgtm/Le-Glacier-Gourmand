/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Story from './components/Story';
import Commitment from './components/Commitment';
import Menu from './components/Menu';
import Desserts from './components/Desserts';
import Gallery from './components/Gallery';
import Events from './components/Events';
import Reviews from './components/Reviews';
import Footer from './components/Footer';
import AIChat from './components/AIChat';
import Preloader from './components/Preloader';
import CustomCursor from './components/CustomCursor';
import ScrollProgressBar from './components/ScrollProgressBar';
import BackToTop from './components/BackToTop';
import WhatsAppButton from './components/WhatsAppButton';
import { LanguageProvider } from './context/LanguageContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';

export default function App() {
  return (
    <LanguageProvider>
      <ToastProvider>
        <CartProvider>
          <CustomCursor />
          <ScrollProgressBar />
          <Preloader />
          <div className="min-h-screen selection:bg-gold selection:text-forest">
            <Navbar />
            <main>
              <Hero />
              <Story />
              <Commitment />
              <Menu />
              <Desserts />
              <Events />
              <Gallery />
              <Reviews />
            </main>
            <Footer />
            <AIChat />
            <CartDrawer />
            <CheckoutModal />
            <WhatsAppButton />
            <BackToTop />
          </div>
        </CartProvider>
      </ToastProvider>
    </LanguageProvider>
  );
}
