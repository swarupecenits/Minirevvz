import React, { useEffect, useState, createContext, useContext } from 'react';
import { Product, Settings, SellerAccount, Analytics } from './types';
import { seedProducts, defaultSettings } from './seed';
interface StoreState {
  products: Product[];
  settings: Settings;
  seller: SellerAccount | null;
  analytics: Analytics;
}
interface StoreContextType extends StoreState {
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  login: (email: string, password?: string) => boolean;
  logout: () => void;
  trackWhatsAppClick: (productId: string) => void;
}
const StoreContext = createContext<StoreContextType | undefined>(undefined);
const STORAGE_KEY = 'minirevvz_store_v2';
export function StoreProvider({ children }: {children: ReactNode;}) {
  const [state, setState] = useState<StoreState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse store from localStorage', e);
      }
    }
    return {
      products: seedProducts,
      settings: defaultSettings,
      seller: null,
      analytics: {
        whatsappClicks: {}
      }
    };
  });
  // Persist state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);
  const addProduct = (productData: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setState((prev) => ({
      ...prev,
      products: [newProduct, ...prev.products]
    }));
  };
  const updateProduct = (id: string, updates: Partial<Product>) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.map((p) =>
      p.id === id ?
      {
        ...p,
        ...updates
      } :
      p
      )
    }));
  };
  const deleteProduct = (id: string) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.filter((p) => p.id !== id)
    }));
  };
  const updateSettings = (updates: Partial<Settings>) => {
    setState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...updates
      }
    }));
  };
  const login = (email: string, password?: string) => {
    // Prototype only: accept any login that has an email
    if (email) {
      setState((prev) => ({
        ...prev,
        seller: {
          email,
          password
        }
      }));
      return true;
    }
    return false;
  };
  const logout = () => {
    setState((prev) => ({
      ...prev,
      seller: null
    }));
  };
  const trackWhatsAppClick = (productId: string) => {
    setState((prev) => ({
      ...prev,
      analytics: {
        ...prev.analytics,
        whatsappClicks: {
          ...prev.analytics.whatsappClicks,
          [productId]: (prev.analytics.whatsappClicks[productId] || 0) + 1
        }
      }
    }));
  };
  return (
    <StoreContext.Provider
      value={{
        ...state,
        addProduct,
        updateProduct,
        deleteProduct,
        updateSettings,
        login,
        logout,
        trackWhatsAppClick
      }}>
      
      {children}
    </StoreContext.Provider>);

}
export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}