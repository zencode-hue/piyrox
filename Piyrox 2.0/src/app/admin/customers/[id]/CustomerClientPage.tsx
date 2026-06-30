"use client";

import { useState } from "react";
import { 
  User, Globe, DollarSign, ShoppingCart, Mail, ExternalLink, 
  ArrowLeft, Edit3, ShieldAlert, ShieldCheck, Loader2, Zap,
  X, Activity, Clock, Monitor, MapPin
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Order {
  id: string;
  amount: { toString(): string };
  discountAmount: { toString(): string };
  status: string;
  paymentProvider: string;
  createdAt: Date;
  product: { title: string; category: string };
}

interface CustomerClientPageProps {
  user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
    createdAt: Date;
    balance: { toString(): string };
    isBanned: boolean;
    banReason: string | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    affiliate: any;
  } | null;
  email: string;
  allOrders: Order[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lastView: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recentPaths: any[];
  appUrl: string;
}

const STATUS_STYLES: Record<string, { text: string; bg: string }> = {
  PAID: { text: "text-green-400", bg: "bg-green-500/10" },
  PENDING: { text: "text-yellow-400", bg: "bg-yellow-500/10" },
  FAILED: { text: "text-red-400", bg: "bg-red-500/10" },
  PENDING_STOCK: { text: "text-orange-400", bg: "bg-orange-500/10" },
  REFUNDED: { text: "text-purple-400", bg: "bg-purple-500/10" },
};

const PAYMENT_SHORT: Record<string, string> = {
  paymento: "Crypto", balance: "Wallet",
  binance_gift_card: "Gift Card", discord: "Discord",
};

export default function CustomerClientPage({ 
  user: initialUser, email, allOrders, lastView, recentPaths, appUrl 
}: CustomerClientPageProps) {
  const router = useRouter();
  const [user, setUser] = useState(initialUser);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [editBalance, setEditBalance] = useState(user ? Number(user.balance).toFixed(2) : "0.00");
  const [editName, setEditName] = useState(user?.name ?? "");
  const [editBanReason, setEditBanReason] = useState(user?.banReason ?? "");

  async function handleUpdate() {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/customers/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          balance: parseFloat(editBalance),
          name: editName,
          banReason: editBanReason,
        })
      });
      if (res.ok) {
        setIsEditing(false);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function toggleBan() {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/customers/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isBanned: !user.isBanned,
          banReason: !user.isBanned ? (editBanReason || "Violating terms of service") : null,
        })
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const paidOrders = allOrders.filter((o) => o.status === "PAID");
  const totalSpent = paidOrders.reduce((s, o) => s + Number(o.amount), 0);
  const avgOrderValue = paidOrders.length > 0 ? totalSpent / paidOrders.length : 0;

  return (
    <div className="space-y-8 pb-10 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/customers" className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all">
            <ArrowLeft size={18} />
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-2xl font-black text-white uppercase">
              {email[0]}
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
                {user?.name || "Anonymous Customer"}
                {user?.isBanned && (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 uppercase tracking-widest font-black">
                    Banned
                  </span>
                )}
              </h1>
              <p className="text-sm font-medium text-zinc-500 mt-0.5">{email}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href={`/admin/email?prefill=${encodeURIComponent(email)}`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest text-zinc-300 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-all">
            <Mail size={16} /> Contact
          </Link>
          {user && (
            <button 
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest text-black bg-orange-500 hover:bg-orange-600 transition-all">
              <Edit3 size={16} /> Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Spent", value: `$${totalSpent.toFixed(2)}`, icon: DollarSign, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
          { label: "Orders", value: allOrders.length, icon: ShoppingCart, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
          { label: "Avg. Order", value: `$${avgOrderValue.toFixed(2)}`, icon: Zap, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
          { label: "Wallet Balance", value: `$${Number(user?.balance ?? 0).toFixed(2)}`, icon: DollarSign, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`admin-card p-5 flex items-center gap-4 border ${bg}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-black/20`}>
              <Icon size={18} className={color} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">{label}</p>
              <p className={`text-xl font-black tabular-nums ${color}`}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Details */}
        <div className="admin-card p-6">
          <h3 className="text-[11px] font-black text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-2">
            <User size={14} /> Account Details
          </h3>
          <div className="space-y-4">
            <DetailRow label="Display Name" value={user?.name || "—"} />
            <DetailRow label="Account ID" value={user?.id || "—"} isMono />
            <DetailRow label="Role" value={user?.role || "GUEST"} valueClass={user?.role === "ADMIN" ? "text-orange-400" : "text-zinc-300"} />
            <DetailRow label="Member Since" value={user ? new Date(user.createdAt).toLocaleDateString() : "—"} />
            <DetailRow label="Account Status" value={user?.isBanned ? "Banned" : "Active"} valueClass={user?.isBanned ? "text-red-400" : "text-green-400"} />
            {user?.affiliate && (
              <>
                <div className="h-px bg-white/5 my-2" />
                <DetailRow label="Affiliate Code" value={user.affiliate.referralCode} valueClass="text-purple-400 font-bold font-mono" />
                <DetailRow label="Affiliate Earnings" value={`$${Number(user.affiliate.totalEarned).toFixed(2)}`} valueClass="text-green-400" />
                <DetailRow label="Total Referrals" value={String(user.affiliate._count?.referrals ?? 0)} />
              </>
            )}
          </div>
        </div>

        {/* Tracking */}
        <div className="admin-card p-6">
          <h3 className="text-[11px] font-black text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-2">
            <Activity size={14} /> Presence & Tracking
          </h3>
          {lastView ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Last IP</p>
                  <p className="text-xs font-mono font-bold text-white">{lastView.ip || "—"}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1 flex items-center gap-1"><MapPin size={10}/> Country</p>
                  <p className="text-xs font-bold text-white">{lastView.country || "—"}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1 flex items-center gap-1"><Monitor size={10}/> OS</p>
                  <p className="text-xs font-bold text-white">{lastView.os || "—"} ({lastView.device || "—"})</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Browser</p>
                  <p className="text-xs font-bold text-white">{lastView.browser || "—"}</p>
                </div>
              </div>
              {recentPaths.length > 0 && (
                <div className="pt-4 border-t border-white/5">
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Clock size={12} /> Recent Browsing
                  </p>
                  <div className="space-y-2">
                    {recentPaths.slice(0, 5).map((p, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <span className="text-xs font-mono text-orange-400/80 hover:text-orange-400 transition-colors">{p.path}</span>
                        <span className="text-[10px] text-zinc-600 font-medium">{new Date(p.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center py-12 text-center">
              <Globe size={32} className="text-zinc-700 mb-3" />
              <p className="text-sm font-medium text-zinc-600">No tracking data available</p>
              <p className="text-xs text-zinc-700 mt-1">Guest users don&apos;t generate tracking data</p>
            </div>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="admin-card overflow-hidden">
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <h3 className="text-[11px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
            <ShoppingCart size={14} /> Order History
          </h3>
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 bg-white/5 px-2 py-1 rounded">
            {allOrders.length} records
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] text-zinc-500 uppercase tracking-widest font-black border-b border-white/5">
                <th className="text-left px-6 py-4">Reference</th>
                <th className="text-left px-6 py-4">Product</th>
                <th className="text-right px-6 py-4">Amount</th>
                <th className="text-center px-6 py-4">Status</th>
                <th className="text-right px-6 py-4">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {allOrders.map((o) => {
                const s = STATUS_STYLES[o.status] ?? { text: "text-zinc-400", bg: "bg-white/5" };
                return (
                  <tr key={o.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4 font-mono text-xs text-orange-400/80 font-bold group-hover:text-orange-400 transition-colors">
                      PYX-{o.id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white text-xs font-bold">{o.product.title}</p>
                      <p className="text-[10px] text-zinc-600 mt-0.5 font-medium">{PAYMENT_SHORT[o.paymentProvider] ?? o.paymentProvider}</p>
                    </td>
                    <td className="px-6 py-4 text-right text-white font-black text-xs">${Number(o.amount).toFixed(2)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${s.text} ${s.bg}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <a href={`${appUrl}/invoice/${o.id}`} target="_blank" rel="noopener noreferrer"
                        className="inline-flex p-2 rounded-lg bg-white/5 text-zinc-500 hover:text-white hover:bg-orange-500/10 transition-all">
                        <ExternalLink size={14} />
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {allOrders.length === 0 && (
            <div className="py-16 text-center">
              <ShoppingCart size={32} className="text-zinc-700 mx-auto mb-3" />
              <p className="text-sm font-medium text-zinc-600">No orders found for this user</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0d0d14] border border-white/10 rounded-2xl w-full max-w-md p-8 shadow-2xl shadow-black/50 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black text-white flex items-center gap-3">
                <Edit3 size={18} className="text-orange-400" /> Edit Customer
              </h2>
              <button onClick={() => setIsEditing(false)} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/10 transition-all">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-[11px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">Display Name</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="input-field w-full"
                  placeholder="Customer name"
                />
              </div>

              <div>
                <label className="text-[11px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">Wallet Balance (USD)</label>
                <div className="relative">
                  <DollarSign size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input 
                    type="number" 
                    step="0.01"
                    value={editBalance}
                    onChange={(e) => setEditBalance(e.target.value)}
                    className="input-field w-full pl-10"
                    placeholder="0.00"
                  />
                </div>
                <p className="text-[10px] text-zinc-600 mt-2 font-medium">Adjusting balance will generate a system transaction log.</p>
              </div>

              {user && (
                <div className="pt-5 border-t border-white/5">
                  <label className="text-[11px] font-black text-zinc-500 uppercase tracking-widest mb-3 block">Account Status</label>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5 mb-4">
                    <div className="flex items-center gap-3">
                      {user.isBanned ? <ShieldAlert size={20} className="text-red-400" /> : <ShieldCheck size={20} className="text-green-400" />}
                      <div>
                        <p className="text-sm font-bold text-white">{user.isBanned ? "Account Banned" : "Account Active"}</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">{user.isBanned ? "Access restricted" : "Full access granted"}</p>
                      </div>
                    </div>
                    <button 
                      onClick={toggleBan}
                      disabled={loading}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                        user.isBanned 
                          ? "bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20" 
                          : "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
                      }`}>
                      {loading ? "..." : user.isBanned ? "Unban" : "Ban"}
                    </button>
                  </div>
                  
                  {user.isBanned && (
                    <div>
                      <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2 block">Ban Reason</label>
                      <textarea 
                        value={editBanReason}
                        onChange={(e) => setEditBanReason(e.target.value)}
                        className="input-field w-full text-xs resize-none"
                        rows={3}
                        placeholder="Reason for ban..."
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-black uppercase tracking-widest text-zinc-400 hover:bg-white/10 hover:text-white transition-all">
                  Cancel
                </button>
                <button 
                  onClick={handleUpdate}
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-sm font-black uppercase tracking-widest text-black transition-all disabled:opacity-50 flex items-center justify-center">
                  {loading ? <Loader2 size={18} className="animate-spin" /> : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value, isMono, valueClass }: { label: string; value: string; isMono?: boolean; valueClass?: string }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-white/[0.03] last:border-0">
      <span className="text-xs text-zinc-500 font-medium">{label}</span>
      <span className={`text-xs font-bold ${isMono ? "font-mono" : ""} ${valueClass || "text-white"}`}>{value}</span>
    </div>
  );
}
