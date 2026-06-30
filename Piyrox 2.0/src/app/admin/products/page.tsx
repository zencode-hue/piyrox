import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { Plus, Package, Edit, Box } from "lucide-react";
import FeaturedToggle from "./FeaturedToggle";

const CATEGORY_LABELS: Record<string, { label: string, color: string }> = {
  STREAMING: { label: "Streaming", color: "#a855f7" },
  AI_TOOLS: { label: "AI Tools", color: "#3b82f6" },
  SOFTWARE: { label: "Software", color: "#22c55e" },
  GAMING: { label: "Gaming", color: "#f97316" },
};

export default async function AdminProductsPage() {
  await requireAdmin();

  const products = await db.product.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, category: true, price: true, stockCount: true, isActive: true, avgRating: true, unlimitedStock: true, isFeatured: true },
  });

  return (
    <div className="space-y-6 pb-8">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Package size={24} className="text-orange-400" />
            Products
          </h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            Manage your catalog of {products.length} products
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-black font-bold text-sm transition-all active:scale-95"
        >
          <Plus size={16} /> Add Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-24 admin-card">
          <Package size={48} className="mx-auto text-zinc-700 mb-4" />
          <p className="text-zinc-400 font-medium text-lg">No products found</p>
          <p className="text-zinc-500 text-sm mt-1">Get started by creating your first product.</p>
          <Link href="/admin/products/new" className="inline-flex items-center gap-2 mt-6 px-4 py-2 bg-white/10 hover:bg-white/15 text-white font-medium rounded-xl transition-colors">
            <Plus size={16} /> Add Product
          </Link>
        </div>
      ) : (
        <div className="admin-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-zinc-500 text-xs uppercase tracking-wider" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <th className="text-left px-5 py-4 font-semibold">Title</th>
                <th className="text-left px-5 py-4 font-semibold">Category</th>
                <th className="text-right px-5 py-4 font-semibold">Price</th>
                <th className="text-right px-5 py-4 font-semibold">Stock</th>
                <th className="text-center px-5 py-4 font-semibold">Status</th>
                <th className="text-right px-5 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
              {products.map((p) => {
                const cat = CATEGORY_LABELS[p.category] ?? { label: p.category, color: "#fff" };
                return (
                  <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-5 py-4 text-white font-medium truncate max-w-[200px]">
                      {p.title}
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full inline-block"
                        style={{ color: cat.color, background: `${cat.color}20` }}>
                        {cat.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right text-white font-bold tabular-nums">
                      ${Number(p.price).toFixed(2)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className={`font-bold tabular-nums ${p.unlimitedStock ? "text-blue-400" : p.stockCount > 0 ? "text-green-400" : "text-red-400"}`}>
                        {p.unlimitedStock ? "∞" : p.stockCount}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${p.isActive ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                        {p.isActive ? "Active" : "Hidden"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <FeaturedToggle productId={p.id} isFeatured={p.isFeatured ?? false} />
                        <Link href={`/admin/products/${p.id}/inventory`} className="text-zinc-500 hover:text-white transition-colors" title="Manage Inventory">
                          <Box size={16} />
                        </Link>
                        <Link href={`/admin/products/${p.id}/edit`} className="text-zinc-500 hover:text-orange-400 transition-colors" title="Edit Product">
                          <Edit size={16} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
