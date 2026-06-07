"use client";

import Link from "next/link";
import Image from "next/image";
import { Zap, Package, ShoppingCart } from "lucide-react";
import PriceDisplay from "./PriceDisplay";

interface DealCardProps {
  id: string;
  title: string;
  category: string;
  imageUrl?: string | null;
  originalPrice: number;
  dealPrice: number;
  discountPct: number;
  savings: number;
  inStock: boolean;
  avgRating?: number;
  neon?: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  STREAMING: "Streaming", AI_TOOLS: "AI Tools", SOFTWARE: "Software", GAMING: "Gaming",
};

export default function DealCard({
  id, title, category, imageUrl, originalPrice, dealPrice,
  discountPct, savings, inStock,
}: DealCardProps) {
  const catLabel = CATEGORY_LABELS[category] ?? category;

  return (
    <div
      className="relative group rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      {/* Discount badge */}
      <div className="absolute top-3 left-3 z-10">
        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-white text-black">
          -{discountPct.toFixed(0)}% OFF
        </span>
      </div>

      {/* Stock badge */}
      {inStock && (
        <div className="absolute top-3 right-3 z-10">
          <span
            className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full text-zinc-300"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <Zap size={9} /> In Stock
          </span>
        </div>
      )}

      {/* Image */}
      <div className="relative w-full aspect-video overflow-hidden" style={{ background: "#09090b" }}>
        {imageUrl ? (
          <Image src={imageUrl} alt={title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={36} className="text-zinc-800" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="p-4">
        <span
          className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider text-zinc-300 mb-2"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          {catLabel}
        </span>

        <h3 className="font-semibold text-white text-sm leading-snug line-clamp-2 mb-3">{title}</h3>

        {/* Pricing */}
        <div className="flex items-end gap-2 mb-4">
          <span className="text-2xl font-black text-white">
            <PriceDisplay usdAmount={dealPrice} />
          </span>
          <div className="flex flex-col items-start">
            <PriceDisplay usdAmount={originalPrice} strikethrough className="text-sm text-zinc-500" />
            <span className="text-xs font-medium text-zinc-400">
              Save <PriceDisplay usdAmount={savings} />
            </span>
          </div>
        </div>

        {/* CTA */}
        <Link
          href={`/checkout/confirm?productId=${id}&dealPrice=${dealPrice}`}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold bg-white text-black hover:bg-zinc-200 transition-colors"
        >
          <ShoppingCart size={14} /> Grab Deal
        </Link>
      </div>
    </div>
  );
}