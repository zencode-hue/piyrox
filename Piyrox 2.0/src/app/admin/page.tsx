import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { DollarSign, ShoppingCart, Users, Package, AlertTriangle, TrendingUp, Clock, CheckCircle, XCircle, ArrowRight, Tag, UserCheck } from "lucide-react";
import RevenueChart from "./RevenueChart";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  await requireAdmin();

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalUsers, newUsersToday,
    revenue, revenueToday, revenueWeek, revenueMonth,
    totalOrders, ordersToday,
    pendingOrders, pendingStockOrders, failedOrders,
    lowStockProducts,
    recentOrders,
    pendingPartnerPayouts,
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { createdAt: { gte: todayStart } } }),
    db.order.aggregate({ where: { status: "PAID" }, _sum: { amount: true } }),
    db.order.aggregate({ where: { status: "PAID", createdAt: { gte: todayStart } }, _sum: { amount: true }, _count: true }),
    db.order.aggregate({ where: { status: "PAID", createdAt: { gte: weekStart } }, _sum: { amount: true }, _count: true }),
    db.order.aggregate({ where: { status: "PAID", createdAt: { gte: monthStart } }, _sum: { amount: true }, _count: true }),
    db.order.count(),
    db.order.count({ where: { createdAt: { gte: todayStart } } }),
    db.order.count({ where: { status: "PENDING" } }),
    db.order.count({ where: { status: "PENDING_STOCK" } }),
    db.order.count({ where: { status: "FAILED" } }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db.product.findMany as any)({
      where: { isActive: true, unlimitedStock: false, stockCount: { lte: 3 } },
      select: { id: true, title: true, stockCount: true },
      orderBy: { stockCount: "asc" },
      take: 5,
    }) as Promise<{ id: string; title: string; stockCount: number }[]>,
    db.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { product: { select: { title: true } }, user: { select: { email: true } } },
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db as any).partnerPayoutRequest.count({ where: { status: "PENDING" } }).catch(() => 0),
  ]);

  const STATUS_BADGE: Record<string, { label: string; color: string }> = {
    PAID: { label: "Paid", color: "#ffffff" },
    PENDING: { label: "Pending", color: "#a1a1aa" },
    PENDING_STOCK: { label: "Processing", color: "#d4d4d8" },
    FAILED: { label: "Failed", color: "#71717a" },
    REFUNDED: { label: "Refunded", color: "#52525b" },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <span className="text-xs text-gray-600">{now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</span>
      </div>

      {/* Revenue cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "All Time Revenue", value: `$${Number(revenue._sum.amount ?? 0).toFixed(2)}`, icon: DollarSign, color: "#ffffff", sub: `${totalOrders} total orders` },
          { label: "Today", value: `$${Number(revenueToday._sum.amount ?? 0).toFixed(2)}`, icon: TrendingUp, color: "#ffffff", sub: `${revenueToday._count} orders, ${ordersToday} placed` },
          { label: "This Week", value: `$${Number(revenueWeek._sum.amount ?? 0).toFixed(2)}`, icon: TrendingUp, color: "#ffffff", sub: `${revenueWeek._count} orders` },
          { label: "This Month", value: `$${Number(revenueMonth._sum.amount ?? 0).toFixed(2)}`, icon: TrendingUp, color: "#ffffff", sub: `${revenueMonth._count} orders` },
        ].map(({ label, value, icon: Icon, color, sub }) => (
          <div key={label} className="glass-card p-4 sm:p-5 flex flex-col justify-center">
            <div className="flex items-center gap-2 text-[11px] sm:text-xs text-gray-400 mb-2 sm:mb-3">
              <Icon size={14} style={{ color }} /> <span className="truncate">{label}</span>
            </div>
            <div className="text-lg sm:text-xl font-bold" style={{ color }}>{value}</div>
            <div className="text-[10px] sm:text-xs text-gray-500 mt-1 truncate">{sub}</div>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {(pendingPartnerPayouts > 0 || (lowStockProducts as { id: string }[]).length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {pendingPartnerPayouts > 0 && (
            <Link href="/admin/partners/payouts"
              className="glass-card p-4 flex items-center justify-between border-white/10 hover:border-white/30 transition-colors">
              <div className="flex items-center gap-3">
                <UserCheck size={16} className="text-white" />
                <div>
                  <p className="text-sm font-medium text-white">{pendingPartnerPayouts} payout request{pendingPartnerPayouts !== 1 ? "s" : ""}</p>
                  <p className="text-xs text-gray-500">Awaiting approval</p>
                </div>
              </div>
              <ArrowRight size={14} className="text-gray-600" />
            </Link>
          )}
          {(lowStockProducts as { id: string; title: string; stockCount: number }[]).length > 0 && (
            <div className="glass-card p-4 border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={14} className="text-zinc-400" />
                <span className="text-sm font-medium text-white">Low Stock Alert</span>
              </div>
              <div className="space-y-1.5">
                {(lowStockProducts as { id: string; title: string; stockCount: number }[]).map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-xs">
                    <Link href={`/admin/products/${p.id}/inventory`} className="text-gray-400 hover:text-white transition-colors truncate max-w-[180px]">
                      {p.title}
                    </Link>
                    <span className={p.stockCount === 0 ? "text-zinc-500 font-medium" : "text-white"}>
                      {p.stockCount === 0 ? "Out of stock" : `${p.stockCount} left`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Revenue chart */}
      <RevenueChart />

      {/* Recent orders */}
      <div className="glass-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <ShoppingCart size={14} className="text-white" /> Recent Orders
          </h2>
          <Link href="/admin/orders" className="text-xs text-white hover:text-zinc-300 flex items-center gap-1">
            View all <ArrowRight size={11} />
          </Link>
        </div>
        <div className="divide-y divide-white/5">
          {(recentOrders as { id: string; amount: unknown; status: string; createdAt: Date; paymentProvider: string; product: { title: string }; user: { email: string } | null }[]).map((o) => {
            const badge = STATUS_BADGE[o.status] ?? { label: o.status, color: "#9ca3af" };
            return (
              <div key={o.id} className="flex items-center gap-3 px-5 py-3 hover:bg-white/2 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-gray-500">MMT-{o.id.slice(-6).toUpperCase()}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded-full font-medium" style={{ background: `${badge.color}18`, color: badge.color, border: `1px solid ${badge.color}30` }}>
                      {badge.label}
                    </span>
                  </div>
                  <p className="text-sm text-white truncate mt-0.5">{o.product.title}</p>
                  <p className="text-xs text-gray-600">{o.user?.email ?? "Guest"}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-white">${Number(o.amount).toFixed(2)}</p>
                  <p className="text-xs text-gray-600">{new Date(o.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: "/admin/products/new", label: "Add Product", icon: Package, color: "#ffffff" },
          { href: "/admin/discounts", label: "Discounts", icon: Tag, color: "#ffffff" },
          { href: "/admin/analytics", label: "Analytics", icon: TrendingUp, color: "#ffffff" },
          { href: "/admin/ai", label: "AI Assistant", icon: CheckCircle, color: "#ffffff" },
        ].map(({ href, label, icon: Icon, color }) => (
          <Link key={href} href={href}
            className="glass-card p-4 flex flex-col items-center gap-2 text-center hover:border-white/20 transition-all hover:-translate-y-0.5">
            <Icon size={20} style={{ color }} />
            <span className="text-xs font-medium text-gray-300">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
