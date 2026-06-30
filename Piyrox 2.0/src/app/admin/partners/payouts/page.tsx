import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { ArrowLeft, Wallet, CheckCircle, XCircle, Clock } from "lucide-react";
import Link from "next/link";
import PayoutActions from "./PayoutActions";

export const dynamic = "force-dynamic";

const STATUS_BADGE: Record<string, { label: string; bg: string; text: string; icon: any }> = {
  PENDING: { label: "Pending", bg: "bg-yellow-500/10", text: "text-yellow-400", icon: Clock },
  APPROVED: { label: "Approved", bg: "bg-green-500/10", text: "text-green-400", icon: CheckCircle },
  REJECTED: { label: "Rejected", bg: "bg-red-500/10", text: "text-red-400", icon: XCircle },
};

export default async function AdminPayoutsPage() {
  await requireAdmin();

  const payouts = await db.partnerPayoutRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      partnerAffiliate: {
        select: { referralCode: true, user: { select: { email: true, name: true } } },
      },
    },
  });

  const pendingTotal = payouts
    .filter((p) => p.status === "PENDING")
    .reduce((acc, p) => acc + Number(p.amount), 0);

  return (
    <div className="space-y-6 pb-8">
      {/* ── Header ── */}
      <div className="flex items-start gap-4">
        <Link href="/admin/partners" className="mt-1 flex items-center justify-center w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Wallet size={24} className="text-yellow-400" />
            Payout Requests
          </h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            Review and process affiliate withdrawals
          </p>
        </div>
      </div>

      {pendingTotal > 0 && (
        <div className="admin-card p-5 mt-6 border-yellow-500/20 bg-yellow-500/5 flex items-center justify-between">
          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-yellow-400 flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" /> Pending Total
            </h2>
            <p className="text-2xl font-black text-white tabular-nums mt-1">${pendingTotal.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <span className="text-zinc-500 text-xs font-medium">Across {payouts.filter((p) => p.status === "PENDING").length} request(s)</span>
          </div>
        </div>
      )}

      <div className="admin-card overflow-hidden mt-6">
        {payouts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Wallet size={48} className="text-zinc-700 mb-4" />
            <p className="text-zinc-400 font-medium text-lg">No payout requests yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="text-zinc-500 text-xs uppercase tracking-wider" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <th className="text-left px-5 py-4 font-semibold">Partner</th>
                  <th className="text-right px-5 py-4 font-semibold">Amount</th>
                  <th className="text-left px-5 py-4 font-semibold">Payout Wallet</th>
                  <th className="text-center px-5 py-4 font-semibold">Status</th>
                  <th className="text-left px-5 py-4 font-semibold">TX Hash</th>
                  <th className="text-left px-5 py-4 font-semibold">Date</th>
                  <th className="text-right px-5 py-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                {payouts.map((p) => {
                  const badge = STATUS_BADGE[p.status] ?? { label: p.status, bg: "bg-zinc-500/10", text: "text-zinc-400", icon: Clock };
                  const Icon = badge.icon;
                  return (
                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-5 py-4">
                        <span className="block font-medium text-white">{p.partnerAffiliate.user.name ?? p.partnerAffiliate.user.email}</span>
                        <span className="text-zinc-500 text-[11px] block mt-0.5">{p.partnerAffiliate.user.email}</span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="text-yellow-400 font-bold tabular-nums text-base">${Number(p.amount).toFixed(2)}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-start gap-2">
                          <Wallet size={14} className="text-zinc-500 mt-0.5 shrink-0" />
                          <div>
                            <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 block">{p.walletType}</span>
                            <span className="font-mono text-xs text-zinc-500 truncate max-w-[120px] block">{p.cryptoWallet}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${badge.bg} ${badge.text}`}>
                          <Icon size={12} />
                          {badge.label}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {p.txHash ? (
                          <span className="font-mono text-xs text-zinc-400 truncate max-w-[120px] block">{p.txHash}</span>
                        ) : (
                          <span className="text-zinc-600 text-xs italic">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-zinc-500 text-xs font-medium">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {p.status === "PENDING" && <PayoutActions payoutId={p.id} />}
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
