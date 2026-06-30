"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles, Loader2, Package, AlertCircle, CheckCircle } from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";
import VariantEditor, { type VariantDraft } from "@/components/admin/VariantEditor";

const CATEGORIES = [
  { value: "STREAMING", label: "🎬 Streaming" },
  { value: "AI_TOOLS", label: "🤖 AI Tools" },
  { value: "SOFTWARE", label: "💻 Software" },
  { value: "GAMING", label: "🎮 Gaming" },
];

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "", description: "", price: "",
    category: "STREAMING", imageUrl: "",
    isActive: true, unlimitedStock: true,
  });
  const [variants, setVariants] = useState<VariantDraft[]>([]);

  function set(field: string, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function generateDescription() {
    if (!form.title) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/admin/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{
            role: "user",
            content: `Write a premium, high-converting product description for "${form.title}" in the ${form.category} category for an e-commerce store. Focus on benefits and features. Keep it concise.`
          }],
          model: "poolside/laguna-m.1:free"
        }),
      });
      const data = await res.json();
      if (data.reply) set("description", data.reply);
    } catch (e) { console.error(e); }
    setAiLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setErr(null);

    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, price: parseFloat(form.price) }),
    });
    const data = await res.json();
    if (!res.ok) { setErr(data.error ?? "Failed to create product"); setLoading(false); return; }

    const productId = data.data?.id;
    if (productId && variants.length > 0) {
      const variantPayload = variants.map((v, i) => ({
        name: v.name,
        price: parseFloat(v.price) || 0,
        unlimitedStock: v.unlimitedStock,
        stockCount: parseInt(v.stockCount) || 0,
        isActive: v.isActive,
        sortOrder: i,
      }));
      await fetch(`/api/admin/products/${productId}/variants`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(variantPayload),
      });
    }

    setLoading(false);
    router.push("/admin/products");
  }

  return (
    <div className="max-w-3xl pb-10">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/products" className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
            <Package size={22} className="text-orange-400" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">Add New Product</h1>
            <p className="text-zinc-500 text-xs font-medium mt-0.5">Fill in the details below to add a product to your store</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Details */}
        <div className="admin-card p-6 space-y-6">
          <h2 className="text-[11px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
            <Package size={14} /> Product Details
          </h2>

          <div>
            <label className="block text-[11px] font-black uppercase tracking-widest text-zinc-500 mb-2">Title</label>
            <input type="text" value={form.title} onChange={(e) => set("title", e.target.value)}
              required className="input-field w-full font-bold" placeholder="e.g. Spotify Premium" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-zinc-500">Description</label>
              <button
                type="button"
                onClick={generateDescription}
                disabled={aiLoading || !form.title}
                className="flex items-center gap-1.5 text-[10px] px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-lg text-orange-400 hover:bg-orange-500/20 transition-all disabled:opacity-50 font-black uppercase tracking-widest"
              >
                {aiLoading ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                AI Generate
              </button>
            </div>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)}
              rows={4} className="input-field resize-none w-full leading-relaxed" placeholder="Product description..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-widest text-zinc-500 mb-2">Base Price (USD)</label>
              <input type="number" value={form.price} onChange={(e) => set("price", e.target.value)}
                required min="0" step="0.01" className="input-field w-full" placeholder="9.99" />
              <p className="text-xs text-zinc-600 mt-1.5 font-medium">Used when no variants are set</p>
            </div>
            <div>
              <label className="block text-[11px] font-black uppercase tracking-widest text-zinc-500 mb-2">Category</label>
              <select value={form.category} onChange={(e) => set("category", e.target.value)} className="input-field w-full">
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-black uppercase tracking-widest text-zinc-500 mb-3">Product Image</label>
            <ImageUpload value={form.imageUrl} onChange={(url) => set("imageUrl", url)} />
          </div>
        </div>

        {/* Stock & Visibility */}
        <div className="admin-card p-6 space-y-4">
          <h2 className="text-[11px] font-black uppercase tracking-widest text-zinc-500">Stock & Visibility</h2>

          <label className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/5 cursor-pointer hover:bg-white/[0.06] transition-colors group">
            <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 transition-all ${form.unlimitedStock ? "bg-orange-500 border-orange-500" : "border-2 border-zinc-700"}`}>
              {form.unlimitedStock && <CheckCircle size={14} className="text-black" />}
            </div>
            <input type="checkbox" id="unlimitedStock" checked={form.unlimitedStock}
              onChange={(e) => set("unlimitedStock", e.target.checked)} className="sr-only" />
            <div>
              <p className="text-sm font-bold text-white">Unlimited Base Stock</p>
              <p className="text-xs text-zinc-500 mt-0.5">Product never shows as out of stock</p>
            </div>
          </label>

          <label className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/5 cursor-pointer hover:bg-white/[0.06] transition-colors group">
            <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 transition-all ${form.isActive ? "bg-green-500 border-green-500" : "border-2 border-zinc-700"}`}>
              {form.isActive && <CheckCircle size={14} className="text-black" />}
            </div>
            <input type="checkbox" id="isActive" checked={form.isActive}
              onChange={(e) => set("isActive", e.target.checked)} className="sr-only" />
            <div>
              <p className="text-sm font-bold text-white">Active & Visible</p>
              <p className="text-xs text-zinc-500 mt-0.5">Product appears in the store for customers</p>
            </div>
          </label>
        </div>

        {/* Variants */}
        <div className="admin-card p-6">
          <h2 className="text-[11px] font-black uppercase tracking-widest text-zinc-500 mb-6">Product Variants</h2>
          <VariantEditor variants={variants} onChange={setVariants} />
        </div>

        {err && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold">
            <AlertCircle size={18} className="shrink-0" /> {err}
          </div>
        )}

        <div className="flex gap-3">
          <Link href="/admin/products" className="flex-1 py-3 text-center text-sm font-black uppercase tracking-widest rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-all">
            Cancel
          </Link>
          <button type="submit" disabled={loading}
            className="flex-1 py-3 text-sm font-black uppercase tracking-widest rounded-xl bg-orange-500 hover:bg-orange-600 text-black transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Package size={18} />}
            {loading ? "Creating…" : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
