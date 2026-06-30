import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { Users, UserPlus } from "lucide-react";
import StaffActions from "./StaffActions";

export const dynamic = "force-dynamic";

const STATUS_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  ACTIVE: { label: "Active", bg: "bg-green-500/10", text: "text-green-400" },
  PENDING: { label: "Pending", bg: "bg-yellow-500/10", text: "text-yellow-400" },
  SUSPENDED: { label: "Suspended", bg: "bg-red-500/10", text: "text-red-400" },
};

export default async function AdminStaffPage() {
  await requireAdmin();

  const staff = await db.staffMember.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, position: true, status: true, joinedAt: true, createdAt: true },
  });

  const pending = staff.filter((s) => s.status === "PENDING").length;

  return (
    <div className="space-y-6 pb-8">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Users size={24} className="text-orange-400" />
            Staff Members
          </h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            Manage {staff.length} staff accounts and permissions
          </p>
        </div>
        {pending > 0 && (
          <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 px-4 py-2 rounded-xl">
            <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            <span className="text-[11px] font-bold text-yellow-400 uppercase tracking-widest">{pending} Pending</span>
          </div>
        )}
      </div>

      <div className="admin-card overflow-hidden mt-8">
        {staff.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Users size={48} className="text-zinc-700 mb-4" />
            <p className="text-zinc-400 font-medium text-lg">No staff accounts yet</p>
            <p className="text-zinc-500 text-sm mt-1">Staff can register at <span className="font-mono text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded">/staff-register</span></p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="text-zinc-500 text-xs uppercase tracking-wider" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <th className="text-left px-5 py-4 font-semibold">Staff Member</th>
                  <th className="text-left px-5 py-4 font-semibold">Position</th>
                  <th className="text-center px-5 py-4 font-semibold">Status</th>
                  <th className="text-left px-5 py-4 font-semibold">Joined</th>
                  <th className="text-right px-5 py-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                {staff.map((s) => {
                  const badge = STATUS_BADGE[s.status] ?? { label: s.status, bg: "bg-zinc-500/10", text: "text-zinc-400" };
                  return (
                    <tr key={s.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-5 py-4">
                        <span className="block font-medium text-white">{s.name}</span>
                        <span className="text-zinc-500 text-[11px] block mt-0.5">{s.email}</span>
                      </td>
                      <td className="px-5 py-4">
                        {s.position ? (
                          <span className="text-zinc-300 font-medium">{s.position}</span>
                        ) : (
                          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 bg-white/5 px-2 py-1 rounded">Not Set</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${badge.bg} ${badge.text}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-zinc-500 text-xs font-medium">
                        {new Date(s.joinedAt ?? s.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <StaffActions staffId={s.id} currentStatus={s.status} currentPosition={s.position} />
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
