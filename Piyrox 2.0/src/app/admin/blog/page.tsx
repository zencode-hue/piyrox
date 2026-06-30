import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import Link from "next/link";
import { Plus, FileText, Eye, EyeOff } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  await requireAdmin();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const posts = await (db as any).blogPost.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, slug: true, title: true, category: true, emoji: true, published: true, createdAt: true },
  }) as Array<{ id: string; slug: string; title: string; category: string; emoji: string; published: boolean; createdAt: Date }>;

  return (
    <div className="space-y-6 pb-8">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <FileText size={24} className="text-orange-400" />
            Blog Posts
          </h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            Manage your content marketing and announcements ({posts.length} total)
          </p>
        </div>
        <Link href="/admin/blog/new" className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-black font-bold px-4 py-2 rounded-xl transition-all">
          <Plus size={16} /> New Post
        </Link>
      </div>

      <div className="admin-card overflow-hidden mt-8">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <FileText size={32} className="text-zinc-600" />
            </div>
            <p className="text-white font-medium text-lg">No blog posts yet</p>
            <p className="text-zinc-500 text-sm mt-1 mb-6">Create your first post to engage with your audience.</p>
            <Link href="/admin/blog/new" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-2 rounded-xl transition-all">
              <Plus size={16} /> Create Post
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="text-zinc-500 text-xs uppercase tracking-wider" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <th className="text-left px-5 py-4 font-semibold">Title</th>
                  <th className="text-left px-5 py-4 font-semibold">Category</th>
                  <th className="text-center px-5 py-4 font-semibold">Status</th>
                  <th className="text-left px-5 py-4 font-semibold">Date</th>
                  <th className="text-right px-5 py-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                {posts.map((p) => (
                  <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 text-lg border border-white/5 shrink-0">
                          {p.emoji}
                        </span>
                        <div className="min-w-0">
                          <span className="block font-medium text-white truncate max-w-[300px]">{p.title}</span>
                          <span className="text-zinc-500 text-[11px] block mt-0.5 truncate max-w-[300px]">/{p.slug}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 bg-white/5 px-2 py-1 rounded">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      {p.published ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-green-500/10 text-green-400">
                          <Eye size={12} /> Published
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-yellow-500/10 text-yellow-400">
                          <EyeOff size={12} /> Draft
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-zinc-500 text-xs font-medium">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/blog/${p.slug}`} target="_blank" className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">
                          View
                        </Link>
                        <Link href={`/admin/blog/${p.id}/edit`} className="text-[11px] font-bold uppercase tracking-widest text-orange-400 hover:text-white bg-orange-500/10 hover:bg-orange-500/20 px-3 py-1.5 rounded-lg transition-colors">
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
