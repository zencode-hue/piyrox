import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { Zap, Clock, Tag, Package, ExternalLink } from "lucide-react";
import Link from "next/link";
import DealsDiscordPush from "./DealsDiscordPush";

export const dynamic = "force-dynamic";

export default async function AdminDealsPage() {
  await requireAdmin();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const settings = await (db as any).siteSetting.findMany() as { key: string; value: string }[];
  const map: Record<string, string> = {};
  for (const s of settings) map[s.key] = s.value;

  const dealsEnabled = map["deals_enabled"] !== "false";
  const discordWebhook = map["discord_deals_webhook_url"] ?? "";

  const now = new Date();
  const seed = now.getUTCFullYear() * 10000 + (now.getUTCMonth() + 1) * 100 + now.getUTCDate();

  const allProducts = await db.product.findMany({
    where: { isActive: true },
    select: { id: true, title: true, price: true, category: true, imageUrl: true },
    orderBy: { createdAt: "desc" },
  });

  function seededShuffle<T>(arr: T[], s: number): T[] {
    const a = [...arr];
    let st = s;
    for (let i = a.length - 1; i > 0; i--) {
      st = (st * 1664525 + 1013904223) & 0xffffffff;
      const j = Math.abs(st) % (i + 1);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  const todayDeals = seededShuffle(allProducts, seed).slice(0, 7);
  const DISCOUNT_PCT = 20;

  const resetAt = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  const timeLeft = resetAt.getTime() - now.getTime();
  const hoursLeft = Math.floor(timeLeft / 3600000);
  const minsLeft = Math.floor((timeLeft % 3600000) / 60000);

  const CATEGORY_STYLES: Record<string, { text: string; bg: string }> = {
    STREAMING: { text: "text-amber-400", bg: "bg-amber-500/10" },
    AI_TOOLS: { text: "text-yellow-400", bg: "bg-yellow-500/10" },
    SOFTWARE: { text: "text-orange-400", bg: "bg-orange-500/10" },
    GAMING: { text: "text-green-400", bg: "bg-green-500/10" },
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20 shrink-0">
            <Zap size={28} className="text-black" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Deal Vault Manager</h1>
            <p className="text-zinc-500 text-sm mt-0.5">Daily rotating deals powered by seeded algorithm</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20">
          <Clock size={16} className="text-orange-400" />
          <span className="text-sm font-black text-orange-400">Resets in {hoursLeft}h {minsLeft}m</span>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`admin-card p-6 border-l-4 ${dealsEnabled ? "border-l-green-500" : "border-l-red-500"}`}>
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${dealsEnabled ? "bg-green-500/10" : "bg-red-500/10"}`}>
              <Zap size={16} className={dealsEnabled ? "text-green-400" : "text-red-400"} />
            </div>
            <p className="text-[11px] font-black uppercase tracking-widest text-zinc-500">Vault Status</p>
          </div>
          <div className={`text-2xl font-black mb-2 ${dealsEnabled ? "text-green-400" : "text-red-400"}`}>
            {dealsEnabled ? "ACTIVE" : "DISABLED"}
          </div>
          <Link href="/admin/settings" className="text-[11px] font-black uppercase tracking-widest text-orange-400 hover:text-orange-300 transition-colors flex items-center gap-1">
            Change in Settings →
          </Link>
        </div>

        <div className="admin-card p-6 border-l-4 border-l-orange-500">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Tag size={16} className="text-orange-400" />
            </div>
            <p className="text-[11px] font-black uppercase tracking-widest text-zinc-500">Discount Rate</p>
          </div>
          <div className="text-2xl font-black text-orange-400 mb-2">{DISCOUNT_PCT}% OFF</div>
          <p className="text-[11px] font-medium text-zinc-600">Applied to all vault products</p>
        </div>

        <div className="admin-card p-6 border-l-4 border-l-purple-500">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Package size={16} className="text-purple-400" />
            </div>
            <p className="text-[11px] font-black uppercase tracking-widest text-zinc-500">Today&apos;s Deals</p>
          </div>
          <div className="text-2xl font-black text-white mb-2">{todayDeals.length} Products</div>
          <p className="text-[11px] font-medium text-zinc-600">Seed #{seed}</p>
        </div>
      </div>

      {/* Discord Push */}
      <DealsDiscordPush initialWebhook={discordWebhook} />

      {/* Today's Vault Products */}
      <div className="admin-card overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
            <Zap size={16} className="text-orange-400" /> Today&apos;s Vault Products
          </h2>
          <Link href="/deals" target="_blank"
            className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-orange-400 hover:text-orange-300 transition-colors">
            View Live <ExternalLink size={14} />
          </Link>
        </div>

        <div className="divide-y divide-white/5">
          {todayDeals.map((p, i) => {
            const dealPrice = Number(p.price) * (1 - DISCOUNT_PCT / 100);
            const catStyle = CATEGORY_STYLES[p.category] ?? { text: "text-zinc-400", bg: "bg-white/5" };
            return (
              <div key={p.id} className="flex items-center gap-5 px-6 py-4 hover:bg-white/[0.02] transition-colors group">
                <span className="text-sm font-black text-zinc-700 w-6 shrink-0 tabular-nums">#{i + 1}</span>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors truncate">{p.title}</p>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded mt-1 inline-block ${catStyle.text} ${catStyle.bg}`}>
                    {p.category}
                  </span>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-base font-black text-orange-400">${dealPrice.toFixed(2)}</p>
                  <p className="text-xs text-zinc-600 line-through">${Number(p.price).toFixed(2)}</p>
                </div>

                <Link href={`/admin/products/${p.id}/inventory`}
                  className="text-[11px] font-black uppercase tracking-widest text-zinc-600 hover:text-orange-400 transition-colors shrink-0 px-3 py-1.5 rounded-lg hover:bg-orange-500/10">
                  Stock
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* How it Works */}
      <div className="admin-card p-6 bg-gradient-to-br from-orange-500/5 to-transparent border-orange-500/10">
        <h2 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
          <Zap size={16} className="text-orange-400" /> How the Deal Vault Works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { num: "01", text: `Selects ${todayDeals.length} products daily using a date-based seed algorithm` },
            { num: "02", text: `All selected products get ${DISCOUNT_PCT}% off their regular price automatically` },
            { num: "03", text: "The vault resets at midnight UTC every day with fresh deals" },
            { num: "04", text: "Push today's deals to Discord to notify your community" },
            { num: "05", text: "To change which products appear, adjust product prices or active status" },
          ].map((item) => (
            <div key={item.num} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex gap-4 items-start">
              <span className="text-2xl font-black text-orange-500/20 shrink-0">{item.num}</span>
              <p className="text-sm font-medium text-zinc-400 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
