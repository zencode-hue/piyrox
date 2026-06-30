"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import CategoryNav, { type CategoryOption } from "./CategoryNav";
import ProductCard, { type ProductCardProps } from "./ProductCard";

interface ProductGridProps {
  products: ProductCardProps[];
  initialCategory?: CategoryOption;
}

export default function ProductGrid({
  products,
  initialCategory = "ALL",
}: ProductGridProps) {
  const searchParams = useSearchParams();
  const [activeCategory, setActiveCategory] = useState<CategoryOption>(initialCategory);
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const q = searchParams.get("search");
    if (q) setSearch(q);
  }, [searchParams]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (activeCategory !== "ALL" && p.category !== activeCategory) return false;
      if (
        search.trim() &&
        !p.title.toLowerCase().includes(search.trim().toLowerCase())
      )
        return false;
      if (minPrice && p.price < parseFloat(minPrice)) return false;
      if (maxPrice && p.price > parseFloat(maxPrice)) return false;
      return true;
    });
  }, [products, activeCategory, search, minPrice, maxPrice]);

  return (
    <div className="space-y-6">
      {/* Search + filter toggle */}
      <div className="flex gap-3 items-center">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
          />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/[0.02] border border-white/5 backdrop-blur-md text-white rounded-xl pl-10 pr-4 py-3.5 text-sm focus:outline-none focus:border-amber-500/50 focus:bg-amber-500/5 transition-all shadow-inner"
          />
        </div>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`flex items-center justify-center backdrop-blur-md text-white transition-all rounded-xl text-sm px-5 py-3.5 gap-2 font-bold ${showFilters ? "bg-amber-500/10 border-amber-500/30 text-amber-500" : "bg-white/[0.02] border-white/5 hover:bg-white/10"}`}
        >
          <SlidersHorizontal size={15} />
          Filters
        </button>
      </div>

      {/* Price filters */}
      {showFilters && (
        <div className="bg-white/[0.02] border border-white/5 backdrop-blur-xl rounded-2xl p-5 flex flex-wrap gap-5 items-end shadow-2xl">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Min Price</label>
            <input
              type="number"
              min={0}
              placeholder="$0"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="bg-black/50 border border-white/10 text-white rounded-xl w-32 text-sm py-2.5 px-3 focus:outline-none focus:border-amber-500/50 transition-all shadow-inner"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Max Price</label>
            <input
              type="number"
              min={0}
              placeholder="Any"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="bg-black/50 border border-white/10 text-white rounded-xl w-32 text-sm py-2.5 px-3 focus:outline-none focus:border-amber-500/50 transition-all shadow-inner"
            />
          </div>
          <button
            onClick={() => {
              setMinPrice("");
              setMaxPrice("");
            }}
            className="text-xs font-bold text-zinc-500 hover:text-white transition-colors pb-3 px-2"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Category nav */}
      <CategoryNav active={activeCategory} onClick={setActiveCategory} />

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">
          <Search size={40} className="mx-auto mb-4 opacity-30 text-white" />
          <p className="text-lg font-medium text-white">No products found</p>
          <p className="text-sm mt-1">Try adjusting your filters or search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      )}
    </div>
  );
}
