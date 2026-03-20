import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MenuItem } from '../types';
import { useToast } from './ToastContext';
import { getLocalizedText } from '../data';
import { useLanguage } from './LanguageContext';

export interface CartItem {
  item: MenuItem;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  isCartOpen: boolean;
  isCheckoutOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  setIsCheckoutOpen: (open: boolean) => void;
  addItem: (item: MenuItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { showToast } = useToast();
  const { language } = useLanguage();

  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = sessionStorage.getItem('cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    sessionStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addItem = (item: MenuItem) => {
    setItems(prev => {
      const existing = prev.find(ci => ci.item.id === item.id);
      if (existing) {
        return prev.map(ci => ci.item.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci);
      }
      return [...prev, { item, quantity: 1 }];
    });
    showToast(getLocalizedText(item.title, language), 'success', '🛒');
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(ci => ci.item.id !== id));
  };

  const updateQuantity = (id: string, qty: number) => {
    if (qty <= 0) {
      removeItem(id);
      return;
    }
    setItems(prev => prev.map(ci => ci.item.id === id ? { ...ci, quantity: qty } : ci));
  };

  const clearCart = () => setItems([]);

  const parsePrice = (price: string) => parseFloat(price.replace(/[^0-9.]/g, '')) || 0;

  const totalItems = items.reduce((sum, ci) => sum + ci.quantity, 0);
  const totalPrice = items.reduce((sum, ci) => sum + parsePrice(ci.item.price) * ci.quantity, 0);

  return (
    <CartContext.Provider value={{
      items, isCartOpen, isCheckoutOpen,
      setIsCartOpen, setIsCheckoutOpen,
      addItem, removeItem, updateQuantity, clearCart,
      totalItems, totalPrice,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
