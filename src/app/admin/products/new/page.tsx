"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";
import VariantEditor, { type VariantDraft } from "@/components/admin/VariantEditor";

const CATEGORIES = [
  { value: "STREAMING", label: "Streaming" },
  { value: "AI_TOOLS", label: "AI Tools" },
  { value: "SOFTWARE", label: "Software" },
  { value: "GAMING", label: "Gaming" },
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
          }]
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

    // Create product
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, price: parseFloat(form.price) }),
    });
    const data = await res.json();
    if (!res.ok) { setErr(data.error ?? "Failed to create product"); setLoading(false); return; }

    const productId = data.data?.id;

    // Save variants if any
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
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/products" className="text-gray-500 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-2xl font-bold text-white">Add Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="glass-card p-6 space-y-5">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Title</label>
            <input type="text" value={form.title} onChange={(e) => set("title", e.target.value)}
              required className="input-field" placeholder="e.g. Spotify Premium" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm text-gray-400">Description</label>
              <button
                type="button"
                onClick={generateDescription}
                disabled={aiLoading || !form.title}
                className="flex items-center gap-1.5 text-[10px] px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-500 hover:bg-amber-500/20 transition-all disabled:opacity-50"
              >
                {aiLoading ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                AI Generate
              </button>
            </div>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)}
              rows={4} className="input-field resize-none" placeholder="Product description..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Base Price (USD)</label>
              <input type="number" value={form.price} onChange={(e) => set("price", e.target.value)}
                required min="0" step="0.01" className="input-field" placeholder="9.99" />
              <p className="text-xs text-gray-600 mt-1">Used when no variants are set</p>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Category</label>
              <select value={form.category} onChange={(e) => set("category", e.target.value)} className="input-field">
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>

          <ImageUpload value={form.imageUrl} onChange={(url) => set("imageUrl", url)} />

          <div className="flex items-center gap-3">
            <input type="checkbox" id="unlimitedStock" checked={form.unlimitedStock}
              onChange={(e) => set("unlimitedStock", e.target.checked)} className="w-4 h-4 accent-purple-500" />
            <label htmlFor="unlimitedStock" className="text-sm text-gray-400">Unlimited base stock</label>
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" id="isActive" checked={form.isActive}
              onChange={(e) => set("isActive", e.target.checked)} className="w-4 h-4 accent-purple-500" />
            <label htmlFor="isActive" className="text-sm text-gray-400">Active (visible in store)</label>
          </div>
        </div>

        {/* Variants */}
        <div className="glass-card p-6">
          <VariantEditor variants={variants} onChange={setVariants} />
        </div>

        {err && <p className="text-red-400 text-sm">{err}</p>}

        <div className="flex gap-3">
          <Link href="/admin/products" className="btn-secondary flex-1 py-2.5 text-sm text-center">Cancel</Link>
          <button type="submit" disabled={loading} className="btn-primary flex-1 py-2.5 text-sm">
            {loading ? "Creating…" : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
