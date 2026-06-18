import React, { useEffect, useState, useCallback, useRef, createContext, useContext, ReactNode, useMemo } from 'react';
import { Product, Settings, SellerAccount, Analytics, CartItem } from './types';
import { seedProducts, defaultSettings } from './seed';
import { fetchAllProducts } from './supabase';
import { AppLoader } from '../components/AppLoader';

interface StoreState {
  products: Product[];
  settings: Settings;
  seller: SellerAccount | null;
  analytics: Analytics;
  visibilityOverrides: Record<string, boolean>;
  cart: CartItem[];
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
  // Cart actions
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartItemQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);
const STORAGE_KEY = 'minirevvz_store_v3';
const LEGACY_STORAGE_KEY = 'minirevvz_store_v2';

const MIN_LOADER_MS = 1400;

// Debounced persistence - only writes to localStorage when no updates for 2 seconds
function useDebouncedSave(state: StoreState, delay = 2000) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestState = useRef(state);
  latestState.current = state;

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(latestState.current));
      } catch (e) {
        console.warn('Failed to persist store to localStorage:', e);
      }
    }, delay);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [state, delay]);

  // Save immediately on page unload (captures latest state)
  useEffect(() => {
    const handleBeforeUnload = () => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(latestState.current));
      } catch (e) {
        // Silently fail on unload
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);
}

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
          visibilityOverrides,
          cart: parsed.cart ?? []
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
      visibilityOverrides: {},
      cart: []
    };
  });

  // Debounced persistence
  useDebouncedSave(state);

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

  const addProduct = useCallback((productData: Omit<Product, 'id' | 'createdAt'> | Product) => {
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
  }, []);

  const updateProduct = useCallback((id: string, updates: Partial<Product> | any) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.map((p) => {
        if (p.id === id) {
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
  }, []);

  const setProductVisibility = useCallback((id: string, isVisible: boolean) => {
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
  }, []);

  const clearVisibilityOverride = useCallback((id: string) => {
    setState((prev) => {
      const { [id]: _, ...visibilityOverrides } = prev.visibilityOverrides;
      return { ...prev, visibilityOverrides };
    });
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setState((prev) => {
      const { [id]: _, ...visibilityOverrides } = prev.visibilityOverrides;
      // Also remove from cart if present
      const cart = prev.cart.filter((item) => item.productId !== id);
      return {
        ...prev,
        visibilityOverrides,
        products: prev.products.filter((p) => p.id !== id),
        cart
      };
    });
  }, []);

  const updateSettings = useCallback((updates: Partial<Settings>) => {
    setState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...updates
      }
    }));
  }, []);

  const setSeller = useCallback((seller: SellerAccount | null) => {
    setState((prev) => ({
      ...prev,
      seller
    }));
  }, []);

  const login = useCallback((email: string, password?: string) => {
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
  }, []);

  const logout = useCallback(() => {
    setState((prev) => ({
      ...prev,
      seller: null
    }));
  }, []);

  const trackWhatsAppClick = useCallback((productId: string) => {
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
  }, []);

  // === Cart Actions ===

  const addToCart = useCallback((product: Product, quantity: number = 1) => {
    if (product.quantity === 0) return; // Cannot add sold out items

    setState((prev) => {
      const existingIndex = prev.cart.findIndex((item) => item.productId === product.id);
      let newCart: CartItem[];

      if (existingIndex >= 0) {
        // Item already in cart - increase quantity (capped by stock)
        newCart = prev.cart.map((item, idx) => {
          if (idx === existingIndex) {
            const newQty = Math.min(item.quantity + quantity, product.quantity);
            return { ...item, quantity: newQty };
          }
          return item;
        });
      } else {
        // New item
        newCart = [...prev.cart, { productId: product.id, product, quantity: Math.min(quantity, product.quantity) }];
      }

      return { ...prev, cart: newCart };
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setState((prev) => ({
      ...prev,
      cart: prev.cart.filter((item) => item.productId !== productId)
    }));
  }, []);

  const updateCartItemQuantity = useCallback((productId: string, quantity: number) => {
    setState((prev) => ({
      ...prev,
      cart: prev.cart.map((item) => {
        if (item.productId === productId) {
          // Clamp quantity between 1 and available stock
          const clampedQty = Math.max(1, Math.min(quantity, item.product.quantity));
          return { ...item, quantity: clampedQty };
        }
        return item;
      })
    }));
  }, []);

  const clearCart = useCallback(() => {
    setState((prev) => ({ ...prev, cart: [] }));
  }, []);

  // Derived values for cart
  const cartTotal = useMemo(() => {
    return state.cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [state.cart]);

  const cartCount = useMemo(() => {
    return state.cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [state.cart]);

  // Memoize context value to prevent re-renders of all consumers
  const contextValue = useMemo<StoreContextType>(() => ({
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
    trackWhatsAppClick,
    // Cart
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    cartTotal,
    cartCount
  }), [state, isInitializing, addProduct, updateProduct, setProductVisibility, clearVisibilityOverride, deleteProduct, updateSettings, setSeller, login, logout, trackWhatsAppClick, addToCart, removeFromCart, updateCartItemQuantity, clearCart, cartTotal, cartCount]);

  return (
    <StoreContext.Provider value={contextValue}>
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