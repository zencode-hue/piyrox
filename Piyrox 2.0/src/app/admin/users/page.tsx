import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { Users, ShieldAlert } from "lucide-react";
import UserActions from "./UserActions";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  await requireAdmin();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const users = await (db.user.findMany as any)({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true, email: true, name: true, role: true, createdAt: true, balance: true,
      isBanned: true, banReason: true,
      orders: { where: { status: "PAID" }, select: { amount: true } },
      affiliate: { select: { referralCode: true } },
    },
  }) as Array<{
    id: string; email: string; name: string | null; role: string; createdAt: Date;
    balance: { toString(): string }; isBanned: boolean; banReason: string | null;
    orders: { amount: { toString(): string } }[];
    affiliate: { referralCode: string } | null;
  }>;

  return (
    <div className="space-y-6 pb-8">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Users size={24} className="text-orange-400" />
            Users Management
          </h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            Manage {users.length} registered users, roles, and balances
          </p>
        </div>
      </div>

      <div className="admin-card overflow-hidden mt-8">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="text-zinc-500 text-xs uppercase tracking-wider" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <th className="text-left px-5 py-4 font-semibold">User</th>
                <th className="text-center px-5 py-4 font-semibold">Role & Status</th>
                <th className="text-right px-5 py-4 font-semibold">Balance</th>
                <th className="text-right px-5 py-4 font-semibold">Orders</th>
                <th className="text-right px-5 py-4 font-semibold">Spent</th>
                <th className="text-left px-5 py-4 font-semibold">Joined</th>
                <th className="text-right px-5 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
              {users.map((u) => {
                const totalSpend = u.orders.reduce((s: number, o: { amount: { toString(): string } }) => s + Number(o.amount), 0);
                return (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {u.isBanned && (
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500/20 text-red-400 shrink-0" title="Banned">
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
                    <td className="px-5 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${u.role === "ADMIN" ? "bg-purple-500/20 text-purple-400" : "bg-zinc-500/20 text-zinc-300"}`}>
                          {u.role}
                        </span>
                        {u.isBanned && <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Banned</span>}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="text-cyan-400 font-bold tabular-nums">${Number(u.balance).toFixed(2)}</span>
                    </td>
                    <td className="px-5 py-4 text-right text-zinc-400 font-medium tabular-nums">
                      {u.orders.length}
                    </td>
                    <td className="px-5 py-4 text-right text-white font-bold tabular-nums">
                      ${totalSpend.toFixed(2)}
                    </td>
                    <td className="px-5 py-4 text-zinc-500 text-xs">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <UserActions userId={u.id} email={u.email} name={u.name ?? ""} role={u.role} balance={Number(u.balance)} isBanned={u.isBanned} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {users.length === 0 && (
          <div className="text-center py-16">
            <Users size={40} className="mx-auto text-zinc-700 mb-4" />
            <p className="text-zinc-500 font-medium">No users found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
