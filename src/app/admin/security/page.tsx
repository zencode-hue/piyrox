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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Shield size={22} style={{ color: "#f59e0b" }} /> Security Center
        </h1>
        <span className="text-xs text-gray-600">Last updated: {now.toLocaleTimeString()}</span>
      </div>

      {/* Security overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Banned Users", value: bannedUsers.length, icon: Ban, color: "#f87171", alert: bannedUsers.length > 0 },
          { label: "Failed Logins (24h)", value: recentFailedLogins, icon: Lock, color: recentFailedLogins > 10 ? "#f87171" : "#fbbf24", alert: recentFailedLogins > 10 },
          { label: "Suspicious Accounts", value: suspiciousAccounts.length, icon: AlertTriangle, color: suspiciousAccounts.length > 0 ? "#fb923c" : "#4ade80", alert: suspiciousAccounts.length > 0 },
          { label: "New Users (24h)", value: newUsersToday, icon: Users, color: "#f59e0b", alert: false },
        ].map(({ label, value, icon: Icon, color, alert }) => (
          <div key={label} className="glass-card p-4" style={{ borderColor: alert ? `${color}30` : undefined }}>
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
              <Icon size={12} style={{ color }} /> {label}
            </div>
            <div className="text-2xl font-bold" style={{ color }}>{value}</div>
            {alert && value > 0 && <div className="text-xs mt-1" style={{ color }}>Needs attention</div>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Suspicious login activity */}
        <div className="glass-card p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <AlertTriangle size={14} className="text-yellow-400" /> Suspicious Login Activity (24h)
          </h2>
          {suspiciousAccounts.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-green-400">
              <CheckCircle size={14} /> No suspicious activity detected
            </div>
          ) : (
            <div className="space-y-2">
              {suspiciousAccounts.map(([email, count]) => (
                <div key={email} className="flex items-center justify-between p-2.5 rounded-xl"
                  style={{ background: "rgba(251,146,60,0.06)", border: "1px solid rgba(251,146,60,0.15)" }}>
                  <div>
                    <p className="text-sm text-white">{email}</p>
                    <p className="text-xs text-orange-400">{count} failed attempts</p>
                  </div>
                  <Link href={`/admin/users?search=${encodeURIComponent(email)}`}
                    className="text-xs text-amber-400 hover:text-amber-300">
                    View User
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Banned users */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Ban size={14} className="text-red-400" /> Banned Users ({bannedUsers.length})
            </h2>
            <Link href="/admin/users" className="text-xs text-amber-400 hover:text-amber-300">Manage All</Link>
          </div>
          {bannedUsers.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-green-400">
              <CheckCircle size={14} /> No banned users
            </div>
          ) : (
            <div className="space-y-2">
              {(bannedUsers as { id: string; email: string; banReason: string | null }[]).map((u) => (
                <div key={u.id} className="flex items-center justify-between p-2.5 rounded-xl"
                  style={{ background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.15)" }}>
                  <div className="min-w-0">
                    <p className="text-sm text-white truncate">{u.email}</p>
                    {u.banReason && <p className="text-xs text-red-400 truncate">{u.banReason}</p>}
                  </div>
                  <Link href={`/admin/customers/${u.id}`}
                    className="text-xs text-amber-400 hover:text-amber-300 shrink-0 ml-2">
                    View
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* High-value orders (potential fraud check) */}
        <div className="glass-card p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Eye size={14} style={{ color: "#f59e0b" }} /> High-Value Orders (7d, $50+)
          </h2>
          {suspiciousOrders.length === 0 ? (
            <p className="text-xs text-gray-600">No high-value orders in the last 7 days</p>
          ) : (
            <div className="space-y-2">
              {(suspiciousOrders as { id: string; amount: unknown; user: { email: string } | null; product: { title: string }; createdAt: Date }[]).map((o) => (
                <div key={o.id} className="flex items-center justify-between text-sm">
                  <div className="min-w-0">
                    <p className="text-gray-300 truncate">{o.product.title}</p>
                    <p className="text-xs text-gray-600">{o.user?.email ?? "Guest"}</p>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className="font-bold text-amber-400">${Number(o.amount).toFixed(2)}</p>
                    <p className="text-xs text-gray-600">{new Date(o.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent audit log */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Clock size={14} style={{ color: "#60a5fa" }} /> Recent Admin Actions
            </h2>
            <Link href="/admin/audit-log" className="text-xs text-amber-400 hover:text-amber-300">Full Log</Link>
          </div>
          {(recentAuditLogs as unknown[]).length === 0 ? (
            <p className="text-xs text-gray-600">No audit log entries yet</p>
          ) : (
            <div className="space-y-2">
              {(recentAuditLogs as { id: string; action: string; entityType: string; entityId: string; createdAt: Date }[]).map((log) => (
                <div key={log.id} className="flex items-center justify-between text-xs">
                  <div>
                    <span className="text-amber-400 font-medium">{log.action}</span>
                    <span className="text-gray-500 ml-1">{log.entityType}</span>
                  </div>
                  <span className="text-gray-600">{new Date(log.createdAt).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Security recommendations */}
      <div className="glass-card p-5">
        <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Shield size={14} style={{ color: "#4ade80" }} /> Security Recommendations
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { title: "Enable 2FA", desc: "Add two-factor authentication for admin accounts", status: "todo" },
            { title: "Rate Limiting Active", desc: "API rate limiting is configured and active", status: "done" },
            { title: "AES-256 Encryption", desc: "All inventory credentials are encrypted at rest", status: "done" },
            { title: "Session Management", desc: "Sessions expire and are tracked per user", status: "done" },
            { title: "IP Monitoring", desc: "Track and investigate suspicious IPs via IP Lookup", status: "done" },
            { title: "Regular Backups", desc: "Set up automated database backups via Supabase", status: "todo" },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-3 p-3 rounded-xl"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              {item.status === "done"
                ? <CheckCircle size={14} className="text-green-400 shrink-0 mt-0.5" />
                : <AlertTriangle size={14} className="text-yellow-400 shrink-0 mt-0.5" />}
              <div>
                <p className="text-sm font-medium text-white">{item.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
