"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";

// ─── Types ──────────────────────────────────────────────────

export interface CartItem {
  productId: string;
  variantId?: string;
  title: string;
  variantName?: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  slug: string;
  maxQuantity?: number;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  totalPrice: number;
  totalItems: number;
  isInCart: (productId: string, variantId?: string) => boolean;
}

// ─── Context ────────────────────────────────────────────────

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = "piyrox-cart";

// ─── Provider ───────────────────────────────────────────────

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch (error) {
      console.error("[Cart] Failed to load from localStorage:", error);
    }
    setIsHydrated(true);
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("[Cart] Failed to save to localStorage:", error);
    }
  }, [items, isHydrated]);

  const addItem = useCallback((newItem: CartItem) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.productId === newItem.productId &&
          item.variantId === newItem.variantId
      );

      if (existingIndex >= 0) {
        // Update quantity of existing item
        const updated = [...prev];
        const existing = updated[existingIndex];
        const newQty = existing.quantity + (newItem.quantity || 1);
        updated[existingIndex] = {
          ...existing,
          quantity: existing.maxQuantity
            ? Math.min(newQty, existing.maxQuantity)
            : newQty,
        };
        return updated;
      }

      // Add new item
      return [...prev, { ...newItem, quantity: newItem.quantity || 1 }];
    });
  }, []);

  const removeItem = useCallback(
    (productId: string, variantId?: string) => {
      setItems((prev) =>
        prev.filter(
          (item) =>
            !(item.productId === productId && item.variantId === variantId)
        )
      );
    },
    []
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number, variantId?: string) => {
      if (quantity <= 0) {
        removeItem(productId, variantId);
        return;
      }

      setItems((prev) =>
        prev.map((item) =>
          item.productId === productId && item.variantId === variantId
            ? {
                ...item,
                quantity: item.maxQuantity
                  ? Math.min(quantity, item.maxQuantity)
                  : quantity,
              }
            : item
        )
      );
    },
    [removeItem]
  );

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const isInCart = useCallback(
    (productId: string, variantId?: string) => {
      return items.some(
        (item) =>
          item.productId === productId && item.variantId === variantId
      );
    },
    [items]
  );

  const totalPrice = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      totalPrice,
      totalItems,
      isInCart,
    }),
    [items, addItem, removeItem, updateQuantity, clearCart, totalPrice, totalItems, isInCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// ─── Hook ───────────────────────────────────────────────────

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
