"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";

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
        // Simple heuristic to split excerpt and content
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
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/blog" className="text-gray-500 hover:text-white transition-colors"><ArrowLeft size={18} /></Link>
        <h1 className="text-2xl font-bold text-white">New Blog Post</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="glass-card p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm text-gray-400 mb-1.5">Title</label>
              <input value={form.title} onChange={(e) => set("title", e.target.value)} required className="input-field" placeholder="Post title..." />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Slug (URL)</label>
              <input value={form.slug} onChange={(e) => set("slug", e.target.value)} required className="input-field text-sm" placeholder="post-url-slug" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Category</label>
              <select value={form.category} onChange={(e) => set("category", e.target.value)} className="input-field">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Emoji</label>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map((em) => (
                <button key={em} type="button" onClick={() => set("emoji", em)}
                  className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${form.emoji === em ? "bg-purple-600/30 border border-purple-600/50" : "bg-white/5 hover:bg-white/10"}`}>
                  {em}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Excerpt (short description)</label>
            <textarea value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} required rows={2} className="input-field resize-none" placeholder="Brief description shown in blog list..." />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm text-gray-400">Content (supports **bold** markdown)</label>
              <button
                type="button"
                onClick={generatePost}
                disabled={aiLoading || !form.title}
                className="flex items-center gap-1.5 text-[10px] px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-500 hover:bg-amber-500/20 transition-all disabled:opacity-50"
              >
                {aiLoading ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                AI Generate
              </button>
            </div>
            <textarea value={form.content} onChange={(e) => set("content", e.target.value)} required rows={16} className="input-field resize-y font-mono text-sm" placeholder="Write your blog post content here...&#10;&#10;Use **bold** for emphasis.&#10;&#10;Separate paragraphs with blank lines." />
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" id="published" checked={form.published} onChange={(e) => set("published", e.target.checked)} className="w-4 h-4 accent-purple-500" />
            <label htmlFor="published" className="text-sm text-gray-400">Publish immediately (visible on blog)</label>
          </div>
        </div>

        {err && <p className="text-red-400 text-sm">{err}</p>}

        <div className="flex gap-3">
          <Link href="/admin/blog" className="btn-secondary flex-1 py-2.5 text-sm text-center">Cancel</Link>
          <button type="submit" disabled={loading} className="btn-primary flex-1 py-2.5 text-sm">
            {loading ? "Saving…" : form.published ? "Publish Post" : "Save Draft"}
          </button>
        </div>
      </form>
    </div>
  );
}
