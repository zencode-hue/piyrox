"use client";

import Link from "next/link";
import { Star, Package, ShoppingCart, Check } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import PriceDisplay from "@/components/storefront/PriceDisplay";
import WishlistButton from "@/components/storefront/WishlistButton";
import { useState } from "react";

const CATEGORY_LABELS: Record<string, string> = {
  STREAMING: "Streaming",
  AI_TOOLS: "AI Tools",
  SOFTWARE: "Software",
  GAMING: "Gaming",
};

export interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  category: string;
  imageUrl: string | null;
  avgRating: number;
  stockCount: number;
  unlimitedStock: boolean;
  inStock: boolean;
}

export default function ProductCard({ id, title, price, category, imageUrl, avgRating, inStock }: ProductCardProps) {
  const { addItem, isInCart } = useCart();
  const [added, setAdded] = useState(false);
  
  const alreadyInCart = isInCart(id);

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock || alreadyInCart) return;
    addItem({ id, productId: id, title, price, category, imageUrl });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <Link
      href={`/products/${id}`}
      className="group block rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative"
      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" 
        style={{ background: "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.08) 0%, transparent 70%)" }} />

      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-black/40">
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        ) : (
          <div className="w-full h-full flex items-center justify-center opacity-50">
            <Package size={48} className="text-zinc-600" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />

        {/* Wishlist */}
        <div className="absolute top-3 right-3 z-10" onClick={(e) => e.preventDefault()}>
          <WishlistButton productId={id} />
        </div>

        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span
            className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-white shadow-sm"
            style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.2)" }}
          >
            {CATEGORY_LABELS[category] ?? category}
          </span>
        </div>

        {/* Out of stock overlay */}
        {!inStock && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-20">
            <span className="px-4 py-1.5 rounded-full bg-red-500/20 border border-red-500/30 text-xs font-bold text-red-400 uppercase tracking-widest">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-5 relative z-10">
        <h3 className="text-base font-bold text-white truncate mb-2 group-hover:text-amber-400 transition-colors">
          {title}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-4">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              size={12}
              className={s <= Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "text-zinc-700"}
            />
          ))}
          <span className="text-xs font-medium text-zinc-400 ml-1.5">{avgRating.toFixed(1)}</span>
        </div>

        {/* Price + Add to Cart */}
        <div className="flex items-end justify-between mt-auto">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold mb-0.5">Price</p>
            <span className="text-xl font-black text-white">
              <PriceDisplay usdAmount={price} />
            </span>
          </div>
          
          <button
            onClick={handleAddToCart}
            disabled={!inStock || alreadyInCart}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
              alreadyInCart || added 
                ? "bg-green-500/20 text-green-400 border border-green-500/30" 
                : "bg-white text-black hover:bg-zinc-200 border border-transparent shadow-[0_0_15px_rgba(255,255,255,0.1)] group-hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {alreadyInCart || added ? <Check size={14} /> : <ShoppingCart size={14} />}
            {alreadyInCart || added ? "In Cart" : "Add"}
          </button>
        </div>
      </div>
    </Link>
  );
}
