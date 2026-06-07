"use client";

import Link from "next/link";
import { Star, Package, ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import PriceDisplay from "@/components/storefront/PriceDisplay";
import WishlistButton from "@/components/storefront/WishlistButton";

const CATEGORY_LABELS: Record<string, string> = {
  STREAMING: "Streaming",
  AI_TOOLS: "AI Tools",
  SOFTWARE: "Software",
  GAMING: "Gaming",
};

interface Props {
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

export default function ProductCard({ id, title, price, category, imageUrl, avgRating, inStock }: Props) {
  const { addItem } = useCart();

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock) return;
    addItem({ productId: id, title, price, category, imageUrl });
  }

  return (
    <Link
      href={`/products/${id}`}
      className="group block rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden" style={{ background: "rgba(255,255,255,0.02)" }}>
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={40} className="text-zinc-700" />
          </div>
        )}

        {/* Wishlist */}
        <div className="absolute top-3 right-3 z-10" onClick={(e) => e.preventDefault()}>
          <WishlistButton productId={id} />
        </div>

        {/* Category badge */}
        <div className="absolute bottom-3 left-3">
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider text-zinc-300"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            {CATEGORY_LABELS[category] ?? category}
          </span>
        </div>

        {/* Out of stock overlay */}
        {!inStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-white truncate mb-1.5 group-hover:text-zinc-300 transition-colors">
          {title}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              size={11}
              className={s <= Math.round(avgRating) ? "fill-white text-white" : "text-zinc-700"}
            />
          ))}
          <span className="text-[10px] text-zinc-500 ml-1">{avgRating.toFixed(1)}</span>
        </div>

        {/* Price + Add to Cart */}
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-white">
            <PriceDisplay usdAmount={price} />
          </span>
          <button
            onClick={handleAddToCart}
            disabled={!inStock}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-black hover:bg-zinc-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ShoppingCart size={12} />
            Add
          </button>
        </div>
      </div>
    </Link>
  );
}