"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles, Loader2, Save, Send } from "lucide-react";

const CATEGORIES = ["Streaming", "AI Tools", "Software", "Gaming", "Tips", "News", "General"];
const EMOJIS = ["📺", "🤖", "💻", "🎮", "💡", "📰", "📝", "🔒", "💰", "⚡"];

export default function NewBlogPostPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "", slug: "", excerpt: "", content: "",
    category: "General", emoji: "📝", published: false,
  });

  function set(field: string, value: string | boolean) {
    setForm((f) => {
      const updated = { ...f, [field]: value };
      if (field === "title" && !f.slug) {
        updated.slug = (value as string).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      }
      return updated;
    });
  }

  async function generatePost() {
    if (!form.title) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/admin/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ 
            role: "user", 
            content: `Write a high-quality, SEO-optimized blog post for "${form.title}" in the ${form.category} category.
            Include a short excerpt (first paragraph) and then the full markdown content.
            Use a friendly and professional tone. Keep it informative.` 
          }],
          context: "blog"
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error ?? "AI generation failed");
      } else if (data.reply) {
        const text = data.reply;
        const paragraphs = text.split("\n\n");
        if (paragraphs.length > 1) {
          set("excerpt", paragraphs[0]);
          set("content", paragraphs.slice(1).join("\n\n"));
        } else {
          set("content", text);
        }
      }
    } catch (e) { 
      console.error(e); 
      setErr("Network error. Please try again.");
    } finally {
      setAiLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setErr(null);
    const res = await fetch("/api/admin/blog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setErr(data.error ?? "Failed to create post"); return; }
    router.push("/admin/blog");
  }

  return (
    <div className="max-w-4xl pb-8">
      <div className="flex items-start gap-4 mb-8">
        <Link href="/admin/blog" className="mt-1 flex items-center justify-center w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">New Blog Post</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Create a new article for your audience</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="admin-card p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Title</label>
              <input value={form.title} onChange={(e) => set("title", e.target.value)} required className="input-field w-full text-lg font-bold" placeholder="E.g. 5 Reasons to Upgrade Your Setup..." />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Slug (URL)</label>
              <input value={form.slug} onChange={(e) => set("slug", e.target.value)} required className="input-field w-full font-mono text-sm" placeholder="post-url-slug" />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Category</label>
              <select value={form.category} onChange={(e) => set("category", e.target.value)} className="input-field w-full">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Emoji Icon</label>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map((em) => (
                <button key={em} type="button" onClick={() => set("emoji", em)}
                  className={`w-12 h-12 rounded-xl text-2xl flex items-center justify-center transition-all ${form.emoji === em ? "bg-orange-500/20 border border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.15)] scale-110" : "bg-white/5 border border-transparent hover:bg-white/10 hover:border-white/10"}`}>
                  {em}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="admin-card p-6">
          <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Excerpt (Short Description)</label>
          <textarea value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} required rows={3} className="input-field w-full resize-none text-sm leading-relaxed" placeholder="Brief summary shown on the blog list page..." />
        </div>

        <div className="admin-card p-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Content (Markdown Supported)</label>
            <button
              type="button"
              onClick={generatePost}
              disabled={aiLoading || !form.title}
              className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-lg text-orange-400 hover:bg-orange-500/20 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {aiLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} className="group-hover:text-white transition-colors" />}
              AI Generate
            </button>
          </div>
          <textarea value={form.content} onChange={(e) => set("content", e.target.value)} required rows={18} className="input-field w-full resize-y font-mono text-sm leading-relaxed" placeholder="Write your blog post content here...&#10;&#10;Use **bold** for emphasis.&#10;&#10;Separate paragraphs with blank lines." />
        </div>

        <div className="admin-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative flex items-center justify-center">
              <input type="checkbox" checked={form.published} onChange={(e) => set("published", e.target.checked)} className="peer sr-only" />
              <div className="w-5 h-5 border-2 border-zinc-600 rounded bg-transparent peer-checked:bg-orange-500 peer-checked:border-orange-500 transition-colors" />
              <div className="absolute opacity-0 peer-checked:opacity-100 transition-opacity text-black">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
            </div>
            <div>
              <span className="text-sm font-bold text-white block">Publish immediately</span>
              <span className="text-xs text-zinc-500 block">Make this post visible to everyone</span>
            </div>
          </label>

          {err && <div className="text-red-400 text-sm font-medium bg-red-500/10 px-3 py-1.5 rounded">{err}</div>}

          <div className="flex gap-3">
            <Link href="/admin/blog" className="px-6 py-2.5 rounded-xl font-bold text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center">Cancel</Link>
            <button type="submit" disabled={loading} className="bg-orange-500 hover:bg-orange-600 text-black px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50">
              {loading ? <Loader2 size={18} className="animate-spin" /> : form.published ? <Send size={18} /> : <Save size={18} />}
              {loading ? "Saving…" : form.published ? "Publish Post" : "Save Draft"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
