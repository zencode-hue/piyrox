import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { ClipboardList, ShieldAlert, CheckCircle, FileEdit, Trash2, RotateCcw, Activity } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AuditLogPage() {
  await requireAdmin();

  const logs = await db.adminAuditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  // Get admin names
  const adminIds = Array.from(new Set(logs.map((l) => l.adminId)));
  const admins = await db.user.findMany({ where: { id: { in: adminIds } }, select: { id: true, email: true } });
  const adminMap = Object.fromEntries(admins.map((a) => [a.id, a.email]));

  const ACTION_MAP: Record<string, { label: string; color: string; icon: any }> = {
    redeliver: { label: "Redelivered", color: "text-blue-400 bg-blue-500/10", icon: RotateCcw },
    ban: { label: "Banned", color: "text-red-400 bg-red-500/10", icon: ShieldAlert },
    unban: { label: "Unbanned", color: "text-green-400 bg-green-500/10", icon: CheckCircle },
    delete: { label: "Deleted", color: "text-red-400 bg-red-500/10", icon: Trash2 },
    edit: { label: "Edited", color: "text-yellow-400 bg-yellow-500/10", icon: FileEdit },
    balance_credit: { label: "Credited", color: "text-cyan-400 bg-cyan-500/10", icon: Activity },
    balance_debit: { label: "Debited", color: "text-orange-400 bg-orange-500/10", icon: Activity },
    status_update: { label: "Status Upd", color: "text-purple-400 bg-purple-500/10", icon: Activity },
  };

  return (
    <div className="space-y-6 pb-8">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <ClipboardList size={24} className="text-orange-400" />
            Audit Log
          </h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            Monitor all administrative actions across the platform ({logs.length} recent events)
          </p>
        </div>
      </div>

      <div className="admin-card overflow-hidden mt-8">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="text-zinc-500 text-xs uppercase tracking-wider" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <th className="text-left px-5 py-4 font-semibold">Admin</th>
                <th className="text-left px-5 py-4 font-semibold">Action</th>
                <th className="text-left px-5 py-4 font-semibold">Entity</th>
                <th className="text-left px-5 py-4 font-semibold">Entity ID</th>
                <th className="text-left px-5 py-4 font-semibold">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
              {logs.map((log) => {
                const actionConf = ACTION_MAP[log.action] ?? { label: log.action, color: "text-zinc-400 bg-zinc-500/10", icon: Activity };
                const Icon = actionConf.icon;
                return (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-5 py-4 text-zinc-300 font-medium">
                      {adminMap[log.adminId] ?? log.adminId.slice(0, 8)}
                    </td>
                    <td className="px-5 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${actionConf.color}`}>
                        <Icon size={12} />
                        {actionConf.label}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-zinc-400 font-medium">
                      {log.entityType}
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs text-zinc-500 bg-white/5 px-2 py-1 rounded">
                        {log.entityId.slice(0, 16)}…
                      </span>
                    </td>
                    <td className="px-5 py-4 text-zinc-500 text-xs">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {logs.length === 0 && (
          <div className="text-center py-16">
            <ClipboardList size={40} className="mx-auto text-zinc-700 mb-4" />
            <p className="text-zinc-500 font-medium">No audit logs found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
