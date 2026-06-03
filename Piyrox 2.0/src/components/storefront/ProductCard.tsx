"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, Package, ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import PriceDisplay from "@/components/storefront/PriceDisplay";
import WishlistButton from "@/components/storefront/WishlistButton";
import { productPath } from "@/lib/slug";

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

const CATEGORY_LABELS: Record<string, string> = {
  STREAMING: "Streaming",
  AI_TOOLS: "AI Tools",
  SOFTWARE: "Software",
  GAMING: "Gaming",
};

export default function ProductCard({
  id,
  title,
  price,
  category,
  imageUrl,
  avgRating,
  stockCount,
  unlimitedStock,
  inStock,
}: ProductCardProps) {
  const { addItem } = useCart();
  const available = unlimitedStock || inStock;
  const catLabel = CATEGORY_LABELS[category] ?? category;
  const href = productPath(id, title);

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!available) return;
    addItem({
      id,
      productId: id,
      title,
      price,
      category,
      imageUrl,
    });
  }

  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-2xl transition-all duration-200 hover:-translate-y-1"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor =
          "rgba(255,255,255,0.15)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor =
          "rgba(255,255,255,0.06)";
      }}
    >
      {/* Image */}
      <div
        className="relative w-full aspect-video overflow-hidden"
        style={{ background: "#09090b" }}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={32} className="text-white/15" />
          </div>
        )}

        {/* Stock badge */}
        <div className="absolute top-2.5 right-2.5">
          {available ? (
            <span
              className="text-xs px-2 py-0.5 rounded-full backdrop-blur-sm font-medium"
              style={{
                background: "rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.7)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              In Stock
            </span>
          ) : (
            <span
              className="text-xs px-2 py-0.5 rounded-full backdrop-blur-sm font-medium"
              style={{
                background: "rgba(255,255,255,0.05)",
                color: "rgba(255,255,255,0.35)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              Out of Stock
            </span>
          )}
        </div>

        {/* Wishlist */}
        <div className="absolute top-2.5 left-2.5">
          <WishlistButton productId={id} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 gap-2.5">
        {/* Category */}
        <span
          className="self-start text-xs px-2.5 py-0.5 rounded-full font-medium text-zinc-400"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {catLabel}
        </span>

        {/* Title */}
        <h3 className="text-sm font-semibold text-white line-clamp-2 leading-snug group-hover:text-zinc-300 transition-colors">
          {title}
        </h3>

        {/* Price + Rating + Add to Cart */}
        <div className="mt-auto pt-2 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-white">
              <PriceDisplay usdAmount={price} />
            </span>
            {avgRating > 0 && (
              <span className="flex items-center gap-1 text-xs text-white/60">
                <Star size={11} fill="currentColor" />
                {avgRating.toFixed(1)}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!available}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              available
                ? "bg-white text-black hover:bg-zinc-200"
                : "bg-white/[0.05] text-white/30 cursor-not-allowed"
            }`}
          >
            <ShoppingCart size={14} />
            {available ? "Add to Cart" : "Out of Stock"}
          </button>
        </div>
      </div>
    </Link>
  );
}
