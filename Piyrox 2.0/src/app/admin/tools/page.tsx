"use client";

import { useState } from "react";
import { 
  Download, RefreshCw, Trash2, Mail, Zap, CheckCircle, 
  Loader2, AlertTriangle, Package, Users, DollarSign,
  FileText, Database, Settings, Send, Calendar, BarChart3
} from "lucide-react";

export default function AdminToolsPage() {
  const [exporting, setExporting] = useState(false);
  const [exportFrom, setExportFrom] = useState("");
  const [exportTo, setExportTo] = useState("");
  const [exportStatus, setExportStatus] = useState("all");
  const [result, setResult] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [bulkEmail, setBulkEmail] = useState({ subject: "", message: "", audience: "all" });
  const [sendingBulk, setSendingBulk] = useState(false);
  const [runningAction, setRunningAction] = useState<string | null>(null);

  async function exportOrders() {
    setExporting(true);
    const params = new URLSearchParams();
    if (exportFrom) params.set("from", exportFrom);
    if (exportTo) params.set("to", exportTo);
    if (exportStatus !== "all") params.set("status", exportStatus);

    const res = await fetch(`/api/admin/export/orders?${params}`);
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `piyrox-orders-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setResult({ type: "success", msg: "Orders exported successfully!" });
    } else {
      setResult({ type: "error", msg: "Export failed. Try again." });
    }
    setExporting(false);
    setTimeout(() => setResult(null), 4000);
  }

  async function sendBulkEmail() {
    if (!bulkEmail.subject.trim() || !bulkEmail.message.trim()) return;
    setSendingBulk(true);
    const res = await fetch("/api/admin/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        audience: bulkEmail.audience,
        subject: bulkEmail.subject,
        message: bulkEmail.message,
      }),
    });
    const data = await res.json();
    setSendingBulk(false);
    if (res.ok) {
      setResult({ type: "success", msg: `Email sent to ${data.data?.sent ?? "?"} recipients!` });
      setBulkEmail({ subject: "", message: "", audience: "all" });
    } else {
      setResult({ type: "error", msg: data.error ?? "Failed to send" });
    }
    setTimeout(() => setResult(null), 5000);
  }

  async function runAction(action: string) {
    setRunningAction(action);
    const res = await fetch(`/api/auth/${action}`, { method: "GET" });
    const data = await res.json();
    setResult(res.ok
      ? { type: "success", msg: data.message ?? "Done!" }
      : { type: "error", msg: data.error ?? "Failed" }
    );
    setRunningAction(null);
    setTimeout(() => setResult(null), 4000);
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20 shrink-0">
          <Zap size={28} className="text-black" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Admin Tools</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Data export, bulk actions & system utilities</p>
        </div>
      </div>

      {/* Notification Banner */}
      {result && (
        <div className={`flex items-center gap-3 p-4 rounded-2xl text-sm font-bold border animate-in fade-in slide-in-from-top-4 ${
          result.type === "success" 
            ? "bg-green-500/10 border-green-500/20 text-green-400" 
            : "bg-red-500/10 border-red-500/20 text-red-400"
        }`}>
          {result.type === "success" 
            ? <CheckCircle size={18} className="shrink-0" /> 
            : <AlertTriangle size={18} className="shrink-0" />}
          {result.msg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Export Orders */}
        <div className="admin-card p-6 border-t-2 border-t-orange-500">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
              <Download size={18} className="text-orange-400" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">Export Orders</h2>
              <p className="text-[11px] text-zinc-500 font-medium uppercase tracking-widest mt-0.5">CSV Download</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-widest text-zinc-500 mb-2">From Date</label>
                <input type="date" value={exportFrom} onChange={(e) => setExportFrom(e.target.value)}
                  className="input-field text-sm w-full" />
              </div>
              <div>
                <label className="block text-[11px] font-black uppercase tracking-widest text-zinc-500 mb-2">To Date</label>
                <input type="date" value={exportTo} onChange={(e) => setExportTo(e.target.value)}
                  className="input-field text-sm w-full" />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-black uppercase tracking-widest text-zinc-500 mb-2">Status Filter</label>
              <select value={exportStatus} onChange={(e) => setExportStatus(e.target.value)}
                className="input-field text-sm w-full">
                <option value="all">All Orders</option>
                <option value="PAID">Paid Only</option>
                <option value="PENDING">Pending</option>
                <option value="PENDING_STOCK">Pending Stock</option>
                <option value="FAILED">Failed</option>
                <option value="REFUNDED">Refunded</option>
              </select>
            </div>
            <button onClick={exportOrders} disabled={exporting}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-black font-black text-sm transition-all disabled:opacity-50">
              {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              {exporting ? "Exporting..." : "Export to CSV"}
            </button>
          </div>
        </div>

        {/* Bulk Email */}
        <div className="admin-card p-6 border-t-2 border-t-blue-500">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <Mail size={18} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">Bulk Email Campaign</h2>
              <p className="text-[11px] text-zinc-500 font-medium uppercase tracking-widest mt-0.5">Mass Notifications</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-widest text-zinc-500 mb-2">Audience</label>
              <select value={bulkEmail.audience} onChange={(e) => setBulkEmail((p) => ({ ...p, audience: e.target.value }))}
                className="input-field text-sm w-full">
                <option value="all">All Users</option>
                <option value="customers">Customers with Orders</option>
                <option value="no_orders">Users without Orders</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-black uppercase tracking-widest text-zinc-500 mb-2">Subject</label>
              <input value={bulkEmail.subject} onChange={(e) => setBulkEmail((p) => ({ ...p, subject: e.target.value }))}
                placeholder="New products just dropped!" className="input-field text-sm w-full" />
            </div>
            <div>
              <label className="block text-[11px] font-black uppercase tracking-widest text-zinc-500 mb-2">Message Body</label>
              <textarea value={bulkEmail.message} onChange={(e) => setBulkEmail((p) => ({ ...p, message: e.target.value }))}
                placeholder="Write your email content here..." rows={4}
                className="input-field text-sm w-full resize-none" />
            </div>
            <button onClick={sendBulkEmail} disabled={sendingBulk || !bulkEmail.subject.trim() || !bulkEmail.message.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm transition-all disabled:opacity-50">
              {sendingBulk ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              {sendingBulk ? "Sending..." : "Send Campaign"}
            </button>
          </div>
        </div>

        {/* Database Utilities */}
        <div className="admin-card p-6 border-t-2 border-t-purple-500">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
              <Database size={18} className="text-purple-400" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">Database Utilities</h2>
              <p className="text-[11px] text-zinc-500 font-medium uppercase tracking-widest mt-0.5">Maintenance Tasks</p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { label: "Recalculate Product Ratings", desc: "Recompute avgRating for all products from reviews", action: "fix-products", icon: BarChart3, color: "text-orange-400", bg: "bg-orange-500/10" },
              { label: "Clean Seed Users", desc: "Remove fake review/seed users from database", action: "cleanup-seed-users", icon: Trash2, color: "text-red-400", bg: "bg-red-500/10" },
            ].map((item) => (
              <div key={item.action} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-colors group">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.bg}`}>
                    <item.icon size={16} className={item.color} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors">{item.label}</p>
                    <p className="text-[11px] text-zinc-600 mt-0.5">{item.desc}</p>
                  </div>
                </div>
                <button onClick={() => runAction(item.action)} disabled={runningAction === item.action}
                  className="text-[11px] px-3 py-1.5 rounded-lg font-black uppercase tracking-widest bg-white/5 border border-white/10 text-zinc-400 hover:bg-orange-500/10 hover:text-orange-400 hover:border-orange-500/20 transition-all disabled:opacity-50 shrink-0 ml-4">
                  {runningAction === item.action ? <Loader2 size={12} className="animate-spin" /> : "Run"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Seed & Setup Tools */}
        <div className="admin-card p-6 border-t-2 border-t-green-500">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/20">
              <RefreshCw size={18} className="text-green-400" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">Seed & Setup Tools</h2>
              <p className="text-[11px] text-zinc-500 font-medium uppercase tracking-widest mt-0.5">Demo Data Management</p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { label: "Seed Demo Products", desc: "Add sample products to the catalog", action: "seed-products", icon: Package, color: "text-orange-400", bg: "bg-orange-500/10" },
              { label: "Seed Blog Posts", desc: "Add SEO-optimized blog posts", action: "seed-seo-blogs", icon: FileText, color: "text-green-400", bg: "bg-green-500/10" },
              { label: "Seed Reviews", desc: "Add sample customer reviews", action: "seed-reviews", icon: DollarSign, color: "text-purple-400", bg: "bg-purple-500/10" },
            ].map((item) => (
              <div key={item.action} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-colors group">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.bg}`}>
                    <item.icon size={16} className={item.color} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors">{item.label}</p>
                    <p className="text-[11px] text-zinc-600 mt-0.5">{item.desc}</p>
                  </div>
                </div>
                <button onClick={() => runAction(item.action)} disabled={runningAction === item.action}
                  className="text-[11px] px-3 py-1.5 rounded-lg font-black uppercase tracking-widest bg-white/5 border border-white/10 text-zinc-400 hover:bg-orange-500/10 hover:text-orange-400 hover:border-orange-500/20 transition-all disabled:opacity-50 shrink-0 ml-4">
                  {runningAction === item.action ? <Loader2 size={12} className="animate-spin" /> : "Run"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
