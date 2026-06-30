"use client";

import { useState } from "react";
import { 
  Search, Loader2, Globe, Monitor, Clock, MapPin, 
  ShoppingCart, AlertCircle, Activity, Users, Eye,
  Link2, Fingerprint, ArrowRight
} from "lucide-react";

interface PageView {
  path: string;
  country: string | null;
  city: string | null;
  browser: string | null;
  os: string | null;
  device: string | null;
  referrer: string | null;
  userAgent: string | null;
  sessionId: string | null;
  createdAt: string;
}

interface Order {
  id: string;
  amount: number;
  status: string;
  paymentProvider: string;
  createdAt: string;
  productTitle: string;
  email: string;
}

interface Result {
  ip: string;
  totalVisits: number;
  uniqueSessions: number;
  firstSeen: string;
  lastSeen: string;
  country: string | null;
  city: string | null;
  browser: string | null;
  os: string | null;
  device: string | null;
  userAgent: string | null;
  views: PageView[];
  orders: Order[];
  matchedUsers: { id: string; email: string; name: string | null }[];
}

const STATUS_STYLES: Record<string, { text: string; bg: string }> = {
  PAID: { text: "text-green-400", bg: "bg-green-500/10" },
  PENDING: { text: "text-yellow-400", bg: "bg-yellow-500/10" },
  FAILED: { text: "text-red-400", bg: "bg-red-500/10" },
  PENDING_STOCK: { text: "text-orange-400", bg: "bg-orange-500/10" },
  REFUNDED: { text: "text-purple-400", bg: "bg-purple-500/10" },
};

export default function IpLookupPage() {
  const [ip, setIp] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function lookup() {
    const trimmed = ip.trim();
    if (!trimmed) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch(`/api/admin/ip-lookup?ip=${encodeURIComponent(trimmed)}`);
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Lookup failed"); return; }
      setResult(data.data);
    } catch (e) {
      setError("Request failed: " + String(e));
    } finally {
      setLoading(false);
    }
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(diff / 86400000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    if (h < 24) return `${h}h ago`;
    return `${d}d ago`;
  }

  return (
    <div className="space-y-8 pb-10 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20 shrink-0">
          <Search size={28} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">IP Intelligence</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Deep-dive into any visitor's session, device, and purchase history</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="admin-card p-6">
        <p className="text-[11px] font-black uppercase tracking-widest text-zinc-500 mb-3">Enter IP Address</p>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Fingerprint size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && lookup()}
              placeholder="e.g. 192.168.1.1 or 2a02:3032:..."
              className="input-field pl-11 font-mono text-sm w-full"
            />
          </div>
          <button onClick={lookup} disabled={loading || !ip.trim()}
            className="bg-orange-500 hover:bg-orange-600 text-black font-black px-6 py-3 rounded-xl flex items-center gap-2 transition-all disabled:opacity-50 shrink-0">
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
            Lookup
          </button>
        </div>
        {error && (
          <div className="mt-4 flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold">
            <AlertCircle size={18} className="shrink-0" /> {error}
          </div>
        )}
      </div>

      {result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Total Visits", value: result.totalVisits, icon: Eye, color: "text-purple-400", bg: "bg-purple-500/10" },
              { label: "Unique Sessions", value: result.uniqueSessions, icon: Activity, color: "text-blue-400", bg: "bg-blue-500/10" },
              { label: "First Seen", value: timeAgo(result.firstSeen), icon: Clock, color: "text-zinc-400", bg: "bg-white/5" },
              { label: "Last Seen", value: timeAgo(result.lastSeen), icon: Clock, color: "text-green-400", bg: "bg-green-500/10" },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="admin-card p-5 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
                  <Icon size={18} className={color} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">{label}</p>
                  <p className={`text-lg font-black tabular-nums ${color}`}>{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Device Info */}
          <div className="admin-card p-6">
            <h2 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
              <Monitor size={16} className="text-blue-400" /> Device Information
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: "IP Address", value: result.ip },
                { label: "Country", value: result.country ?? "—" },
                { label: "City", value: result.city ?? "—" },
                { label: "Browser", value: result.browser ?? "—" },
                { label: "OS", value: result.os ?? "—" },
                { label: "Device", value: result.device ?? "—" },
              ].map(({ label, value }) => (
                <div key={label} className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">{label}</p>
                  <p className="text-sm text-white font-mono font-bold truncate">{value}</p>
                </div>
              ))}
            </div>
            {result.userAgent && (
              <div className="mt-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Full User Agent</p>
                <p className="text-xs text-zinc-500 break-all font-mono leading-relaxed">{result.userAgent}</p>
              </div>
            )}
          </div>

          {/* Linked Accounts */}
          {result.matchedUsers.length > 0 && (
            <div className="admin-card p-6">
              <h2 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                <Users size={16} className="text-green-400" /> Linked Accounts
                <span className="ml-1 px-2 py-0.5 rounded bg-green-500/10 text-green-400 text-[10px] font-black">{result.matchedUsers.length}</span>
              </h2>
              <div className="space-y-3">
                {result.matchedUsers.map((u) => (
                  <div key={u.id} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-sm font-black text-white uppercase">
                        {u.email[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{u.email}</p>
                        {u.name && <p className="text-xs text-zinc-500">{u.name}</p>}
                      </div>
                    </div>
                    <a href={`/admin/customers/${u.id}`}
                      className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-orange-400 transition-colors">
                      View <ArrowRight size={14} />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Orders */}
          {result.orders.length > 0 && (
            <div className="admin-card overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3 bg-white/[0.02]">
                <ShoppingCart size={16} className="text-orange-400" />
                <h2 className="text-sm font-black text-white uppercase tracking-widest">
                  Orders <span className="ml-1 px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 text-[10px]">{result.orders.length}</span>
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/5 text-[10px] text-zinc-500 uppercase tracking-widest font-black">
                      <th className="text-left px-6 py-3">Invoice</th>
                      <th className="text-left px-6 py-3">Product</th>
                      <th className="text-left px-6 py-3">Email</th>
                      <th className="text-right px-6 py-3">Amount</th>
                      <th className="text-left px-6 py-3">Status</th>
                      <th className="text-left px-6 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.orders.map((o) => {
                      const s = STATUS_STYLES[o.status] ?? { text: "text-zinc-400", bg: "bg-white/5" };
                      return (
                        <tr key={o.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-3 font-mono text-orange-400 font-bold">PYX-{o.id.slice(-6).toUpperCase()}</td>
                          <td className="px-6 py-3 text-white font-bold truncate max-w-[140px]">{o.productTitle}</td>
                          <td className="px-6 py-3 text-zinc-400">{o.email}</td>
                          <td className="px-6 py-3 text-right text-white font-bold">${o.amount.toFixed(2)}</td>
                          <td className="px-6 py-3">
                            <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${s.text} ${s.bg}`}>{o.status}</span>
                          </td>
                          <td className="px-6 py-3 text-zinc-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Visit History */}
          <div className="admin-card overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3 bg-white/[0.02]">
              <Clock size={16} className="text-orange-400" />
              <h2 className="text-sm font-black text-white uppercase tracking-widest">
                Visit History <span className="ml-1 px-2 py-0.5 rounded bg-white/5 text-zinc-400 text-[10px]">{result.views.length}</span>
              </h2>
            </div>
            {result.views.length === 0 ? (
              <p className="text-center text-zinc-600 py-12 text-sm font-medium">No page views recorded for this IP.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs min-w-[600px]">
                  <thead>
                    <tr className="border-b border-white/5 text-[10px] text-zinc-500 uppercase tracking-widest font-black">
                      <th className="text-left px-6 py-3">Path</th>
                      <th className="text-left px-6 py-3">Source</th>
                      <th className="text-left px-6 py-3">Session</th>
                      <th className="text-left px-6 py-3">When</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.views.map((v, i) => {
                      const referrerHost = v.referrer
                        ? (() => { try { return new URL(v.referrer).hostname.replace("www.", ""); } catch { return v.referrer.slice(0, 30); } })()
                        : "direct";
                      return (
                        <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-3 font-mono text-orange-400 font-bold">{v.path}</td>
                          <td className={`px-6 py-3 font-medium ${referrerHost === "direct" ? "text-zinc-600" : "text-blue-400"}`}>{referrerHost}</td>
                          <td className="px-6 py-3 font-mono text-zinc-600">{v.sessionId?.slice(0, 8) ?? "—"}</td>
                          <td className="px-6 py-3 text-zinc-500" title={new Date(v.createdAt).toLocaleString()}>
                            {timeAgo(v.createdAt)}
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
      )}
    </div>
  );
}
