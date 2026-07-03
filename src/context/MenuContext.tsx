import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { MenuItem } from '../types';
import { MenuService } from '../services/MenuService';
import { MENU_ITEMS as STATIC_ITEMS } from '../data';

interface MenuContextType {
  menuItems: MenuItem[];
  isLoading: boolean;
}

const MenuContext = createContext<MenuContextType>({
  menuItems: STATIC_ITEMS,
  isLoading: false,
});

export function MenuProvider({ children }: { children: ReactNode }) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(STATIC_ITEMS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsub = MenuService.subscribeToAvailable((items) => {
      if (items.length > 0) setMenuItems(items);
      setIsLoading(false);
    });
    return unsub;
  }, []);

  return (
    <MenuContext.Provider value={{ menuItems, isLoading }}>
      {children}
    </MenuContext.Provider>
  );
}

export const useMenu = () => useContext(MenuContext);
