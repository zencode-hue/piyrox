"use client";

import { useState } from "react";
import { 
  User, Globe, DollarSign, ShoppingCart, Mail, ExternalLink, 
  ArrowLeft, Edit3, ShieldAlert, ShieldCheck, Loader2, Zap 
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
    affiliate: any;
  } | null;
  email: string;
  allOrders: Order[];
  lastView: any;
  recentPaths: any[];
  appUrl: string;
}

const STATUS_BADGE: Record<string, string> = {
  PAID: "badge-green", PENDING: "badge-yellow", FAILED: "badge-red",
  PENDING_STOCK: "badge-yellow", REFUNDED: "badge-purple",
};

const PAYMENT_SHORT: Record<string, string> = {
  nowpayments: "Crypto", balance: "Wallet",
  binance_gift_card: "Gift Card", discord: "Discord",
};

export default function CustomerClientPage({ 
  user: initialUser, email, allOrders, lastView, recentPaths, appUrl 
}: CustomerClientPageProps) {
  const router = useRouter();
  const [user, setUser] = useState(initialUser);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Edit State
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
        // Update local state if needed, but refresh is cleaner
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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/customers" className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
            <ArrowLeft size={20} className="text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              {user?.name || "Customer Details"}
              {user?.isBanned && <span className="px-2 py-0.5 rounded text-[10px] bg-red-500/20 text-red-500 border border-red-500/30 uppercase tracking-widest font-bold">Banned</span>}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">{email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href={`/admin/email?prefill=${encodeURIComponent(email)}`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
            <Mail size={16} /> Contact
          </Link>
          {user && (
            <button 
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-black bg-gradient-to-r from-purple-400 to-blue-500 hover:shadow-lg hover:shadow-purple-500/20 transition-all active:scale-95">
              <Edit3 size={16} /> Edit Profile
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Stats Column */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Total Spent", value: `$${totalSpent.toFixed(2)}`, icon: DollarSign, color: "text-green-400", bg: "bg-green-500/10" },
            { label: "Orders Count", value: allOrders.length, icon: ShoppingCart, color: "text-purple-400", bg: "bg-purple-500/10" },
            { label: "Avg. Value", value: `$${avgOrderValue.toFixed(2)}`, icon: Zap, color: "text-amber-400", bg: "bg-amber-500/10" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="glass-card p-6 flex flex-col justify-between">
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-4`}>
                <Icon size={20} className={color} />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
                <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Balance Card */}
        <div className="glass-card p-6 border-l-4 border-l-cyan-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <DollarSign size={80} />
          </div>
          <div className="flex justify-between items-start mb-4">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Wallet Balance</p>
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Globe size={14} />
            </div>
          </div>
          <p className="text-4xl font-black text-white tracking-tight">
            ${user ? Number(user.balance).toFixed(2) : "0.00"}
          </p>
          <div className="mt-6">
            <button 
              onClick={() => setIsEditing(true)}
              className="w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold text-gray-300 transition-all border border-white/5">
              ADJUST BALANCE
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Info Grid */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
            <User size={16} className="text-purple-400" /> Account Details
          </h3>
          <div className="space-y-4">
            <DetailRow label="Display Name" value={user?.name || "—"} />
            <DetailRow label="Account ID" value={user?.id || "—"} isMono />
            <DetailRow label="Role" value={user?.role || "GUEST"} />
            <DetailRow label="Member Since" value={user ? new Date(user.createdAt).toLocaleDateString() : "—"} />
            {user?.affiliate && (
              <div className="pt-4 mt-4 border-t border-white/5 space-y-4">
                <DetailRow label="Affiliate Code" value={user.affiliate.referralCode} valueClass="text-purple-400 font-bold" />
                <DetailRow label="Earnings" value={`$${Number(user.affiliate.totalEarned).toFixed(2)}`} valueClass="text-green-400" />
              </div>
            )}
          </div>
        </div>

        {/* Tracking */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
            <Globe size={16} className="text-blue-400" /> Presence & Tracking
          </h3>
          {lastView ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <DetailRow label="Last IP" value={lastView.ip || "—"} isMono />
                <DetailRow label="Country" value={lastView.country || "—"} />
              </div>
              <DetailRow label="OS / Device" value={`${lastView.os || "—"} (${lastView.device || "—"})`} />
              <DetailRow label="Browser" value={lastView.browser || "—"} />
              <div className="pt-4 mt-4 border-t border-white/5">
                <p className="text-[10px] font-bold text-gray-500 uppercase mb-3">Recent Browsing Path</p>
                <div className="space-y-2">
                  {recentPaths.slice(0, 5).map((p, i) => (
                    <div key={i} className="flex justify-between items-center text-[11px]">
                      <span className="text-purple-300 font-mono">{p.path}</span>
                      <span className="text-gray-600">{new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center py-12 text-gray-600 text-sm">
              No tracking data available
            </div>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShoppingCart size={16} className="text-purple-400" /> Order History
          </h3>
          <span className="text-xs text-gray-500">{allOrders.length} records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-[10px] uppercase tracking-widest border-b border-white/5">
                <th className="text-left px-6 py-4">Reference</th>
                <th className="text-left px-6 py-4">Product</th>
                <th className="text-right px-6 py-4">Amount</th>
                <th className="text-center px-6 py-4">Status</th>
                <th className="text-right px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {allOrders.map((o) => (
                <tr key={o.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4 font-mono text-xs text-amber-400/80 group-hover:text-amber-400">
                    MMT-{o.id.slice(-6).toUpperCase()}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-white text-xs font-semibold">{o.product.title}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{PAYMENT_SHORT[o.paymentProvider] ?? o.paymentProvider}</p>
                  </td>
                  <td className="px-6 py-4 text-right text-white font-bold">${Number(o.amount).toFixed(2)}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`${STATUS_BADGE[o.status] || "badge-purple"} text-[10px] px-2 py-0.5 rounded-full`}>{o.status}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <a href={`${appUrl}/invoice/${o.id}`} target="_blank" rel="noopener noreferrer"
                      className="inline-flex p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-purple-500/20 transition-all">
                      <ExternalLink size={14} />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {allOrders.length === 0 && <div className="py-12 text-center text-gray-600 text-sm italic">No orders found for this user</div>}
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-card w-full max-w-md p-8 animate-in zoom-in-95 duration-200 shadow-2xl shadow-purple-500/10">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Edit3 size={18} className="text-purple-400" /> Edit Customer
              </h2>
              <button onClick={() => setIsEditing(false)} className="text-gray-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Display Name</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="input-field w-full"
                  placeholder="Customer name"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Wallet Balance ($)</label>
                <div className="relative">
                  <DollarSign size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input 
                    type="number" 
                    step="0.01"
                    value={editBalance}
                    onChange={(e) => setEditBalance(e.target.value)}
                    className="input-field w-full pl-10"
                    placeholder="0.00"
                  />
                </div>
                <p className="text-[10px] text-gray-500 mt-2">Adjusting balance will generate a system transaction log.</p>
              </div>

              {user && (
                <div className="pt-6 border-t border-white/5">
                   <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Account Status</label>
                   <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 mb-4">
                      <div className="flex items-center gap-3">
                        {user.isBanned ? <ShieldAlert size={20} className="text-red-500" /> : <ShieldCheck size={20} className="text-green-500" />}
                        <div>
                          <p className="text-sm font-bold text-white">{user.isBanned ? "Account Banned" : "Account Active"}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">{user.isBanned ? "Access restricted" : "Full access granted"}</p>
                        </div>
                      </div>
                      <button 
                        onClick={toggleBan}
                        disabled={loading}
                        className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${user.isBanned ? 'bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20'}`}>
                        {loading ? 'Processing...' : user.isBanned ? 'Unban User' : 'Ban User'}
                      </button>
                   </div>
                   
                   {user.isBanned && (
                     <div className="mt-4">
                        <label className="text-[10px] font-bold text-gray-500 uppercase mb-2 block">Ban Reason</label>
                        <textarea 
                          value={editBanReason}
                          onChange={(e) => setEditBanReason(e.target.value)}
                          className="input-field w-full text-xs h-20 resize-none"
                          placeholder="Reason for ban..."
                        />
                     </div>
                   )}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-3 rounded-xl bg-white/5 text-sm font-bold text-gray-400 hover:bg-white/10 transition-all border border-white/5">
                  Cancel
                </button>
                <button 
                  onClick={handleUpdate}
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-600 text-sm font-bold text-white shadow-lg shadow-purple-500/20 hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-50">
                  {loading ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Save Changes'}
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
    <div className="flex justify-between items-center py-1">
      <span className="text-xs text-gray-500">{label}</span>
      <span className={`text-xs font-semibold ${isMono ? 'font-mono' : ''} ${valueClass || 'text-white'}`}>{value}</span>
    </div>
  );
}

function X({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}
