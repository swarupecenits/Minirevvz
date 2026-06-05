import React, { useEffect, useState, createContext, useContext, ReactNode } from 'react';
import { Product, Settings, SellerAccount, Analytics } from './types';
import { seedProducts, defaultSettings } from './seed';
import { fetchAllProducts } from './supabase';
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
  setSeller: (seller: SellerAccount | null) => void;
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

  // Fetch products from Supabase on mount
  useEffect(() => {
    const loadSupabaseProducts = async () => {
      try {
        const { data, error } = await fetchAllProducts();
        if (!error && data && data.length > 0) {
          // Convert snake_case from Supabase to camelCase
          const convertedProducts: Product[] = data.map((p: any) => ({
            id: p.id,
            name: p.name,
            brand: p.brand,
            category: p.category,
            price: p.price,
            availability: p.availability,
            images: p.images || [],
            shortDescription: p.short_description,
            description: p.description,
            scale: p.scale,
            series: p.series,
            year: p.year,
            packagingCondition: p.packaging_condition,
            featured: p.featured || false,
            isNewArrival: p.is_new_arrival || false,
            isPremium: p.is_premium || false,
            createdAt: p.created_at
          }));
          setState((prev) => ({
            ...prev,
            products: convertedProducts.length > 0 ? convertedProducts : prev.products
          }));
        }
      } catch (err) {
        console.warn('Failed to fetch products from Supabase, using local data:', err);
      }
    };
    loadSupabaseProducts();
  }, []);

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

  const updateProduct = (id: string, updates: Partial<Product> | any) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.map((p) => {
        if (p.id === id) {
          // Handle both camelCase (from form) and snake_case (from Supabase)
          const converted = {
            shortDescription: updates.short_description || updates.shortDescription,
            packagingCondition: updates.packaging_condition || updates.packagingCondition,
            isNewArrival: updates.is_new_arrival ?? updates.isNewArrival,
            isPremium: updates.is_premium ?? updates.isPremium
          };
          return {
            ...p,
            ...updates,
            ...converted
          };
        }
        return p;
      })
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
  const setSeller = (seller: SellerAccount | null) => {
    setState((prev) => ({
      ...prev,
      seller
    }));
  };
  const login = (email: string, password?: string) => {
    // Prototype fallback when Supabase is not configured
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
        setSeller,
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