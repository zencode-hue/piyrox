import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import {
  DollarSign, ShoppingCart, Users, Package,
  AlertTriangle, TrendingUp, TrendingDown, Clock,
  CheckCircle, XCircle, ArrowRight, Tag, UserCheck,
  Zap, BarChart2, Star, Activity,
} from "lucide-react";
import RevenueChart from "./RevenueChart";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  await requireAdmin();

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart.getTime() - 86400000);
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const lastWeekStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  const [
    totalUsers, newUsersToday, newUsersWeek,
    revenue, revenueToday, revenueYesterday,
    revenueWeek, revenueLastWeek,
    revenueMonth, revenueLastMonth,
    totalOrders, ordersToday,
    pendingOrders, pendingStockOrders, failedOrders,
    lowStockProducts,
    recentOrders,
    pendingPartnerPayouts,
    totalProducts, activeProducts,
    totalReviews,
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { createdAt: { gte: todayStart } } }),
    db.user.count({ where: { createdAt: { gte: weekStart } } }),
    db.order.aggregate({ where: { status: "PAID" }, _sum: { amount: true } }),
    db.order.aggregate({ where: { status: "PAID", createdAt: { gte: todayStart } }, _sum: { amount: true }, _count: true }),
    db.order.aggregate({ where: { status: "PAID", createdAt: { gte: yesterdayStart, lt: todayStart } }, _sum: { amount: true }, _count: true }),
    db.order.aggregate({ where: { status: "PAID", createdAt: { gte: weekStart } }, _sum: { amount: true }, _count: true }),
    db.order.aggregate({ where: { status: "PAID", createdAt: { gte: lastWeekStart, lt: weekStart } }, _sum: { amount: true }, _count: true }),
    db.order.aggregate({ where: { status: "PAID", createdAt: { gte: monthStart } }, _sum: { amount: true }, _count: true }),
    db.order.aggregate({ where: { status: "PAID", createdAt: { gte: lastMonthStart, lte: lastMonthEnd } }, _sum: { amount: true }, _count: true }),
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
      take: 10,
      include: { product: { select: { title: true } }, user: { select: { email: true } } },
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db as any).partnerPayoutRequest.count({ where: { status: "PENDING" } }).catch(() => 0),
    db.product.count(),
    db.product.count({ where: { isActive: true } }),
    db.review.count(),
  ]);

  function pctChange(current: number, previous: number) {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  const todayRev = Number(revenueToday._sum.amount ?? 0);
  const yesterdayRev = Number(revenueYesterday._sum.amount ?? 0);
  const weekRev = Number(revenueWeek._sum.amount ?? 0);
  const lastWeekRev = Number(revenueLastWeek._sum.amount ?? 0);
  const monthRev = Number(revenueMonth._sum.amount ?? 0);
  const lastMonthRev = Number(revenueLastMonth._sum.amount ?? 0);

  const kpiCards = [
    {
      label: "All-Time Revenue",
      value: `$${Number(revenue._sum.amount ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      sub: `${totalOrders} total orders`,
      icon: DollarSign,
      color: "orange",
      pct: null,
    },
    {
      label: "Today's Revenue",
      value: `$${todayRev.toFixed(2)}`,
      sub: `${revenueToday._count} orders today`,
      icon: TrendingUp,
      color: "green",
      pct: pctChange(todayRev, yesterdayRev),
      pctLabel: "vs yesterday",
    },
    {
      label: "This Week",
      value: `$${weekRev.toFixed(2)}`,
      sub: `${revenueWeek._count} orders`,
      icon: BarChart2,
      color: "blue",
      pct: pctChange(weekRev, lastWeekRev),
      pctLabel: "vs last week",
    },
    {
      label: "This Month",
      value: `$${monthRev.toFixed(2)}`,
      sub: `${revenueMonth._count} orders`,
      icon: Activity,
      color: "purple",
      pct: pctChange(monthRev, lastMonthRev),
      pctLabel: "vs last month",
    },
  ];

  const colorMap: Record<string, { bg: string; text: string; border: string; icon: string }> = {
    orange: { bg: "rgba(249,115,22,0.08)", text: "#f97316", border: "rgba(249,115,22,0.2)", icon: "rgba(249,115,22,0.15)" },
    green:  { bg: "rgba(34,197,94,0.08)",  text: "#22c55e", border: "rgba(34,197,94,0.2)",  icon: "rgba(34,197,94,0.15)" },
    blue:   { bg: "rgba(59,130,246,0.08)", text: "#3b82f6", border: "rgba(59,130,246,0.2)", icon: "rgba(59,130,246,0.15)" },
    purple: { bg: "rgba(168,85,247,0.08)", text: "#a855f7", border: "rgba(168,85,247,0.2)", icon: "rgba(168,85,247,0.15)" },
  };

  const STATUS_MAP: Record<string, { label: string; bg: string; text: string }> = {
    PAID:          { label: "Paid",       bg: "rgba(34,197,94,0.1)",  text: "#22c55e" },
    PENDING:       { label: "Pending",    bg: "rgba(234,179,8,0.1)",  text: "#eab308" },
    PENDING_STOCK: { label: "Processing", bg: "rgba(59,130,246,0.1)", text: "#3b82f6" },
    FAILED:        { label: "Failed",     bg: "rgba(239,68,68,0.1)",  text: "#ef4444" },
    REFUNDED:      { label: "Refunded",   bg: "rgba(156,163,175,0.1)",text: "#9ca3af" },
  };

  return (
    <div className="space-y-6 pb-8">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Dashboard</h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            {now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-black font-bold text-sm transition-all active:scale-95"
        >
          <Package size={14} /> Add Product
        </Link>
      </div>

      {/* ── Alerts Banner ── */}
      {(pendingPartnerPayouts > 0 || pendingStockOrders > 0 || failedOrders > 0) && (
        <div className="flex flex-wrap gap-3">
          {pendingPartnerPayouts > 0 && (
            <Link href="/admin/partners/payouts" className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-80"
              style={{ background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.2)", color: "#f97316" }}>
              <UserCheck size={14} /> {pendingPartnerPayouts} payout request{pendingPartnerPayouts !== 1 ? "s" : ""} pending
              <ArrowRight size={12} />
            </Link>
          )}
          {pendingStockOrders > 0 && (
            <Link href="/admin/pending-stock" className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-80"
              style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)", color: "#3b82f6" }}>
              <Clock size={14} /> {pendingStockOrders} pending stock orders
              <ArrowRight size={12} />
            </Link>
          )}
          {failedOrders > 0 && (
            <Link href="/admin/orders?status=FAILED" className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-80"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444" }}>
              <XCircle size={14} /> {failedOrders} failed orders
              <ArrowRight size={12} />
            </Link>
          )}
        </div>
      )}

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map(({ label, value, sub, icon: Icon, color, pct, pctLabel }) => {
          const c = colorMap[color];
          const up = (pct ?? 0) >= 0;
          return (
            <div key={label} className="rounded-2xl p-5 flex flex-col justify-between"
              style={{ background: c.bg, border: `1px solid ${c.border}` }}>
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: c.icon }}>
                  <Icon size={18} style={{ color: c.text }} />
                </div>
                {pct !== null && (
                  <span className={`flex items-center gap-0.5 text-xs font-bold px-2 py-1 rounded-full ${up ? "text-green-400 bg-green-400/10" : "text-red-400 bg-red-400/10"}`}>
                    {up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    {Math.abs(pct).toFixed(1)}%
                  </span>
                )}
              </div>
              <div>
                <p className="text-xs text-zinc-500 font-medium mb-1">{label}</p>
                <p className="text-2xl font-black text-white tabular-nums leading-none">{value}</p>
                <p className="text-xs text-zinc-600 mt-1.5">{sub} {pctLabel && <span className="text-zinc-700">· {pctLabel}</span>}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Secondary Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Customers", value: totalUsers.toLocaleString(), sub: `+${newUsersToday} today · +${newUsersWeek} this week`, icon: Users, href: "/admin/customers" },
          { label: "Total Products", value: totalProducts, sub: `${activeProducts} active`, icon: Package, href: "/admin/products" },
          { label: "Pending Orders", value: pendingOrders, sub: "awaiting payment", icon: Clock, href: "/admin/orders?status=PENDING" },
          { label: "Total Reviews", value: totalReviews, sub: "all time", icon: Star, href: "/admin/reviews" },
        ].map(({ label, value, sub, icon: Icon, href }) => (
          <Link key={label} href={href}
            className="rounded-2xl p-4 flex flex-col gap-3 transition-all hover:-translate-y-0.5 hover:border-white/10 group"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <Icon size={15} className="text-zinc-400 group-hover:text-white transition-colors" />
            </div>
            <div>
              <p className="text-xl font-black text-white tabular-nums">{value}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
              <p className="text-[10px] text-zinc-700 mt-0.5">{sub}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Revenue Chart ── */}
      <RevenueChart />

      {/* ── Bottom Grid: Recent Orders + Low Stock + Quick Actions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Orders */}
        <div className="lg:col-span-2 rounded-2xl overflow-hidden"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <ShoppingCart size={14} className="text-orange-400" /> Recent Orders
            </h2>
            <Link href="/admin/orders" className="text-xs text-zinc-500 hover:text-orange-400 flex items-center gap-1 transition-colors">
              View all <ArrowRight size={11} />
            </Link>
          </div>
          <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
            {(recentOrders as { id: string; amount: unknown; status: string; createdAt: Date; paymentProvider: string; product: { title: string }; user: { email: string } | null }[]).map((o) => {
              const badge = STATUS_MAP[o.status] ?? { label: o.status, bg: "rgba(156,163,175,0.1)", text: "#9ca3af" };
              return (
                <div key={o.id} className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[11px] font-mono text-zinc-600">#{o.id.slice(-6).toUpperCase()}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: badge.bg, color: badge.text }}>
                        {badge.label}
                      </span>
                    </div>
                    <p className="text-sm text-white truncate font-medium">{o.product.title}</p>
                    <p className="text-xs text-zinc-600 mt-0.5">{o.user?.email ?? "Guest"}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-black text-white tabular-nums">${Number(o.amount).toFixed(2)}</p>
                    <p className="text-xs text-zinc-700 mt-0.5">{new Date(o.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: Low Stock + Quick Actions */}
        <div className="flex flex-col gap-4">
          {/* Low Stock Alert */}
          {(lowStockProducts as { id: string; title: string; stockCount: number }[]).length > 0 && (
            <div className="rounded-2xl p-5"
              style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)" }}>
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle size={14} className="text-red-400" />
                <span className="text-sm font-bold text-red-400">Low Stock Alert</span>
              </div>
              <div className="space-y-2.5">
                {(lowStockProducts as { id: string; title: string; stockCount: number }[]).map((p) => (
                  <div key={p.id} className="flex items-center justify-between">
                    <Link href={`/admin/products/${p.id}/inventory`}
                      className="text-xs text-zinc-400 hover:text-white transition-colors truncate max-w-[150px]">
                      {p.title}
                    </Link>
                    <span className={`text-xs font-bold tabular-nums ${p.stockCount === 0 ? "text-red-400" : "text-yellow-400"}`}>
                      {p.stockCount === 0 ? "Empty" : `${p.stockCount} left`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="rounded-2xl p-5"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Quick Actions</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { href: "/admin/products/new", label: "Add Product", icon: Package },
                { href: "/admin/discounts", label: "Discounts", icon: Tag },
                { href: "/admin/analytics", label: "Analytics", icon: BarChart2 },
                { href: "/admin/ai", label: "AI Assistant", icon: Zap },
                { href: "/admin/orders", label: "All Orders", icon: ShoppingCart },
                { href: "/admin/customers", label: "Customers", icon: Users },
              ].map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl text-center transition-all hover:bg-white/[0.04] hover:-translate-y-0.5 group"
                  style={{ border: "1px solid rgba(255,255,255,0.05)" }}>
                  <Icon size={16} className="text-zinc-500 group-hover:text-orange-400 transition-colors" />
                  <span className="text-[11px] text-zinc-500 group-hover:text-white transition-colors font-medium leading-tight">{label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
