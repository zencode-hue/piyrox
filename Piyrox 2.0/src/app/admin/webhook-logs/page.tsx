import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { Webhook, CheckCircle, XCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function WebhookLogsPage() {
  await requireAdmin();

  const logs = await db.webhookLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6 pb-8">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Webhook size={24} className="text-purple-400" />
            Webhook Logs
          </h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            Monitor incoming webhook events from payment providers (Last 100)
          </p>
        </div>
      </div>

      <div className="admin-card overflow-hidden mt-8">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Webhook size={48} className="text-zinc-700 mb-4" />
            <p className="text-zinc-400 font-medium text-lg">No webhook logs yet</p>
            <p className="text-zinc-500 text-sm mt-1">Logs will appear here when external providers send webhooks.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="text-zinc-500 text-xs uppercase tracking-wider" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <th className="text-left px-5 py-4 font-semibold">Provider</th>
                  <th className="text-left px-5 py-4 font-semibold">Event</th>
                  <th className="text-center px-5 py-4 font-semibold">Status</th>
                  <th className="text-left px-5 py-4 font-semibold">Payload Preview</th>
                  <th className="text-right px-5 py-4 font-semibold">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-white/5 text-zinc-300">
                        {log.provider}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-mono text-[11px] font-bold text-purple-400 bg-purple-500/10 px-2 py-1 rounded border border-purple-500/20">
                        {log.eventType}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex justify-center">
                        {log.status === "processed" ? (
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500/10 text-green-400" title="Processed">
                            <CheckCircle size={14} />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500/10 text-red-400" title={log.status}>
                            <XCircle size={14} />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="max-w-[400px]">
                        <code className="block w-full truncate font-mono text-[10px] text-zinc-500 bg-black/40 p-2 rounded border border-white/5">
                          {JSON.stringify(log.payload)}
                        </code>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="text-zinc-500 text-[11px] font-medium">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
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
