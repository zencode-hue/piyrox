import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { ShoppingCart, ExternalLink, Search } from "lucide-react";
import RedeliverButton from "./RedeliverButton";
import OrderActions from "./OrderActions";
import GiftCardApproveButton from "./GiftCardApproveButton";
import Link from "next/link";

export const dynamic = "force-dynamic";

const STATUS_MAP: Record<string, { label: string; bg: string; text: string }> = {
  PAID:          { label: "Paid",       bg: "rgba(34,197,94,0.1)",  text: "#22c55e" },
  PENDING:       { label: "Pending",    bg: "rgba(234,179,8,0.1)",  text: "#eab308" },
  PENDING_STOCK: { label: "Processing", bg: "rgba(59,130,246,0.1)", text: "#3b82f6" },
  FAILED:        { label: "Failed",     bg: "rgba(239,68,68,0.1)",  text: "#ef4444" },
  REFUNDED:      { label: "Refunded",   bg: "rgba(156,163,175,0.1)",text: "#9ca3af" },
};

const PAYMENT_SHORT: Record<string, string> = {
  paymento: "Crypto",
  balance: "Wallet",
  binance_gift_card: "Gift Card",
  discord: "Discord",
};

export default async function AdminOrdersPage() {
  await requireAdmin();

  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      user: { select: { id: true, email: true, name: true } },
      product: { select: { title: true } },
      deliveryLog: { select: { id: true } },
    },
  }) as Array<{
    id: string; amount: unknown; discountAmount: unknown; status: string; paymentProvider: string;
    createdAt: Date; adminNote?: string | null; guestEmail?: string | null;
    user: { id: string; email: string; name: string | null } | null;
    product: { title: string }; deliveryLog: { id: string } | null;
  }>;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://piyrox.sbs";

  return (
    <div className="space-y-6 pb-8">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <ShoppingCart size={24} className="text-orange-400" />
            Invoices
          </h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            Manage {orders.length} recent orders
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input type="text" placeholder="Search orders..." className="input-field pl-9 h-10 w-64 text-sm" />
          </div>
        </div>
      </div>

      <div className="admin-card overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="text-zinc-500 text-xs uppercase tracking-wider" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <th className="text-left px-5 py-4 font-semibold">Invoice</th>
              <th className="text-left px-5 py-4 font-semibold">Customer</th>
              <th className="text-left px-5 py-4 font-semibold">Product</th>
              <th className="text-right px-5 py-4 font-semibold">Amount</th>
              <th className="text-left px-5 py-4 font-semibold">Payment</th>
              <th className="text-center px-5 py-4 font-semibold">Status</th>
              <th className="text-left px-5 py-4 font-semibold">Date</th>
              <th className="text-right px-5 py-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
            {orders.map((o) => {
              const customerEmail = o.user?.email ?? o.guestEmail ?? "Guest";
              const customerId = o.user?.id;
              const lookupEmail = o.guestEmail ?? null;
              const badge = STATUS_MAP[o.status] ?? { label: o.status, bg: "rgba(156,163,175,0.1)", text: "#9ca3af" };
              return (
                <tr key={o.id} className="hover:bg-white/[0.02] transition-colors group">
                  {/* Invoice ID */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <a href={`${appUrl}/invoice/${o.id}`} target="_blank" rel="noopener noreferrer"
                        className="font-mono text-xs text-orange-400 hover:text-orange-300 transition-colors">
                        MMT-{o.id.slice(-6).toUpperCase()}
                      </a>
                      <a href={`${appUrl}/invoice/${o.id}`} target="_blank" rel="noopener noreferrer" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <ExternalLink size={12} className="text-zinc-500 hover:text-zinc-300" />
                      </a>
                    </div>
                    {(o as { adminNote?: string | null }).adminNote && (
                      <p className="text-yellow-400/80 text-[10px] mt-1 font-medium truncate max-w-[120px] bg-yellow-400/10 px-2 py-0.5 rounded-full inline-block">
                        Note: {(o as { adminNote?: string | null }).adminNote}
                      </p>
                    )}
                  </td>

                  {/* Customer */}
                  <td className="px-5 py-4">
                    {customerId ? (
                      <Link href={`/admin/customers/${customerId}`}
                        className="text-zinc-300 hover:text-white transition-colors truncate max-w-[160px] block font-medium">
                        {customerEmail}
                      </Link>
                    ) : lookupEmail ? (
                      <Link href={`/admin/customers/${encodeURIComponent(lookupEmail)}`}
                        className="text-zinc-400 hover:text-white transition-colors truncate max-w-[160px] block">
                        {customerEmail}
                      </Link>
                    ) : (
                      <span className="text-zinc-500">{customerEmail}</span>
                    )}
                    {o.user?.name && <p className="text-zinc-500 text-[11px] mt-0.5">{o.user.name}</p>}
                  </td>

                  <td className="px-5 py-4 text-white truncate max-w-[160px]">{o.product.title}</td>
                  <td className="px-5 py-4 text-right">
                    <span className="text-white font-bold tabular-nums">${Number(o.amount).toFixed(2)}</span>
                    {Number(o.discountAmount) > 0 && (
                      <p className="text-green-400 text-[11px] font-medium mt-0.5">-${Number(o.discountAmount).toFixed(2)}</p>
                    )}
                  </td>
                  <td className="px-5 py-4 text-zinc-400">
                    {PAYMENT_SHORT[o.paymentProvider] ?? o.paymentProvider}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="text-[11px] px-2 py-1 rounded-full font-bold tracking-wide" style={{ background: badge.bg, color: badge.text }}>
                      {badge.label}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-zinc-500 text-xs">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {o.status === "PAID" && !o.deliveryLog && <RedeliverButton orderId={o.id} />}
                      {o.status === "PENDING_STOCK" && o.paymentProvider === "binance_gift_card" && (
                        <GiftCardApproveButton orderId={o.id} />
                      )}
                      <OrderActions orderId={o.id} currentStatus={o.status} currentNote={(o as { adminNote?: string | null }).adminNote} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {orders.length === 0 && (
          <div className="text-center py-16">
            <ShoppingCart size={40} className="mx-auto text-zinc-700 mb-4" />
            <p className="text-zinc-500 font-medium">No invoices found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
