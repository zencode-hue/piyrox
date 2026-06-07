"use client";

import { useEffect, useState } from "react";

export default function LiveOrderTicker() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/v1/stats")
      .then((r) => r.json())
      .then((d) => setCount(d.data?.todayOrders ?? null))
      .catch(() => {});
  }, []);

  if (count === null || count === 0) return null;

  return (
    <div
      className="flex items-center justify-center gap-2 py-2.5 text-xs text-zinc-500"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
    >
      <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
      <span>
        <span className="text-white font-semibold">{count}</span> orders delivered today
      </span>
    </div>
  );
}
