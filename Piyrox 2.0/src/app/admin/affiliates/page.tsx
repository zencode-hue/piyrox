import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { UserCheck, Link as LinkIcon, DollarSign } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminAffiliatesPage() {
  await requireAdmin();

  const affiliates = await db.affiliate.findMany({
    orderBy: { totalEarned: "desc" },
    include: {
      user: { select: { email: true, name: true } },
      _count: { select: { referrals: true } },
    },
  });

  return (
    <div className="space-y-6 pb-8">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <UserCheck size={24} className="text-orange-400" />
            Affiliates
          </h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            Manage {affiliates.length} affiliate marketers and their earnings
          </p>
        </div>
      </div>

      <div className="admin-card overflow-hidden mt-8">
        {affiliates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <UserCheck size={48} className="text-zinc-700 mb-4" />
            <p className="text-zinc-400 font-medium text-lg">No affiliates yet</p>
            <p className="text-zinc-500 text-sm mt-1">Users can become affiliates from their dashboard.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="text-zinc-500 text-xs uppercase tracking-wider" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <th className="text-left px-5 py-4 font-semibold">Affiliate User</th>
                  <th className="text-left px-5 py-4 font-semibold">Referral Code</th>
                  <th className="text-right px-5 py-4 font-semibold">Commission</th>
                  <th className="text-right px-5 py-4 font-semibold">Referrals</th>
                  <th className="text-right px-5 py-4 font-semibold">Total Earned</th>
                  <th className="text-right px-5 py-4 font-semibold">Pending</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                {affiliates.map((a) => (
                  <tr key={a.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-5 py-4">
                      <span className="block font-medium text-white">{a.user.name ?? a.user.email}</span>
                      {a.user.name && <span className="text-zinc-500 text-[11px] block mt-0.5">{a.user.email}</span>}
                    </td>
                    <td className="px-5 py-4">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-orange-500/10 border border-orange-500/20">
                        <LinkIcon size={12} className="text-orange-400" />
                        <span className="font-mono text-xs font-bold text-orange-400">{a.referralCode}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="text-[11px] font-bold text-zinc-400 bg-white/5 px-2 py-1 rounded">{Number(a.commissionPct)}%</span>
                    </td>
                    <td className="px-5 py-4 text-right text-zinc-300 font-bold tabular-nums">
                      {a._count.referrals}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="text-green-400 font-bold tabular-nums">${Number(a.totalEarned).toFixed(2)}</span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="text-yellow-400 font-bold tabular-nums">${Number(a.pendingPayout).toFixed(2)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
