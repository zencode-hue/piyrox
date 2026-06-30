"use client";

import React, { createContext, useContext, useReducer, useEffect } from "react";

export interface CartItem {
  id: string;        // unique key — productId or productId__variantId
  productId: string;
  variantId?: string;
  variantName?: string;
  title: string;
  price: number;
  category: string;
  imageUrl?: string | null;
}

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: "ADD"; item: CartItem }
  | { type: "REMOVE"; id: string }
  | { type: "CLEAR" }
  | { type: "LOAD"; items: CartItem[] };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD":
      // If item already exists, replace it (update price / variant name if changed)
      if (state.items.find((i) => i.id === action.item.id)) {
        return {
          items: state.items.map((i) =>
            i.id === action.item.id ? action.item : i
          ),
        };
      }
      return { items: [...state.items, action.item] };
    case "REMOVE":
      return { items: state.items.filter((i) => i.id !== action.id) };
    case "CLEAR":
      return { items: [] };
    case "LOAD":
      return { items: action.items };
    default:
      return state;
  }
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  total: number;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  isInCart: (id: string) => boolean;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "vlx_cart_v2";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[];
        if (Array.isArray(parsed)) {
          dispatch({ type: "LOAD", items: parsed });
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Persist to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch {
      // ignore
    }
  }, [state.items]);

  const count = state.items.length;
  const total = state.items.reduce((s, i) => s + i.price, 0);

  const value: CartContextValue = {
    items: state.items,
    count,
    total,
    addItem: (item) => dispatch({ type: "ADD", item }),
    removeItem: (id) => dispatch({ type: "REMOVE", id }),
    clearCart: () => dispatch({ type: "CLEAR" }),
    isInCart: (id) => state.items.some((i) => i.id === id),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
