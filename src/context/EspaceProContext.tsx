import { createContext, useContext, useState, ReactNode } from 'react';

interface EspaceProContextType {
  isEspaceProOpen: boolean;
  openEspacePro: () => void;
  closeEspacePro: () => void;
}

const EspaceProContext = createContext<EspaceProContextType | null>(null);

export function EspaceProProvider({ children }: { children: ReactNode }) {
  const [isEspaceProOpen, setIsEspaceProOpen] = useState(false);

  const openEspacePro = () => setIsEspaceProOpen(true);
  const closeEspacePro = () => setIsEspaceProOpen(false);

  return (
    <EspaceProContext.Provider value={{ isEspaceProOpen, openEspacePro, closeEspacePro }}>
      {children}
    </EspaceProContext.Provider>
  );
}

export function useEspacePro() {
  const ctx = useContext(EspaceProContext);
  if (!ctx) throw new Error('useEspacePro must be used within an EspaceProProvider');
  return ctx;
}
