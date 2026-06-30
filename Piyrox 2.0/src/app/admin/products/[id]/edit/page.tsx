"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2, Loader2, Package, AlertCircle, CheckCircle, Star } from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";
import VariantEditor, { type VariantDraft } from "@/components/admin/VariantEditor";

const CATEGORIES = [
  { value: "STREAMING", label: "🎬 Streaming" },
  { value: "AI_TOOLS", label: "🤖 AI Tools" },
  { value: "SOFTWARE", label: "💻 Software" },
  { value: "GAMING", label: "🎮 Gaming" },
];

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [variants, setVariants] = useState<VariantDraft[]>([]);

  const [form, setFormState] = useState({
    title: "", description: "", price: "",
    category: "STREAMING", imageUrl: "",
    isActive: true, isFeatured: false, unlimitedStock: true, stockCount: "0",
  });

  useEffect(() => {
    Promise.all([
      fetch(`/api/v1/products/${id}`).then((r) => r.json()),
      fetch(`/api/admin/products/${id}/variants`).then((r) => r.json()).catch(() => ({ data: [] })),
    ]).then(([productData, variantData]) => {
      const p = productData.data?.product ?? productData.data;
      if (p) {
        setFormState({
          title: p.title ?? "",
          description: p.description ?? "",
          price: String(p.price ?? ""),
          category: p.category ?? "STREAMING",
          imageUrl: p.imageUrl ?? "",
          isActive: p.isActive ?? true,
          isFeatured: p.isFeatured ?? false,
          unlimitedStock: p.unlimitedStock ?? true,
          stockCount: String(p.stockCount ?? 0),
        });
      }
      const vArr = variantData.data ?? [];
      setVariants(vArr.map((v: { id: string; name: string; price: number; unlimitedStock: boolean; stockCount: number; isActive: boolean }) => ({
        id: v.id,
        name: v.name,
        price: String(v.price),
        unlimitedStock: v.unlimitedStock,
        stockCount: String(v.stockCount),
        isActive: v.isActive,
      })));
    }).finally(() => setFetching(false));
  }, [id]);

  function set(field: string, value: string | boolean) {
    setFormState((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setErr(null);

    const res = await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, price: parseFloat(form.price), stockCount: parseInt(form.stockCount, 10) }),
    });
    const data = await res.json();
    if (!res.ok) { setErr(data.error ?? "Failed to update product"); setLoading(false); return; }

    const variantPayload = variants.map((v, i) => ({
      ...(v.id ? { id: v.id } : {}),
      name: v.name,
      price: parseFloat(v.price) || 0,
      unlimitedStock: v.unlimitedStock,
      stockCount: parseInt(v.stockCount) || 0,
      isActive: v.isActive,
      sortOrder: i,
    }));
    await fetch(`/api/admin/products/${id}/variants`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(variantPayload),
    });

    setLoading(false);
    router.push("/admin/products");
  }

  async function handleDelete() {
    setDeleting(true);
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    setDeleting(false);
    if (res.ok) { router.push("/admin/products"); }
    else { const d = await res.json(); setErr(d.error ?? "Failed to delete"); setConfirmDelete(false); }
  }

  if (fetching) return (
    <div className="flex items-center justify-center py-20">
      <div className="flex items-center gap-3 text-zinc-500">
        <Loader2 size={20} className="animate-spin" />
        <span className="text-sm font-medium">Loading product...</span>
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl pb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/products" className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all">
            <ArrowLeft size={18} />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <Package size={22} className="text-orange-400" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">Edit Product</h1>
              <p className="text-zinc-500 text-xs font-medium mt-0.5 truncate max-w-[200px]">{form.title}</p>
            </div>
          </div>
        </div>
        <button type="button" onClick={() => setConfirmDelete(true)}
          className="flex items-center gap-2 text-sm font-bold text-red-400 hover:text-red-300 px-4 py-2 rounded-xl hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20">
          <Trash2 size={16} /> Delete
        </button>
      </div>

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="admin-card p-6 mb-6 border-red-500/30 bg-red-500/5 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
              <AlertCircle size={20} className="text-red-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-black text-white mb-1">Delete this product?</h3>
              <p className="text-sm text-zinc-500 mb-4">This action cannot be undone. All associated data will be permanently removed.</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDelete(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white text-sm font-black uppercase tracking-widest transition-all">
                  Cancel
                </button>
                <button onClick={handleDelete} disabled={deleting}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-black uppercase tracking-widest transition-all flex items-center gap-2 disabled:opacity-50">
                  {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  {deleting ? "Deleting…" : "Yes, Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Details */}
        <div className="admin-card p-6 space-y-6">
          <h2 className="text-[11px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
            <Package size={14} /> Product Details
          </h2>

          <div>
            <label className="block text-[11px] font-black uppercase tracking-widest text-zinc-500 mb-2">Title</label>
            <input type="text" value={form.title} onChange={(e) => set("title", e.target.value)}
              required className="input-field w-full font-bold" />
          </div>

          <div>
            <label className="block text-[11px] font-black uppercase tracking-widest text-zinc-500 mb-2">Description</label>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)}
              rows={4} className="input-field resize-none w-full leading-relaxed" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-widest text-zinc-500 mb-2">Base Price (USD)</label>
              <input type="number" value={form.price} onChange={(e) => set("price", e.target.value)}
                required min="0" step="0.01" className="input-field w-full" />
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

          <label className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/5 cursor-pointer hover:bg-white/[0.06] transition-colors">
            <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 transition-all ${form.unlimitedStock ? "bg-orange-500" : "border-2 border-zinc-700"}`}>
              {form.unlimitedStock && <CheckCircle size={14} className="text-black" />}
            </div>
            <input type="checkbox" checked={form.unlimitedStock}
              onChange={(e) => set("unlimitedStock", e.target.checked)} className="sr-only" />
            <div>
              <p className="text-sm font-bold text-white">Unlimited Base Stock</p>
              <p className="text-xs text-zinc-500 mt-0.5">Product never shows as out of stock</p>
            </div>
          </label>

          {!form.unlimitedStock && (
            <div className="pl-4 ml-9 border-l border-white/5">
              <label className="block text-[11px] font-black uppercase tracking-widest text-zinc-500 mb-2">Stock Count</label>
              <input type="number" value={form.stockCount} onChange={(e) => set("stockCount", e.target.value)}
                min="0" className="input-field w-40" />
            </div>
          )}

          <label className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/5 cursor-pointer hover:bg-white/[0.06] transition-colors">
            <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 transition-all ${form.isActive ? "bg-green-500" : "border-2 border-zinc-700"}`}>
              {form.isActive && <CheckCircle size={14} className="text-black" />}
            </div>
            <input type="checkbox" checked={form.isActive}
              onChange={(e) => set("isActive", e.target.checked)} className="sr-only" />
            <div>
              <p className="text-sm font-bold text-white">Active & Visible</p>
              <p className="text-xs text-zinc-500 mt-0.5">Product appears in the store for customers</p>
            </div>
          </label>

          <label className="flex items-center gap-4 p-4 rounded-xl bg-orange-500/5 border border-orange-500/20 cursor-pointer hover:bg-orange-500/10 transition-colors">
            <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 transition-all ${form.isFeatured ? "bg-orange-500" : "border-2 border-orange-500/30"}`}>
              {form.isFeatured && <Star size={12} className="text-black fill-black" />}
            </div>
            <input type="checkbox" checked={form.isFeatured}
              onChange={(e) => set("isFeatured", e.target.checked)} className="sr-only" />
            <div>
              <p className="text-sm font-bold text-orange-400 flex items-center gap-2">
                <Star size={14} className="fill-orange-400" /> Top Product
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">Displayed in the featured Top Products section on homepage</p>
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
            {loading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
            {loading ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
