"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from "react";
import type { CartLine, Product } from "@/lib/types";

const STORAGE_KEY = "sbi-cart-v1";

type Action =
  | { type: "hydrate"; lines: CartLine[] }
  | { type: "add"; line: CartLine }
  | { type: "qty"; key: string; quantity: number }
  | { type: "remove"; key: string }
  | { type: "clear" };

function reducer(state: CartLine[], action: Action): CartLine[] {
  switch (action.type) {
    case "hydrate":
      return action.lines;
    case "add": {
      const existing = state.find((l) => l.key === action.line.key);
      if (existing)
        return state.map((l) =>
          l.key === action.line.key ? { ...l, quantity: Math.min(l.quantity + action.line.quantity, 20) } : l,
        );
      return [...state, action.line];
    }
    case "qty":
      return state.map((l) => (l.key === action.key ? { ...l, quantity: Math.max(1, Math.min(action.quantity, 20)) } : l));
    case "remove":
      return state.filter((l) => l.key !== action.key);
    case "clear":
      return [];
  }
}

interface Toast {
  id: number;
  name: string;
  image: string;
  detail: string;
}

interface CartContextValue {
  lines: CartLine[];
  count: number;
  total: number;
  ready: boolean;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  add: (product: Product, opts?: { size?: string; color?: string; quantity?: number }) => void;
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  toast: Toast | null;
  dismissToast: () => void;
  bump: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, dispatch] = useReducer(reducer, []);
  const [ready, setReady] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [bump, setBump] = useState(0);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) dispatch({ type: "hydrate", lines: JSON.parse(saved) });
    } catch {
      /* private mode or corrupted storage — start with an empty cart */
    }
    // Syncing from localStorage (an external system) after mount is the intended use here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* ignore */
    }
  }, [lines, ready]);

  const add = useCallback<CartContextValue["add"]>((product, opts = {}) => {
    const { size, color, quantity = 1 } = opts;
    dispatch({
      type: "add",
      line: {
        key: [product.id, size ?? "", color ?? ""].join("|"),
        productId: product.id,
        productCode: product.code,
        slug: product.slug,
        name: product.name,
        image: product.images[0] ?? "",
        price: product.price,
        size,
        color,
        quantity,
      },
    });
    setBump((b) => b + 1);
    setToast({ id: Date.now(), name: product.name, image: product.images[0] ?? "", detail: [size, color].filter(Boolean).join(" · ") });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      ready,
      count: lines.reduce((s, l) => s + l.quantity, 0),
      total: lines.reduce((s, l) => s + l.price * l.quantity, 0),
      drawerOpen,
      openDrawer: () => {
        setToast(null);
        setDrawerOpen(true);
      },
      closeDrawer: () => setDrawerOpen(false),
      add,
      setQuantity: (key, quantity) => dispatch({ type: "qty", key, quantity }),
      remove: (key) => dispatch({ type: "remove", key }),
      clear: () => dispatch({ type: "clear" }),
      toast,
      dismissToast: () => setToast(null),
      bump,
    }),
    [lines, ready, drawerOpen, add, toast, bump],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
