"use client";

import { useState } from "react";
import { Download, RefreshCw, Trash2, Mail, Zap, CheckCircle, Loader2, AlertTriangle, Package, Users, DollarSign } from "lucide-react";

export default function AdminToolsPage() {
  const [exporting, setExporting] = useState(false);
  const [exportFrom, setExportFrom] = useState("");
  const [exportTo, setExportTo] = useState("");
  const [exportStatus, setExportStatus] = useState("all");
  const [result, setResult] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [bulkEmail, setBulkEmail] = useState({ subject: "", message: "", audience: "all" });
  const [sendingBulk, setSendingBulk] = useState(false);

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
      a.download = `metramart-orders-${new Date().toISOString().slice(0, 10)}.csv`;
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
    const res = await fetch(`/api/auth/${action}`, { method: "GET" });
    const data = await res.json();
    setResult(res.ok
      ? { type: "success", msg: data.message ?? "Done!" }
      : { type: "error", msg: data.error ?? "Failed" }
    );
    setTimeout(() => setResult(null), 4000);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white flex items-center gap-2">
        <Zap size={22} style={{ color: "#f59e0b" }} /> Admin Tools
      </h1>

      {result && (
        <div className={`flex items-center gap-2 p-3 rounded-xl text-sm ${result.type === "success" ? "text-green-400" : "text-red-400"}`}
          style={{ background: result.type === "success" ? "rgba(74,222,128,0.08)" : "rgba(248,113,113,0.08)", border: `1px solid ${result.type === "success" ? "rgba(74,222,128,0.2)" : "rgba(248,113,113,0.2)"}` }}>
          {result.type === "success" ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
          {result.msg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Export Orders */}
        <div className="glass-card p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Download size={14} style={{ color: "#f59e0b" }} /> Export Orders (CSV)
          </h2>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">From Date</label>
                <input type="date" value={exportFrom} onChange={(e) => setExportFrom(e.target.value)}
                  className="input-field text-sm py-2" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">To Date</label>
                <input type="date" value={exportTo} onChange={(e) => setExportTo(e.target.value)}
                  className="input-field text-sm py-2" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Status Filter</label>
              <select value={exportStatus} onChange={(e) => setExportStatus(e.target.value)}
                className="input-field text-sm py-2">
                <option value="all">All Orders</option>
                <option value="PAID">Paid Only</option>
                <option value="PENDING">Pending</option>
                <option value="PENDING_STOCK">Pending Stock</option>
                <option value="FAILED">Failed</option>
                <option value="REFUNDED">Refunded</option>
              </select>
            </div>
            <button onClick={exportOrders} disabled={exporting}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-black disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}>
              {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              {exporting ? "Exporting..." : "Export to CSV"}
            </button>
          </div>
        </div>

        {/* Bulk Email */}
        <div className="glass-card p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Mail size={14} style={{ color: "#f59e0b" }} /> Bulk Email Campaign
          </h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Audience</label>
              <select value={bulkEmail.audience} onChange={(e) => setBulkEmail((p) => ({ ...p, audience: e.target.value }))}
                className="input-field text-sm py-2">
                <option value="all">All Users</option>
                <option value="customers">Customers with Orders</option>
                <option value="no_orders">Users without Orders</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Subject</label>
              <input value={bulkEmail.subject} onChange={(e) => setBulkEmail((p) => ({ ...p, subject: e.target.value }))}
                placeholder="New products just dropped!" className="input-field text-sm py-2" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Message</label>
              <textarea value={bulkEmail.message} onChange={(e) => setBulkEmail((p) => ({ ...p, message: e.target.value }))}
                placeholder="Write your email content here..." rows={3}
                className="input-field text-sm py-2 resize-none w-full" />
            </div>
            <button onClick={sendBulkEmail} disabled={sendingBulk || !bulkEmail.subject.trim() || !bulkEmail.message.trim()}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-black disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}>
              {sendingBulk ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
              {sendingBulk ? "Sending..." : "Send Campaign"}
            </button>
          </div>
        </div>

        {/* Quick Stats Refresh */}
        <div className="glass-card p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <RefreshCw size={14} style={{ color: "#4ade80" }} /> Database Utilities
          </h2>
          <div className="space-y-2">
            {[
              { label: "Recalculate Product Ratings", desc: "Recompute avgRating for all products from reviews", action: "fix-products", icon: Package, color: "#f59e0b" },
              { label: "Clean Seed Users", desc: "Remove fake review/seed users from database", action: "cleanup-seed-users", icon: Trash2, color: "#f87171" },
            ].map((item) => (
              <div key={item.action} className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-center gap-3">
                  <item.icon size={14} style={{ color: item.color }} />
                  <div>
                    <p className="text-sm text-white">{item.label}</p>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                </div>
                <button onClick={() => runAction(item.action)}
                  className="text-xs px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
                  style={{ background: "rgba(245,158,11,0.1)", color: "#fbbf24", border: "1px solid rgba(245,158,11,0.2)" }}>
                  Run
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Seed Tools */}
        <div className="glass-card p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Zap size={14} style={{ color: "#f59e0b" }} /> Seed & Setup Tools
          </h2>
          <div className="space-y-2">
            {[
              { label: "Seed Demo Products", desc: "Add sample products to the catalog", action: "seed-products", icon: Package, color: "#f59e0b" },
              { label: "Seed Blog Posts", desc: "Add SEO blog posts", action: "seed-seo-blogs", icon: Users, color: "#4ade80" },
              { label: "Seed Reviews", desc: "Add sample customer reviews", action: "seed-reviews", icon: DollarSign, color: "#a78bfa" },
            ].map((item) => (
              <div key={item.action} className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-center gap-3">
                  <item.icon size={14} style={{ color: item.color }} />
                  <div>
                    <p className="text-sm text-white">{item.label}</p>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                </div>
                <button onClick={() => runAction(item.action)}
                  className="text-xs px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
                  style={{ background: "rgba(245,158,11,0.1)", color: "#fbbf24", border: "1px solid rgba(245,158,11,0.2)" }}>
                  Run
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
