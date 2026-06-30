import type { Metadata } from "next";
export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import ProductCard from "@/components/storefront/ProductCard";
import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";

export const metadata: Metadata = {
  title: "Search Products — PIYROX",
  description: "Search for digital products on PIYROX.",
  robots: { index: false, follow: false },
};

const CATEGORIES = [
  { value: "", label: "All" },
  { value: "STREAMING", label: "Streaming" },
  { value: "AI_TOOLS", label: "AI Tools" },
  { value: "SOFTWARE", label: "Software" },
  { value: "GAMING", label: "Gaming" },
];

interface Props { searchParams: { q?: string; category?: string } }

export default async function SearchPage({ searchParams }: Props) {
  const q = searchParams.q?.trim() ?? "";
  const category = searchParams.category ?? "";

  // Build search — use multiple OR conditions for fuzzy-like matching
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const products = q.length > 0 ? await (db.product.findMany as any)({
    where: {
      isActive: true,
      ...(category ? { category } : {}),
      OR: words.length > 0 ? words.flatMap((word: string) => [
        { title: { contains: word, mode: "insensitive" } },
        { description: { contains: word, mode: "insensitive" } },
      ]) : [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ],
    },
    orderBy: [{ avgRating: "desc" }, { stockCount: "desc" }],
    take: 40,
    select: { id: true, title: true, price: true, category: true, imageUrl: true, avgRating: true, stockCount: true, unlimitedStock: true },
  }) as Array<{ id: string; title: string; price: { toString(): string }; category: string; imageUrl: string | null; avgRating: { toString(): string }; stockCount: number; unlimitedStock: boolean }> : [];

  // If no results and query has typos, try broader search (first 3 chars of each word)
  let mapped = products.map((p) => ({
    id: p.id, title: p.title, price: Number(p.price), category: p.category,
    imageUrl: p.imageUrl, avgRating: Number(p.avgRating), stockCount: p.stockCount,
    unlimitedStock: p.unlimitedStock, inStock: p.unlimitedStock || p.stockCount > 0,
  }));

  // Fuzzy fallback — if no results, try partial match on first 3 chars
  if (mapped.length === 0 && q.length >= 3) {
    const partial = q.slice(0, 3);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fallback = await (db.product.findMany as any)({
      where: {
        isActive: true,
        ...(category ? { category } : {}),
        title: { contains: partial, mode: "insensitive" },
      },
      orderBy: { avgRating: "desc" },
      take: 20,
      select: { id: true, title: true, price: true, category: true, imageUrl: true, avgRating: true, stockCount: true, unlimitedStock: true },
    }) as typeof products;
    mapped = fallback.map((p) => ({
      id: p.id, title: p.title, price: Number(p.price), category: p.category,
      imageUrl: p.imageUrl, avgRating: Number(p.avgRating), stockCount: p.stockCount,
      unlimitedStock: p.unlimitedStock, inStock: p.unlimitedStock || p.stockCount > 0,
    }));
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10 space-y-6">
        {/* Search bar */}
        <form method="GET" action="/search" className="flex flex-col sm:flex-row gap-4 max-w-3xl">
          <div className="relative flex-1 group">
            <Search size={22} className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-amber-500 transition-colors" />
            <input name="q" defaultValue={q} placeholder="Search for anything..."
              className="w-full bg-white/[0.02] border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-lg text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/50 focus:bg-amber-500/5 transition-all shadow-inner" autoFocus />
            {category && <input type="hidden" name="category" value={category} />}
          </div>
          <button type="submit" className="bg-amber-500 text-black font-black px-8 py-4 rounded-2xl text-base hover:bg-amber-400 transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)]">
            Search
          </button>
        </form>

        {/* Category filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <SlidersHorizontal size={14} className="text-gray-500" />
          {CATEGORIES.map((cat) => (
            <Link key={cat.value}
              href={`/search?q=${encodeURIComponent(q)}&category=${cat.value}`}
              className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
              style={{
                background: category === cat.value ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.04)",
                border: category === cat.value ? "1px solid rgba(245,158,11,0.3)" : "1px solid rgba(255,255,255,0.07)",
                color: category === cat.value ? "#fbbf24" : "rgba(255,255,255,0.5)",
              }}>
              {cat.label}
            </Link>
          ))}
        </div>

        {q && (
          <p className="text-gray-500 text-sm">
            {mapped.length} result{mapped.length !== 1 ? "s" : ""} for &quot;{q}&quot;
            {category && ` in ${CATEGORIES.find(c => c.value === category)?.label}`}
          </p>
        )}
      </div>

      {q === "" ? (
        <div className="text-center py-20" style={{ color: "rgba(255,255,255,0.3)" }}>
          <Search size={48} className="mx-auto mb-4 opacity-20" />
          <p className="text-lg">Type something to search</p>
          <Link href="/products" className="text-amber-400 hover:text-amber-300 text-sm mt-2 inline-block">Browse all products →</Link>
        </div>
      ) : (
        <>
          {mapped.length === 0 ? (
            <div className="text-center py-24 bg-gradient-to-b from-white/[0.02] to-transparent rounded-[32px] border border-white/5 mb-10 relative overflow-hidden">
              {/* Background glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
              
              <p className="text-2xl font-black mb-3 text-white">No exact matches for &quot;{q}&quot;</p>
              <p className="text-base text-zinc-500 mb-10 max-w-md mx-auto">But don&apos;t worry, Piyrox AI is here to help you find the best alternative!</p>
              
              <div className="max-w-lg mx-auto p-8 bg-white/[0.03] border border-white/10 rounded-3xl shadow-2xl backdrop-blur-xl relative z-10 text-left">
                <div className="flex items-center gap-3 mb-5 pb-5 border-b border-white/10">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                    <Search size={20} className="text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-amber-500 uppercase tracking-widest">AI Suggestion</p>
                    <p className="text-xs text-zinc-500 font-medium">Smart Fallback Engine</p>
                  </div>
                </div>
                <p className="text-base text-zinc-300 leading-relaxed italic mb-8">
                  &quot;It seems we don&apos;t have a direct match for that, but you might be interested in our top **Streaming** or **AI Tool** bundles which often include what users look for in &apos;{q}&apos;. Try searching for &apos;Netflix&apos; or &apos;ChatGPT&apos; instead!&quot;
                </p>
                <Link href="/products" className="flex items-center justify-center gap-2 bg-white text-black font-bold w-full py-3.5 rounded-xl text-sm hover:bg-zinc-200 transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                  Browse Trending Now
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {mapped.map((p) => <ProductCard key={p.id} {...p} />)}
            </div>
          )}
        </>
      )}
    </div>
  );
}
