"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DeleteReviewButton({ reviewId }: { reviewId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function del() {
    if (!confirm("Delete this review?")) return;
    setLoading(true);
    await fetch(`/api/admin/reviews/${reviewId}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  return (
    <button onClick={del} disabled={loading}
      className="p-1.5 rounded-lg transition-all hover:bg-red-500/10 text-gray-600 hover:text-red-400 shrink-0">
      {loading ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
    </button>
  );
}
