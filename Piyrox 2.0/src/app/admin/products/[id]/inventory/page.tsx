"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Upload, Download, Package, ArrowLeft, RefreshCw, FileText, CheckCircle, AlertCircle, Key, Shield, Loader2 } from "lucide-react";

interface StockInfo {
  stockCount: number;
  unlimitedStock: boolean;
  available: number;
  delivered: number;
}

export default function AdminInventoryPage() {
  const params = useParams<{ id: string }>();
  const productId = params.id;
  const [text, setText] = useState("");
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [stockInfo, setStockInfo] = useState<StockInfo | null>(null);
  const [loadingStock, setLoadingStock] = useState(true);
  const [tab, setTab] = useState<"paste" | "file">("paste");
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchStock = useCallback(async () => {
    setLoadingStock(true);
    try {
      const res = await fetch(`/api/admin/products/${productId}/inventory`);
      if (res.ok) {
        const data = await res.json();
        setStockInfo(data.data);
      }
    } finally {
      setLoadingStock(false);
    }
  }, [productId]);

  useEffect(() => { fetchStock(); }, [fetchStock]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setText(ev.target?.result as string ?? "");
      setTab("paste");
    };
    reader.readAsText(file);
  }

  async function handleUpload() {
    if (!text.trim()) return;
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch(`/api/admin/products/${productId}/inventory`, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: text,
      });
      const data = await res.json();
      if (res.ok) {
        setStatus({ type: "success", msg: `Imported ${data.data.imported} item(s) successfully.` });
        setText("");
        fetchStock();
      } else {
        setStatus({ type: "error", msg: data.error });
      }
    } catch {
      setStatus({ type: "error", msg: "Upload failed." });
    } finally {
      setLoading(false);
    }
  }

  function handleExport() {
    window.open(`/api/admin/products/${productId}/inventory/export`, "_blank");
  }

  const lineCount = text.split("\n").filter((l) => l.trim()).length;

  return (
    <div className="max-w-4xl pb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/products" className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all">
            <ArrowLeft size={18} />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/10 border border-purple-600/20 flex items-center justify-center">
              <Package size={22} className="text-purple-400" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">Inventory Management</h1>
              <p className="text-zinc-500 text-xs font-medium mt-0.5">Upload credentials or license keys — one per line</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchStock}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all">
            <RefreshCw size={16} className={loadingStock ? "animate-spin text-orange-400" : ""} />
          </button>
          <button onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 text-sm font-black uppercase tracking-widest transition-all">
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      {/* Stock Summary */}
      {stockInfo && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Stock", value: stockInfo.unlimitedStock ? "∞" : stockInfo.stockCount.toLocaleString(), icon: Package, color: "text-white", iconColor: "text-zinc-400", bg: "bg-white/5" },
            { label: "Available Keys", value: stockInfo.available.toLocaleString(), icon: Key, color: "text-green-400", iconColor: "text-green-400", bg: "bg-green-500/5" },
            { label: "Delivered", value: stockInfo.delivered.toLocaleString(), icon: CheckCircle, color: "text-purple-400", iconColor: "text-purple-400", bg: "bg-purple-500/5" },
          ].map((s) => (
            <div key={s.label} className={`admin-card p-6 flex items-center gap-4 ${s.bg}`}>
              <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0`}>
                <s.icon size={22} className={s.iconColor} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">{s.label}</p>
                <p className={`text-2xl font-black tabular-nums ${s.color}`}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {loadingStock && !stockInfo && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="admin-card p-6 h-24 animate-pulse bg-white/[0.02]" />
          ))}
        </div>
      )}

      {/* Upload Panel */}
      <div className="admin-card p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-[11px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
            <Upload size={14} /> Upload Inventory
          </h2>
          {/* Tab Switcher */}
          <div className="flex gap-1 p-1 rounded-lg bg-white/5 border border-white/5">
            {[
              { id: "paste", label: "Paste Text" },
              { id: "file", label: "Upload File" },
            ].map((t) => (
              <button key={t.id} onClick={() => setTab(t.id as "paste" | "file")}
                className={`px-4 py-1.5 rounded-md text-[11px] font-black uppercase tracking-widest transition-all ${tab === t.id ? "bg-orange-500 text-black" : "text-zinc-500 hover:text-white"}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {tab === "file" ? (
          <div>
            <input ref={fileRef} type="file" accept=".txt,.csv" onChange={handleFileChange} className="hidden" />
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-white/10 rounded-2xl p-12 text-center cursor-pointer hover:border-orange-500/30 hover:bg-orange-500/5 transition-all group"
            >
              <div className="w-16 h-16 rounded-2xl bg-white/5 group-hover:bg-orange-500/10 flex items-center justify-center mx-auto mb-4 transition-colors">
                <FileText size={32} className="text-zinc-600 group-hover:text-orange-400 transition-colors" />
              </div>
              <p className="text-sm font-bold text-zinc-400 group-hover:text-white transition-colors mb-1">Click to select a .txt or .csv file</p>
              <p className="text-xs font-medium text-zinc-600">One credential per line</p>
            </div>
            {text && (
              <div className="mt-3 flex items-center gap-2 text-green-400 text-sm font-bold">
                <CheckCircle size={16} />
                File loaded — {lineCount} lines ready to upload
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-zinc-500">
                Credentials / License Keys
              </label>
              {text && (
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-400 bg-orange-500/10 px-2 py-1 rounded">
                  {lineCount} {lineCount === 1 ? "item" : "items"}
                </span>
              )}
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={12}
              placeholder={"user1@example.com:password123\nuser2@example.com:password456\nLICENSE-KEY-XXXX"}
              className="input-field font-mono text-sm resize-y w-full leading-relaxed"
            />
          </div>
        )}

        {status && (
          <div className={`flex items-center gap-3 p-4 rounded-xl text-sm font-bold border ${
            status.type === "success"
              ? "bg-green-500/10 border-green-500/20 text-green-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}>
            {status.type === "success" ? <CheckCircle size={18} className="shrink-0" /> : <AlertCircle size={18} className="shrink-0" />}
            {status.msg}
          </div>
        )}

        <div className="flex items-center gap-4">
          <button
            onClick={handleUpload}
            disabled={loading || !text.trim()}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-black font-black text-sm transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
            {loading ? "Uploading..." : "Upload Stock"}
          </button>
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-600">
            <Shield size={14} className="text-zinc-700" />
            <span>Encrypted at rest with AES-256-GCM</span>
          </div>
        </div>
      </div>
    </div>
  );
}
