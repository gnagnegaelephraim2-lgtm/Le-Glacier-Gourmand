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
import { LanguageProvider } from './context/LanguageContext';
import { CartProvider } from './context/CartContext';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';

export default function App() {
  return (
    <LanguageProvider>
      <CartProvider>
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
        </div>
      </CartProvider>
    </LanguageProvider>
  );
}
