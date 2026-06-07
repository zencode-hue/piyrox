import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getServerSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { decrypt } from "@/lib/crypto";
import { Package, ShoppingBag, Wallet, Star, ArrowRight, TrendingUp } from "lucide-react";
import CopyButton from "./CopyButton";

export const metadata: Metadata = {
  title: "Dashboard — PIYROX",
  description: "Your PIYROX account overview.",
};

export const dynamic = "force-dynamic";

const STATUS_BADGE: Record<string, string> = {
  PAID: "bg-white/10 text-white border border-white/10 px-2 py-0.5 rounded-md",
  PENDING: "bg-white/5 text-zinc-400 border border-white/5 px-2 py-0.5 rounded-md",
  FAILED: "bg-white/5 text-zinc-500 border border-white/5 line-through px-2 py-0.5 rounded-md",
  PENDING_STOCK: "bg-white/5 text-zinc-400 border border-white/5 px-2 py-0.5 rounded-md",
  REFUNDED: "bg-white/5 text-zinc-500 border border-white/5 px-2 py-0.5 rounded-md",
};
const CATEGORY_LABELS: Record<string, string> = {
  STREAMING: "Streaming", AI_TOOLS: "AI Tools", SOFTWARE: "Software", GAMING: "Gaming",
};

export default async function DashboardPage() {
  const session = await getServerSession();
  if (!session?.user?.id) redirect("/auth/login");

  const [user, orders, affiliate, partnerAffiliate] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db.user.findUnique as any)({ where: { id: session.user.id }, select: { balance: true, name: true, email: true, createdAt: true } }),
    db.order.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        product: { select: { title: true, category: true } },
        deliveryLog: { include: { inventoryItem: { select: { encryptedData: true, iv: true, authTag: true } } } },
      },
    }),
    db.affiliate.findUnique({ where: { userId: session.user.id } }),
    db.partnerAffiliate.findUnique({ where: { userId: session.user.id } }),
  ]);

  const balance = Number(user?.balance ?? 0);
  const totalOrders = await db.order.count({ where: { userId: session.user.id } });
  const deliveredOrders = await db.order.count({ where: { userId: session.user.id, status: "PAID" } });

  const recentOrders = orders.map((order: {
    id: string; amount: unknown; status: string; createdAt: Date;
    product: { title: string; category: string };
    deliveryLog?: { inventoryItem?: { encryptedData: string; iv: string; authTag: string } | null } | null;
  }) => {
    let credentials: string | null = null;
    if (order.deliveryLog?.inventoryItem) {
      try { credentials = decrypt(order.deliveryLog.inventoryItem.encryptedData, order.deliveryLog.inventoryItem.iv, order.deliveryLog.inventoryItem.authTag); }
      catch { credentials = null; }
    }
    return { ...order, amount: Number(order.amount), credentials };
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Welcome back, {user?.name ?? session.user.email}</h1>
        <p className="text-zinc-400 text-sm mt-1">Here&apos;s your account overview.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Orders", value: totalOrders, icon: ShoppingBag },
          { label: "Delivered", value: deliveredOrders, icon: Package },
          { label: "Balance", value: `$${balance.toFixed(2)}`, icon: Wallet },
          { label: "Promo Earned", value: `$${Number(affiliate?.totalEarned ?? 0).toFixed(2)}`, icon: Star },
        ].map((s) => (
          <div key={s.label} className="bg-white/[0.02] border border-white/5 backdrop-blur-md rounded-xl p-5">
            <div className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center mb-3">
              <s.icon size={16} className="text-white" />
            </div>
            <div className="text-2xl font-bold text-white">{s.value}</div>
            <div className="text-xs text-zinc-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Link href="/dashboard/wallet" className="bg-white/[0.02] border border-white/5 backdrop-blur-md rounded-xl p-4 flex items-center justify-between hover:border-white/20 transition-colors group">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center">
              <Wallet size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Top Up Wallet</p>
              <p className="text-xs text-zinc-400">${balance.toFixed(2)} available</p>
            </div>
          </div>
          <ArrowRight size={14} className="text-zinc-500 group-hover:text-white transition-colors" />
        </Link>
        <Link href="/dashboard/affiliate" className="bg-white/[0.02] border border-white/5 backdrop-blur-md rounded-xl p-4 flex items-center justify-between hover:border-white/20 transition-colors group">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center">
              <TrendingUp size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Promo Affiliate</p>
              <p className="text-xs text-zinc-400">{affiliate ? "Active" : "Join now"}</p>
            </div>
          </div>
          <ArrowRight size={14} className="text-zinc-500 group-hover:text-white transition-colors" />
        </Link>
        <Link href="/dashboard/partner" className="bg-white/[0.02] border border-white/5 backdrop-blur-md rounded-xl p-4 flex items-center justify-between hover:border-white/20 transition-colors group">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center">
              <Star size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Partner Program</p>
              <p className="text-xs text-zinc-400">{partnerAffiliate ? `${partnerAffiliate.status}` : "Apply now"}</p>
            </div>
          </div>
          <ArrowRight size={14} className="text-zinc-500 group-hover:text-white transition-colors" />
        </Link>
      </div>

      {/* Recent orders */}
      <div className="bg-white/[0.02] border border-white/5 backdrop-blur-md rounded-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <ShoppingBag size={15} className="text-white" /> Recent Orders
          </h2>
          <Link href="/dashboard/orders" className="text-xs text-zinc-400 hover:text-white transition-colors">View all</Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="p-12 text-center text-zinc-500">
            <Package size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No orders yet</p>
            <Link href="/products" className="bg-white text-black hover:bg-zinc-200 font-medium rounded-lg mt-4 inline-flex items-center justify-center text-sm px-5 py-2 transition-colors">Browse Products</Link>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {recentOrders.map((order) => (
              <div key={order.id} className="px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-white truncate">{order.product.title}</span>
                      <span className={`${STATUS_BADGE[order.status] ?? "bg-white/5 text-zinc-400 border border-white/5 px-2 py-0.5 rounded-md"} text-xs`}>{order.status}</span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">
                      <Link href={`/invoice/${order.id}`} className="text-zinc-400 hover:text-white transition-colors">MMT-{order.id.slice(-6).toUpperCase()}</Link>
                      {" · "}{new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-white shrink-0">${order.amount.toFixed(2)}</span>
                </div>
                {order.credentials && (
                  <div className="mt-3 p-3 bg-black/40 rounded-lg border border-white/5 flex items-center justify-between gap-2">
                    <code className="text-xs text-zinc-300 truncate">{order.credentials}</code>
                    <CopyButton text={order.credentials} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
