import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { Star, MessageSquare } from "lucide-react";
import DeleteReviewButton from "./DeleteReviewButton";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  await requireAdmin();

  const reviews = await db.review.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: { select: { email: true, name: true } },
      product: { select: { title: true } },
    },
  });

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  const ratingDist = [5, 4, 3, 2, 1].map((r) => ({
    rating: r,
    count: reviews.filter((rev) => rev.rating === r).length,
  }));

  return (
    <div className="space-y-6 pb-8">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Star size={24} className="text-orange-400" />
            Reviews
          </h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            Manage customer feedback and ratings
          </p>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2">
            <span className="text-3xl font-black text-orange-400 tabular-nums">{avgRating}</span>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-0.5">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} size={12} fill={s <= Math.round(Number(avgRating)) ? "#f97316" : "none"}
                    className={s <= Math.round(Number(avgRating)) ? "text-orange-500" : "text-zinc-700"} />
                ))}
              </div>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{reviews.length} Total</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8">
        {/* Rating distribution */}
        <div className="lg:col-span-4">
          <div className="admin-card p-6 h-full">
            <h2 className="text-sm font-bold text-white mb-6 uppercase tracking-widest">Rating Distribution</h2>
            <div className="space-y-3">
              {ratingDist.map(({ rating, count }) => {
                const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                return (
                  <div key={rating} className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 w-10 shrink-0 justify-end">
                      <span className="text-xs font-bold text-zinc-400">{rating}</span>
                      <Star size={12} fill="#f97316" className="text-orange-500" />
                    </div>
                    <div className="flex-1 h-2 rounded-full overflow-hidden bg-white/5">
                      <div className="h-full rounded-full transition-all bg-gradient-to-r from-orange-600 to-orange-400" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-bold text-zinc-500 tabular-nums w-8 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Reviews list */}
        <div className="lg:col-span-8">
          <div className="admin-card overflow-hidden h-full flex flex-col">
            <div className="px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <MessageSquare size={16} className="text-orange-400" /> All Reviews
              </h2>
            </div>
            
            {reviews.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <Star size={40} className="text-zinc-700 mb-4" />
                <p className="text-zinc-400 font-medium text-lg">No reviews yet</p>
                <p className="text-zinc-500 text-sm mt-1">When customers leave reviews, they will appear here.</p>
              </div>
            ) : (
              <div className="divide-y overflow-y-auto" style={{ borderColor: "rgba(255,255,255,0.04)", maxHeight: "600px" }}>
                {(reviews as { id: string; rating: number; comment: string | null; createdAt: Date; user: { email: string; name: string | null }; product: { title: string } }[]).map((r) => (
                  <div key={r.id} className="px-6 py-5 flex items-start gap-4 hover:bg-white/[0.02] transition-colors group">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-0.5 bg-orange-500/10 px-2 py-1 rounded-full border border-orange-500/20">
                          <span className="text-[11px] font-bold text-orange-400 mr-1 tabular-nums">{r.rating}.0</span>
                          <Star size={10} fill="#f97316" className="text-orange-500" />
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">{r.user.name ?? r.user.email}</span>
                        <span className="text-[11px] text-zinc-600">· {new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm font-bold text-white mb-2">{r.product.title}</p>
                      {r.comment ? (
                        <p className="text-sm text-zinc-400 leading-relaxed italic border-l-2 border-white/10 pl-3">"{r.comment}"</p>
                      ) : (
                        <p className="text-xs text-zinc-600 italic">No written comment provided.</p>
                      )}
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <DeleteReviewButton reviewId={r.id} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
