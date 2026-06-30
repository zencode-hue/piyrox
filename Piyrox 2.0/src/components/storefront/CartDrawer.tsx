"use client";

import { useEffect } from "react";
import Link from "next/link";
import { X, ShoppingCart, Trash2, ArrowRight, Zap, Package } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

const CAT: Record<string, string> = {
  STREAMING: "Streaming",
  AI_TOOLS: "AI Tools",
  SOFTWARE: "Software",
  GAMING: "Gaming",
};

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, total, removeItem, clearCart } = useCart();

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[998] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer panel */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-full max-w-sm z-[999] bg-[#0a0a0a]/95 backdrop-blur-2xl border-l border-white/10 flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
              <ShoppingCart size={16} className="text-amber-500" />
            </div>
            <span className="font-bold text-white text-base">Your Cart</span>
            {items.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30">
                {items.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {items.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs font-medium text-zinc-500 hover:text-white transition-colors"
              >
                Clear all
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 border border-white/5 transition-all"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-10 opacity-70">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-5">
                <ShoppingCart size={28} className="text-zinc-600" />
              </div>
              <p className="text-white font-bold text-lg mb-1">Your cart is empty</p>
              <p className="text-zinc-500 text-sm mb-6 max-w-[200px]">Looks like you haven't added anything yet.</p>
              <Link
                href="/products"
                onClick={onClose}
                className="group flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black text-sm font-bold hover:bg-zinc-200 transition-colors"
              >
                Start Shopping <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors relative group"
                >
                  <div className="w-14 h-14 shrink-0 rounded-lg bg-black/40 border border-white/10 overflow-hidden relative">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center opacity-50">
                        <Package size={20} className="text-zinc-500" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0 py-1">
                    <p className="text-white text-sm font-bold truncate group-hover:text-amber-400 transition-colors">
                      {item.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500">
                        {CAT[item.category] ?? item.category}
                      </span>
                      {item.variantName && (
                        <>
                          <span className="text-zinc-700 text-[10px]">•</span>
                          <span className="text-[10px] font-medium text-zinc-400 truncate max-w-[80px]">{item.variantName}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-white font-black text-sm">
                      ${item.price.toFixed(2)}
                    </span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-zinc-600 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-5 border-t border-white/10 bg-black/40 shrink-0">
            <div className="flex justify-between items-center mb-4">
              <span className="text-zinc-400 text-sm font-medium">Subtotal</span>
              <span className="text-white font-black text-xl">${total.toFixed(2)}</span>
            </div>
            
            <Link
              href="/cart"
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-amber-500 text-black font-black text-sm hover:bg-amber-400 transition-colors shadow-[0_0_20px_rgba(245,158,11,0.2)]"
            >
              <Zap size={16} />
              Proceed to Checkout
            </Link>
            <p className="text-zinc-600 text-[10px] uppercase tracking-widest font-semibold text-center mt-4">
              Secure checkout • Instant delivery
            </p>
          </div>
        )}
      </div>
    </>
  );
}
