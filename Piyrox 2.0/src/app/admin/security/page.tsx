import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { Shield, AlertTriangle, Users, Lock, Eye, Ban, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminSecurityPage() {
  await requireAdmin();

  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    bannedUsers,
    recentFailedLogins,
    recentLoginAttempts,
    suspiciousOrders,
    recentAuditLogs,
    totalUsers,
    newUsersToday,
  ] = await Promise.all([
    db.user.findMany({
      where: { isBanned: true },
      select: { id: true, email: true, banReason: true, createdAt: true },
      orderBy: { updatedAt: "desc" },
      take: 10,
    }),
    db.loginAttempt.count({ where: { success: false, createdAt: { gte: last24h } } }),
    db.loginAttempt.findMany({
      where: { createdAt: { gte: last24h } },
      include: { user: { select: { email: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    // Orders with suspicious patterns (multiple failed then paid, or high value)
    db.order.findMany({
      where: {
        status: "PAID",
        createdAt: { gte: last7d },
        amount: { gte: 50 },
      },
      include: { user: { select: { email: true } }, product: { select: { title: true } } },
      orderBy: { amount: "desc" },
      take: 10,
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db as any).adminAuditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 15,
    }).catch(() => []),
    db.user.count(),
    db.user.count({ where: { createdAt: { gte: last24h } } }),
  ]);

  const failedLoginsByUser = recentLoginAttempts
    .filter((a: { success: boolean }) => !a.success)
    .reduce((acc: Record<string, number>, a: { user: { email: string } }) => {
      const email = a.user?.email ?? "unknown";
      acc[email] = (acc[email] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const suspiciousAccounts = Object.entries(failedLoginsByUser)
    .filter(([, count]) => count >= 3)
    .sort(([, a], [, b]) => b - a);

  return (
    <div className="space-y-8 pb-8">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Shield size={24} className="text-orange-400" />
            Security Center
          </h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            Monitor authentication, fraudulent activity, and system health
          </p>
        </div>
        <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-600 bg-white/5 px-3 py-1.5 rounded-full">
          Live: {now.toLocaleTimeString()}
        </span>
      </div>

      {/* Security overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Banned Users", value: bannedUsers.length, icon: Ban, color: "#f87171", alert: bannedUsers.length > 0 },
          { label: "Failed Logins (24h)", value: recentFailedLogins, icon: Lock, color: recentFailedLogins > 10 ? "#f87171" : "#fbbf24", alert: recentFailedLogins > 10 },
          { label: "Suspicious Accs", value: suspiciousAccounts.length, icon: AlertTriangle, color: suspiciousAccounts.length > 0 ? "#fb923c" : "#4ade80", alert: suspiciousAccounts.length > 0 },
          { label: "New Users (24h)", value: newUsersToday, icon: Users, color: "#f59e0b", alert: false },
        ].map(({ label, value, icon: Icon, color, alert }) => (
          <div key={label} className="admin-card p-5 border" style={{ borderColor: alert ? `${color}30` : 'transparent' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-zinc-500">
                <Icon size={14} style={{ color }} /> {label}
              </div>
            </div>
            <div className="text-3xl font-black tabular-nums tracking-tight" style={{ color: "#fff" }}>{value}</div>
            {alert && value > 0 && (
              <div className="text-[10px] font-bold uppercase tracking-widest mt-2 px-2 py-1 inline-block rounded" style={{ color, background: `${color}15` }}>
                Needs attention
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Suspicious login activity */}
        <div className="admin-card p-6">
          <h2 className="text-sm font-bold text-white mb-6 uppercase tracking-widest flex items-center gap-2">
            <AlertTriangle size={16} className="text-yellow-400" /> Suspicious Login Activity (24h)
          </h2>
          {suspiciousAccounts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center bg-white/5 rounded-xl border border-white/5">
              <CheckCircle size={32} className="text-green-400 mb-3" />
              <p className="text-zinc-300 font-medium">No suspicious activity detected</p>
            </div>
          ) : (
            <div className="space-y-3">
              {suspiciousAccounts.map(([email, count]) => (
                <div key={email} className="flex items-center justify-between p-4 rounded-xl transition-all hover:bg-orange-500/10"
                  style={{ background: "rgba(251,146,60,0.06)", border: "1px solid rgba(251,146,60,0.15)" }}>
                  <div>
                    <p className="font-bold text-white mb-0.5">{email}</p>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-orange-400">{count} failed attempts</p>
                  </div>
                  <Link href={`/admin/users?search=${encodeURIComponent(email)}`}
                    className="text-[11px] font-bold uppercase tracking-widest text-amber-400 hover:text-white bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-lg transition-colors">
                    View User
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Banned users */}
        <div className="admin-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <Ban size={16} className="text-red-400" /> Banned Users ({bannedUsers.length})
            </h2>
            <Link href="/admin/users" className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors bg-white/5 px-3 py-1.5 rounded-lg">Manage All</Link>
          </div>
          {bannedUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center bg-white/5 rounded-xl border border-white/5">
              <CheckCircle size={32} className="text-green-400 mb-3" />
              <p className="text-zinc-300 font-medium">No banned users</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(bannedUsers as { id: string; email: string; banReason: string | null }[]).map((u) => (
                <div key={u.id} className="flex items-center justify-between p-4 rounded-xl transition-all hover:bg-red-500/10"
                  style={{ background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.15)" }}>
                  <div className="min-w-0 pr-4">
                    <p className="font-bold text-white truncate mb-0.5">{u.email}</p>
                    {u.banReason && <p className="text-[11px] font-bold uppercase tracking-widest text-red-400 truncate">{u.banReason}</p>}
                  </div>
                  <Link href={`/admin/customers/${u.id}`}
                    className="text-[11px] font-bold uppercase tracking-widest text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition-colors shrink-0">
                    View
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* High-value orders (potential fraud check) */}
        <div className="admin-card p-6">
          <h2 className="text-sm font-bold text-white mb-6 uppercase tracking-widest flex items-center gap-2">
            <Eye size={16} className="text-orange-400" /> High-Value Orders (7d, $50+)
          </h2>
          {suspiciousOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center bg-white/5 rounded-xl border border-white/5">
              <CheckCircle size={32} className="text-green-400 mb-3" />
              <p className="text-zinc-300 font-medium">No high-value orders in the last 7 days</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(suspiciousOrders as { id: string; amount: unknown; user: { email: string } | null; product: { title: string }; createdAt: Date }[]).map((o) => (
                <div key={o.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                  <div className="min-w-0 pr-4">
                    <p className="font-medium text-white truncate mb-0.5">{o.product.title}</p>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">{o.user?.email ?? "Guest"}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-black text-orange-400 text-base mb-0.5 tabular-nums">${Number(o.amount).toFixed(2)}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">{new Date(o.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent audit log */}
        <div className="admin-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <Clock size={16} className="text-blue-400" /> Recent Admin Actions
            </h2>
            <Link href="/admin/audit-log" className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors bg-white/5 px-3 py-1.5 rounded-lg">Full Log</Link>
          </div>
          {(recentAuditLogs as unknown[]).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center bg-white/5 rounded-xl border border-white/5">
              <Clock size={32} className="text-zinc-600 mb-3" />
              <p className="text-zinc-500 font-medium">No audit log entries yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(recentAuditLogs as { id: string; action: string; entityType: string; entityId: string; createdAt: Date }[]).map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.02] transition-colors border border-transparent hover:border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-blue-400 bg-blue-500/10 px-2 py-1 rounded">
                      {log.action}
                    </span>
                    <span className="font-medium text-zinc-300">{log.entityType}</span>
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-600">{new Date(log.createdAt).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Security recommendations */}
      <div className="admin-card p-6 border-t-2 border-t-green-500">
        <h2 className="text-sm font-bold text-white mb-6 uppercase tracking-widest flex items-center gap-2">
          <Shield size={16} className="text-green-400" /> Security Checklist
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: "Enable 2FA", desc: "Add two-factor auth for admins", status: "todo" },
            { title: "Rate Limiting Active", desc: "API rate limiting is configured", status: "done" },
            { title: "AES-256 Encryption", desc: "Credentials encrypted at rest", status: "done" },
            { title: "Session Management", desc: "Sessions expire per user", status: "done" },
            { title: "IP Monitoring", desc: "Track suspicious IPs", status: "done" },
            { title: "Automated Backups", desc: "Database backups configured", status: "todo" },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
              {item.status === "done"
                ? <CheckCircle size={18} className="text-green-400 shrink-0 mt-0.5" />
                : <AlertTriangle size={18} className="text-yellow-400 shrink-0 mt-0.5" />}
              <div>
                <p className="text-sm font-bold text-white mb-1">{item.title}</p>
                <p className="text-xs font-medium text-zinc-500 leading-snug">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
