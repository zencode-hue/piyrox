import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { Star, Trash2 } from "lucide-react";
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Star size={22} style={{ color: "#f59e0b" }} /> Reviews
        </h1>
        <div className="flex items-center gap-2">
          <span className="text-3xl font-black" style={{ color: "#fbbf24" }}>{avgRating}</span>
          <div>
            <div className="flex items-center gap-0.5">
              {[1,2,3,4,5].map((s) => (
                <Star key={s} size={12} fill={s <= Math.round(Number(avgRating)) ? "#fbbf24" : "none"}
                  style={{ color: "#fbbf24" }} />
              ))}
            </div>
            <p className="text-xs text-gray-500">{reviews.length} reviews</p>
          </div>
        </div>
      </div>

      {/* Rating distribution */}
      <div className="glass-card p-5">
        <h2 className="text-sm font-semibold text-white mb-4">Rating Distribution</h2>
        <div className="space-y-2">
          {ratingDist.map(({ rating, count }) => {
            const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
            return (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-12 shrink-0">
                  <span className="text-xs text-gray-400">{rating}</span>
                  <Star size={10} fill="#fbbf24" style={{ color: "#fbbf24" }} />
                </div>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: "linear-gradient(90deg, #f59e0b, #d97706)" }} />
                </div>
                <span className="text-xs text-gray-500 w-8 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reviews table */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5">
          <h2 className="text-sm font-semibold text-white">All Reviews ({reviews.length})</h2>
        </div>
        {reviews.length === 0 ? (
          <p className="text-center text-gray-600 py-10">No reviews yet</p>
        ) : (
          <div className="divide-y divide-white/5">
            {(reviews as { id: string; rating: number; comment: string | null; createdAt: Date; user: { email: string; name: string | null }; product: { title: string } }[]).map((r) => (
              <div key={r.id} className="px-5 py-4 flex items-start gap-4 hover:bg-white/2 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex items-center gap-0.5">
                      {[1,2,3,4,5].map((s) => (
                        <Star key={s} size={11} fill={s <= r.rating ? "#fbbf24" : "none"}
                          style={{ color: "#fbbf24" }} />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">{r.user.name ?? r.user.email}</span>
                    <span className="text-xs text-gray-600">·</span>
                    <span className="text-xs text-gray-600">{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-amber-400 mb-1">{r.product.title}</p>
                  {r.comment && <p className="text-sm text-gray-300 leading-relaxed">{r.comment}</p>}
                </div>
                <DeleteReviewButton reviewId={r.id} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
