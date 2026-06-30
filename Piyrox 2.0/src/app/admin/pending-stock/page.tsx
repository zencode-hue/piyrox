import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { AlertTriangle, Clock, Box } from "lucide-react";
import RedeliverButton from "../orders/RedeliverButton";
import OrderActions from "../orders/OrderActions";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PendingStockPage() {
  await requireAdmin();

  const orders = await db.order.findMany({
    where: { status: "PENDING_STOCK" },
    orderBy: { createdAt: "asc" },
    include: {
      user: { select: { email: true } },
      product: { select: { title: true, id: true, stockCount: true, unlimitedStock: true } },
    },
  });

  return (
    <div className="space-y-6 pb-8">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <AlertTriangle size={24} className="text-orange-400" />
            Pending Stock Queue
          </h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            These orders are paid but waiting for inventory. Add stock to the product then use Re-deliver to fulfill.
          </p>
        </div>
        {orders.length > 0 && (
          <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 px-4 py-2 rounded-xl">
            <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
            <span className="text-[11px] font-bold text-orange-400 uppercase tracking-widest">{orders.length} Backordered</span>
          </div>
        )}
      </div>

      <div className="admin-card overflow-hidden mt-8">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
              <Box size={32} className="text-green-400" />
            </div>
            <p className="text-white font-medium text-lg">No pending stock orders</p>
            <p className="text-zinc-500 text-sm mt-1">All caught up! Orders are fulfilling normally.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="text-zinc-500 text-xs uppercase tracking-wider" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <th className="text-left px-5 py-4 font-semibold">Order ID</th>
                  <th className="text-left px-5 py-4 font-semibold">Customer</th>
                  <th className="text-left px-5 py-4 font-semibold">Product</th>
                  <th className="text-right px-5 py-4 font-semibold">Amount</th>
                  <th className="text-center px-5 py-4 font-semibold">Current Stock</th>
                  <th className="text-left px-5 py-4 font-semibold">Waiting Since</th>
                  <th className="text-right px-5 py-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                {orders.map((o) => {
                  const waitingDays = Math.floor((Date.now() - new Date(o.createdAt).getTime()) / (1000 * 60 * 60 * 24));
                  return (
                    <tr key={o.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs font-bold text-orange-400 bg-orange-500/10 px-2 py-1 rounded">
                          {o.id.slice(0, 12)}…
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-white font-medium block truncate max-w-[160px]">
                          {o.user?.email ?? (o as { guestEmail?: string | null }).guestEmail ?? "Guest"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-zinc-300 font-medium block truncate max-w-[200px]">
                          {o.product.title}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="text-white font-bold tabular-nums text-base">
                          ${Number(o.amount).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${o.product.unlimitedStock ? "bg-blue-500/10 text-blue-400" : o.product.stockCount > 0 ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                          {o.product.unlimitedStock ? "∞ Infinite" : o.product.stockCount === 0 ? "Out of stock" : `${o.product.stockCount} available`}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <Clock size={14} className={waitingDays > 1 ? "text-red-400" : "text-yellow-400"} />
                          <span className={`text-xs font-bold ${waitingDays > 1 ? "text-red-400" : "text-yellow-400"}`}>
                            {waitingDays === 0 ? "Today" : `${waitingDays}d ago`}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <Link href={`/admin/products/${o.product.id}/inventory`}
                            className="text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg">
                            Add Stock
                          </Link>
                          <RedeliverButton orderId={o.id} />
                          <OrderActions orderId={o.id} currentStatus={o.status} />
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
    </div>
  );
}
