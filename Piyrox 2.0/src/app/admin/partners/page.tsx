import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { Handshake, Link as LinkIcon, Wallet } from "lucide-react";
import PartnerActions from "./PartnerActions";
import Link from "next/link";

export const dynamic = "force-dynamic";

const STATUS_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  ACTIVE: { label: "Active", bg: "bg-green-500/10", text: "text-green-400" },
  PENDING: { label: "Pending", bg: "bg-yellow-500/10", text: "text-yellow-400" },
  SUSPENDED: { label: "Suspended", bg: "bg-red-500/10", text: "text-red-400" },
};

export default async function AdminPartnersPage() {
  await requireAdmin();

  const partners = await db.partnerAffiliate.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { email: true, name: true } },
      _count: { select: { referrals: true } },
      payoutRequests: { where: { status: "PENDING" }, select: { id: true } },
    },
  });

  const pendingPayouts = partners.reduce((acc, p) => acc + p.payoutRequests.length, 0);

  return (
    <div className="space-y-6 pb-8">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Handshake size={24} className="text-orange-400" />
            Partner Affiliates
          </h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            Manage {partners.length} exclusive partners and payouts
          </p>
        </div>
        {pendingPayouts > 0 && (
          <Link href="/admin/partners/payouts"
            className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 px-4 py-2 rounded-xl hover:bg-yellow-500/20 transition-all">
            <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            <span className="text-[11px] font-bold text-yellow-400 uppercase tracking-widest">{pendingPayouts} Pending Payout{pendingPayouts > 1 ? "s" : ""}</span>
          </Link>
        )}
      </div>

      <div className="admin-card overflow-hidden mt-8">
        {partners.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Handshake size={48} className="text-zinc-700 mb-4" />
            <p className="text-zinc-400 font-medium text-lg">No partner applications yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[1000px]">
              <thead>
                <tr className="text-zinc-500 text-xs uppercase tracking-wider" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <th className="text-left px-5 py-4 font-semibold">Partner</th>
                  <th className="text-left px-5 py-4 font-semibold">Code</th>
                  <th className="text-center px-5 py-4 font-semibold">Status</th>
                  <th className="text-right px-5 py-4 font-semibold">Referrals</th>
                  <th className="text-right px-5 py-4 font-semibold">Commission</th>
                  <th className="text-right px-5 py-4 font-semibold">Balance</th>
                  <th className="text-right px-5 py-4 font-semibold">Total Earned</th>
                  <th className="text-left px-5 py-4 font-semibold">Payout Wallet</th>
                  <th className="text-right px-5 py-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                {partners.map((p) => {
                  const badge = STATUS_BADGE[p.status] ?? { label: p.status, bg: "bg-zinc-500/10", text: "text-zinc-400" };
                  return (
                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-5 py-4">
                        <span className="block font-medium text-white">{p.user.name ?? p.user.email}</span>
                        {p.user.name && <span className="text-zinc-500 text-[11px] block mt-0.5">{p.user.email}</span>}
                      </td>
                      <td className="px-5 py-4">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-orange-500/10 border border-orange-500/20">
                          <LinkIcon size={12} className="text-orange-400" />
                          <span className="font-mono text-xs font-bold text-orange-400">{p.referralCode}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${badge.bg} ${badge.text}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right text-zinc-300 font-bold tabular-nums">
                        {p._count.referrals}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="text-[11px] font-bold text-zinc-400 bg-white/5 px-2 py-1 rounded">{Number(p.commissionPct)}%</span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="text-yellow-400 font-bold tabular-nums">${Number(p.balance).toFixed(2)}</span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="text-green-400 font-bold tabular-nums">${Number(p.totalEarned).toFixed(2)}</span>
                      </td>
                      <td className="px-5 py-4">
                        {p.cryptoWallet ? (
                          <div className="flex items-start gap-2">
                            <Wallet size={14} className="text-zinc-500 mt-0.5 shrink-0" />
                            <div>
                              <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 block">{p.walletType}</span>
                              <span className="font-mono text-xs text-zinc-500 truncate max-w-[120px] block">{p.cryptoWallet}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 bg-white/5 px-2 py-1 rounded">Not Set</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <PartnerActions partnerId={p.id} currentStatus={p.status} commissionPct={Number(p.commissionPct)} />
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
