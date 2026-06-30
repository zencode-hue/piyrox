"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

export default function CreateDiscountForm() {
  const [form, setForm] = useState({
    code: "", type: "PERCENTAGE", value: "", usageLimit: "100", expiresAt: "",
  });
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function set(key: string, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/discounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: form.code.toUpperCase(),
          type: form.type,
          value: Number(form.value),
          usageLimit: Number(form.usageLimit),
          expiresAt: new Date(form.expiresAt).toISOString(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("✅ Discount code created.");
        setForm({ code: "", type: "PERCENTAGE", value: "", usageLimit: "100", expiresAt: "" });
      } else {
        setStatus(`❌ ${data.error}`);
      }
    } catch {
      setStatus("❌ Failed to create code.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-card p-6 h-full">
      <h2 className="text-sm font-bold text-white mb-5 uppercase tracking-widest">Create Discount Code</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block mb-1.5">Code</label>
          <input value={form.code} onChange={(e) => set("code", e.target.value)} required
            placeholder="SUMMER20" className="input-field text-sm uppercase font-mono tracking-wider" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block mb-1.5">Type</label>
            <select value={form.type} onChange={(e) => set("type", e.target.value)}
              className="input-field text-sm font-medium">
              <option value="PERCENTAGE">Percentage (%)</option>
              <option value="FIXED">Fixed ($)</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block mb-1.5">Value</label>
            <input type="number" min="0" step="0.01" value={form.value}
              onChange={(e) => set("value", e.target.value)} required
              placeholder={form.type === "PERCENTAGE" ? "20" : "5.00"}
              className="input-field text-sm tabular-nums font-bold" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block mb-1.5">Usage Limit</label>
            <input type="number" min="1" value={form.usageLimit}
              onChange={(e) => set("usageLimit", e.target.value)} required
              className="input-field text-sm tabular-nums" />
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block mb-1.5">Expires At</label>
            <input type="date" value={form.expiresAt}
              onChange={(e) => set("expiresAt", e.target.value)} required
              className="input-field text-sm text-zinc-300" />
          </div>
        </div>
        {status && (
          <div className={`p-3 rounded-xl text-sm font-medium ${status.startsWith("✅") ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
            {status}
          </div>
        )}
        <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-black font-bold transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 mt-2">
          <Plus size={18} />{loading ? "Creating…" : "Create Code"}
        </button>
      </form>
    </div>
  );
}
