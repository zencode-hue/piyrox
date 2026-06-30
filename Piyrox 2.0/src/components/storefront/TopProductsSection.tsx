import { db } from "@/lib/db";
import ProductCard from "@/components/storefront/ProductCard";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";

async function getTopProducts() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const products = await (db.product.findMany as any)({
      where: { isActive: true, isFeatured: true },
      orderBy: { updatedAt: "desc" },
      take: 8,
      select: {
        id: true, title: true, price: true, category: true,
        imageUrl: true, avgRating: true, stockCount: true, unlimitedStock: true,
      },
    });
    return products.map((p: { id: string; title: string; price: { toString(): string }; category: string; imageUrl: string | null; avgRating: { toString(): string }; stockCount: number; unlimitedStock: boolean }) => ({
      id: p.id, title: p.title, price: Number(p.price), category: p.category,
      imageUrl: p.imageUrl, avgRating: Number(p.avgRating), stockCount: p.stockCount,
      unlimitedStock: p.unlimitedStock, inStock: p.unlimitedStock || p.stockCount > 0,
    }));
  } catch {
    return [];
  }
}

export default async function TopProductsSection() {
  const products = await getTopProducts();
  if (products.length === 0) return null;

  return (
    <section className="border-t border-white/10 relative overflow-hidden">
      {/* Accent glow */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-orange-500/40 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-orange-500/[0.04] blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Star size={16} className="text-orange-400 fill-orange-400" />
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-400">
                Top Products
              </p>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Our Best Sellers
            </h2>
            <p className="text-white/50 text-sm mt-1">
              Hand-picked by our team for the best value
            </p>
          </div>
          <Link
            href="/products"
            className="flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors group"
          >
            View all <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {products.map((p: { id: string; title: string; price: number; category: string; imageUrl: string | null; avgRating: number; stockCount: number; unlimitedStock: boolean; inStock: boolean }) => (
            <ProductCard key={p.id} {...p} />
          ))}
        </div>
      </div>
    </section>
  );
}
