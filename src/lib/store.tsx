import React, { useEffect, useState, createContext, useContext, ReactNode } from 'react';
import { Product, Settings, SellerAccount, Analytics } from './types';
import { seedProducts, defaultSettings } from './seed';
import { fetchAllProducts } from './supabase';
import { AppLoader } from '../components/AppLoader';
interface StoreState {
  products: Product[];
  settings: Settings;
  seller: SellerAccount | null;
  analytics: Analytics;
  visibilityOverrides: Record<string, boolean>;
}

function resolveProductVisibility(
  productId: string,
  sourceVisible: boolean | undefined,
  overrides: Record<string, boolean>
): boolean {
  if (overrides[productId] !== undefined) {
    return overrides[productId];
  }
  return sourceVisible === true;
}

function withResolvedVisibility(
  products: Product[],
  overrides: Record<string, boolean>
): Product[] {
  return products.map((product) => ({
    ...product,
    isVisible: resolveProductVisibility(product.id, product.isVisible, overrides)
  }));
}

interface StoreContextType extends StoreState {
  isInitializing: boolean;
  addProduct: (product: Omit<Product, 'id' | 'createdAt'> | Product) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  setProductVisibility: (id: string, isVisible: boolean) => void;
  clearVisibilityOverride: (id: string) => void;
  deleteProduct: (id: string) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  setSeller: (seller: SellerAccount | null) => void;
  login: (email: string, password?: string) => boolean;
  logout: () => void;
  trackWhatsAppClick: (productId: string) => void;
}
const StoreContext = createContext<StoreContextType | undefined>(undefined);
const STORAGE_KEY = 'minirevvz_store_v3';
const LEGACY_STORAGE_KEY = 'minirevvz_store_v2';

const MIN_LOADER_MS = 1400;

export function StoreProvider({ children }: {children: ReactNode;}) {
  const [isInitializing, setIsInitializing] = useState(true);
  const [state, setState] = useState<StoreState>(() => {
    const saved =
      localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Partial<StoreState>;
        const visibilityOverrides = parsed.visibilityOverrides ?? {};
        const isLegacyStore = !localStorage.getItem(STORAGE_KEY);
        const rawProducts = parsed.products ?? seedProducts;

        return {
          products: withResolvedVisibility(
            isLegacyStore
              ? rawProducts.map((product) => ({ ...product, isVisible: false }))
              : rawProducts,
            visibilityOverrides
          ),
          settings: parsed.settings ?? defaultSettings,
          seller: parsed.seller ?? null,
          analytics: parsed.analytics ?? { whatsappClicks: {} },
          visibilityOverrides
        };
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
      },
      visibilityOverrides: {}
    };
  });

  // Fetch products from Supabase on mount
  useEffect(() => {
    const startedAt = Date.now();

    const loadSupabaseProducts = async () => {
      try {
        const { data, error } = await fetchAllProducts();
        if (!error && data) {
          setState((prev) => ({
            ...prev,
            products: withResolvedVisibility(data, prev.visibilityOverrides)
          }));
        }
      } catch (err) {
        console.warn('Failed to fetch products from Supabase, using local data:', err);
      } finally {
        const elapsed = Date.now() - startedAt;
        const remaining = Math.max(0, MIN_LOADER_MS - elapsed);
        window.setTimeout(() => setIsInitializing(false), remaining);
      }
    };

    loadSupabaseProducts();
  }, []);

  // Persist state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);
  const addProduct = (productData: Omit<Product, 'id' | 'createdAt'> | Product) => {
    const newProduct: Product = 'id' in productData && 'createdAt' in productData
      ? { ...productData, isVisible: productData.isVisible === true }
      : {
        ...productData,
        id: `prod-${Date.now()}`,
        createdAt: new Date().toISOString(),
        isVisible: productData.isVisible === true
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
          const converted: Partial<Product> = {
            shortDescription: updates.short_description || updates.shortDescription,
            packagingCondition: updates.packaging_condition || updates.packagingCondition,
            isNewArrival: updates.is_new_arrival ?? updates.isNewArrival,
            isPremium: updates.is_premium ?? updates.isPremium
          };

          if (updates.is_visible !== undefined || updates.isVisible !== undefined) {
            converted.isVisible = (updates.is_visible ?? updates.isVisible) === true;
          }

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
  const setProductVisibility = (id: string, isVisible: boolean) => {
    setState((prev) => ({
      ...prev,
      visibilityOverrides: {
        ...prev.visibilityOverrides,
        [id]: isVisible
      },
      products: prev.products.map((product) =>
        product.id === id ? { ...product, isVisible } : product
      )
    }));
  };

  const clearVisibilityOverride = (id: string) => {
    setState((prev) => {
      const { [id]: _, ...visibilityOverrides } = prev.visibilityOverrides;
      return { ...prev, visibilityOverrides };
    });
  };

  const deleteProduct = (id: string) => {
    setState((prev) => {
      const { [id]: _, ...visibilityOverrides } = prev.visibilityOverrides;
      return {
        ...prev,
        visibilityOverrides,
        products: prev.products.filter((p) => p.id !== id)
      };
    });
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
        isInitializing,
        addProduct,
        updateProduct,
        setProductVisibility,
        clearVisibilityOverride,
        deleteProduct,
        updateSettings,
        setSeller,
        login,
        logout,
        trackWhatsAppClick
      }}>
      <AppLoader isLoading={isInitializing} />
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