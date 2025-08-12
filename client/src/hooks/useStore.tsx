import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface StoreContextType {
  selectedStore: string;
  setSelectedStore: (storeId: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

interface StoreProviderProps {
  children: ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
  const [selectedStore, setSelectedStore] = useState<string>(() => {
    // Get from localStorage on initialization
    return localStorage.getItem('selectedStore') || '';
  });

  // Save to localStorage when selectedStore changes
  useEffect(() => {
    if (selectedStore) {
      localStorage.setItem('selectedStore', selectedStore);
    } else {
      localStorage.removeItem('selectedStore');
    }
  }, [selectedStore]);

  return (
    <StoreContext.Provider value={{ selectedStore, setSelectedStore }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}