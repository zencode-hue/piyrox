"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";

interface DayData { date: string; revenue: number; orders: number }

export default function RevenueChart() {
  const [data, setData] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState<DayData | null>(null);
  const [range, setRange] = useState<7 | 14 | 30>(30);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/analytics?range=${range}`)
      .then((r) => r.json())
      .then((d) => { setData(d.data?.daily ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [range]);

  const visibleData = data.slice(-range);
  const maxRevenue = Math.max(...visibleData.map((d) => d.revenue), 1);
  const totalRevenue = visibleData.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = visibleData.reduce((s, d) => s + d.orders, 0);

  // Compare first half vs second half for trend
  const half = Math.floor(visibleData.length / 2);
  const firstHalf = visibleData.slice(0, half).reduce((s, d) => s + d.revenue, 0);
  const secondHalf = visibleData.slice(half).reduce((s, d) => s + d.revenue, 0);
  const trend = firstHalf > 0 ? ((secondHalf - firstHalf) / firstHalf) * 100 : 0;
  const trendUp = trend >= 0;

  if (loading) {
    return (
      <div className="rounded-2xl p-6 h-64 animate-pulse" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }} />
    );
  }

  if (!visibleData.length) {
    return (
      <div className="rounded-2xl p-8 flex flex-col items-center justify-center gap-3 text-center" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <BarChart3 size={32} className="text-zinc-700" />
        <p className="text-zinc-500 text-sm">No revenue data yet for this period</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold mb-1">Revenue</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white tabular-nums">${totalRevenue.toFixed(2)}</span>
            <span className={`flex items-center gap-0.5 text-xs font-bold ${trendUp ? "text-green-400" : "text-red-400"}`}>
              {trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {Math.abs(trend).toFixed(1)}%
            </span>
          </div>
          <p className="text-xs text-zinc-600 mt-0.5">{totalOrders} orders · last {range} days</p>
        </div>

        {/* Range selector */}
        <div className="flex gap-1 p-1 rounded-lg" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          {([7, 14, 30] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                range === r
                  ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {r}d
            </button>
          ))}
        </div>
      </div>

      {/* Tooltip */}
      {hovered && (
        <div className="mb-3 px-3 py-2 rounded-lg text-xs inline-flex items-center gap-3" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <span className="text-zinc-400">{hovered.date}</span>
          <span className="text-white font-bold">${hovered.revenue.toFixed(2)}</span>
          <span className="text-zinc-500">{hovered.orders} orders</span>
        </div>
      )}

      {/* Chart bars */}
      <div className="flex items-end gap-0.5 h-36">
        {visibleData.map((d, i) => {
          const heightPct = Math.max(4, (d.revenue / maxRevenue) * 100);
          const isHovered = hovered?.date === d.date;
          return (
            <div
              key={d.date}
              className="flex-1 flex flex-col justify-end cursor-pointer group relative"
              style={{ height: "100%" }}
              onMouseEnter={() => setHovered(d)}
              onMouseLeave={() => setHovered(null)}
            >
              <div
                className="w-full rounded-sm transition-all duration-150"
                style={{
                  height: `${heightPct}%`,
                  background: isHovered
                    ? "rgba(249,115,22,0.8)"
                    : d.revenue > 0
                    ? `rgba(249,115,22,${0.2 + (d.revenue / maxRevenue) * 0.5})`
                    : "rgba(255,255,255,0.04)",
                  borderTop: isHovered ? "1px solid rgba(249,115,22,0.9)" : "1px solid transparent",
                }}
              />
            </div>
          );
        })}
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between text-[10px] text-zinc-700 mt-2">
        <span>{visibleData[0]?.date?.slice(5)}</span>
        <span>{visibleData[Math.floor(visibleData.length / 2)]?.date?.slice(5)}</span>
        <span>{visibleData[visibleData.length - 1]?.date?.slice(5)}</span>
      </div>
    </div>
  );
}
