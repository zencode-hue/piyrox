import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import Link from "next/link";
import { Users, ExternalLink, ShieldAlert } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  await requireAdmin();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const users = await (db.user.findMany as any)({
    where: { role: "CUSTOMER" },
    orderBy: { createdAt: "desc" },
    take: 300,
    select: {
      id: true, email: true, name: true, createdAt: true, balance: true, isBanned: true,
      orders: { where: { status: "PAID" }, select: { amount: true } },
    },
  }) as Array<{
    id: string; email: string; name: string | null; createdAt: Date;
    balance: { toString(): string }; isBanned: boolean;
    orders: { amount: { toString(): string } }[];
  }>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const guestOrders = await (db.order.findMany as any)({
    where: { guestEmail: { not: null }, userId: null },
    orderBy: { createdAt: "desc" },
    select: { guestEmail: true, amount: true, status: true, createdAt: true },
  }) as Array<{ guestEmail: string | null; amount: { toString(): string }; status: string; createdAt: Date }>;

  const guestMap = new Map<string, { email: string; orders: number; spent: number; lastOrder: Date }>();
  for (const o of guestOrders) {
    if (!o.guestEmail) continue;
    const existing = guestMap.get(o.guestEmail);
    const spent = o.status === "PAID" ? Number(o.amount) : 0;
    if (existing) {
      existing.orders++;
      existing.spent += spent;
      if (o.createdAt > existing.lastOrder) existing.lastOrder = o.createdAt;
    } else {
      guestMap.set(o.guestEmail, { email: o.guestEmail, orders: 1, spent, lastOrder: o.createdAt });
    }
  }

  const guests = Array.from(guestMap.values()).sort((a, b) => b.lastOrder.getTime() - a.lastOrder.getTime());

  return (
    <div className="space-y-6 pb-8">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Users size={24} className="text-orange-400" />
            Customers
          </h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            Total {users.length + guests.length} customers ({users.length} registered, {guests.length} guests)
          </p>
        </div>
      </div>

      <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-8 mb-4">Registered Customers ({users.length})</h2>
      <div className="admin-card overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="text-zinc-500 text-xs uppercase tracking-wider" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <th className="text-left px-5 py-4 font-semibold">Customer</th>
              <th className="text-right px-5 py-4 font-semibold">Balance</th>
              <th className="text-right px-5 py-4 font-semibold">Orders</th>
              <th className="text-right px-5 py-4 font-semibold">Spent</th>
              <th className="text-left px-5 py-4 font-semibold">Joined</th>
              <th className="text-right px-5 py-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
            {users.map((u) => {
              const spent = u.orders.reduce((s: number, o: { amount: { toString(): string } }) => s + Number(o.amount), 0);
              return (
                <tr key={u.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      {u.isBanned && (
                        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-red-500/20 text-red-400 shrink-0" title="Banned">
                          <ShieldAlert size={12} />
                        </div>
                      )}
                      <div>
                        <span className={`block font-medium truncate max-w-[200px] ${u.isBanned ? "text-red-400" : "text-white"}`}>
                          {u.email}
                        </span>
                        {u.name && <span className="text-zinc-500 text-[11px] block mt-0.5">{u.name}</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className="text-cyan-400 font-bold tabular-nums">${Number(u.balance).toFixed(2)}</span>
                  </td>
                  <td className="px-5 py-4 text-right text-zinc-400 tabular-nums">
                    {u.orders.length}
                  </td>
                  <td className="px-5 py-4 text-right text-white font-bold tabular-nums">
                    ${spent.toFixed(2)}
                  </td>
                  <td className="px-5 py-4 text-zinc-500 text-xs">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link href={`/admin/customers/${u.id}`} className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-zinc-500 hover:text-orange-400 hover:bg-orange-500/10 transition-all">
                      <ExternalLink size={14} />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="text-center py-16">
            <Users size={40} className="mx-auto text-zinc-700 mb-4" />
            <p className="text-zinc-500 font-medium">No registered customers found.</p>
          </div>
        )}
      </div>

      {guests.length > 0 && (
        <>
          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-12 mb-4">Guest Customers ({guests.length})</h2>
          <div className="admin-card overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="text-zinc-500 text-xs uppercase tracking-wider" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <th className="text-left px-5 py-4 font-semibold">Email</th>
                  <th className="text-right px-5 py-4 font-semibold">Orders</th>
                  <th className="text-right px-5 py-4 font-semibold">Spent</th>
                  <th className="text-left px-5 py-4 font-semibold">Last Order</th>
                  <th className="text-right px-5 py-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                {guests.map((g) => (
                  <tr key={g.email} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-5 py-4 text-white font-medium truncate max-w-[200px]">
                      {g.email}
                    </td>
                    <td className="px-5 py-4 text-right text-zinc-400 tabular-nums">
                      {g.orders}
                    </td>
                    <td className="px-5 py-4 text-right text-white font-bold tabular-nums">
                      ${g.spent.toFixed(2)}
                    </td>
                    <td className="px-5 py-4 text-zinc-500 text-xs">
                      {new Date(g.lastOrder).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link href={`/admin/customers/${encodeURIComponent(g.email)}`} className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-zinc-500 hover:text-orange-400 hover:bg-orange-500/10 transition-all">
                        <ExternalLink size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
