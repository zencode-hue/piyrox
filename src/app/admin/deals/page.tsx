import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { Zap, Clock, Tag, Package, MessageSquare, ExternalLink } from "lucide-react";
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

  // Get today's seed to show which products are in the vault
  const now = new Date();
  const seed = now.getUTCFullYear() * 10000 + (now.getUTCMonth() + 1) * 100 + now.getUTCDate();

  const allProducts = await db.product.findMany({
    where: { isActive: true },
    select: { id: true, title: true, price: true, category: true, imageUrl: true },
    orderBy: { createdAt: "desc" },
  });

  // Seeded shuffle to show today's deals
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

  const CATEGORY_COLORS: Record<string, string> = {
    STREAMING: "text-amber-400", AI_TOOLS: "text-yellow-400",
    SOFTWARE: "text-orange-400", GAMING: "text-amber-300",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Zap size={22} style={{ color: "#f59e0b" }} /> Deal Vault Manager
        </h1>
        <div className="flex items-center gap-2 text-sm" style={{ color: "rgba(245,158,11,0.7)" }}>
          <Clock size={14} />
          Resets in {hoursLeft}h {minsLeft}m
        </div>
      </div>

      {/* Status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-4" style={{ borderColor: dealsEnabled ? "rgba(74,222,128,0.2)" : "rgba(248,113,113,0.2)" }}>
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <Zap size={12} style={{ color: dealsEnabled ? "#4ade80" : "#f87171" }} /> Vault Status
          </div>
          <div className="text-lg font-bold" style={{ color: dealsEnabled ? "#4ade80" : "#f87171" }}>
            {dealsEnabled ? "ACTIVE" : "DISABLED"}
          </div>
          <Link href="/admin/settings" className="text-xs text-amber-400 hover:text-amber-300 mt-1 block">
            Change in Settings
          </Link>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <Tag size={12} style={{ color: "#fbbf24" }} /> Discount Rate
          </div>
          <div className="text-lg font-bold text-amber-400">{DISCOUNT_PCT}% OFF</div>
          <p className="text-xs text-gray-600 mt-1">Applied to all vault products</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <Package size={12} style={{ color: "#f59e0b" }} /> Today's Deals
          </div>
          <div className="text-lg font-bold text-white">{todayDeals.length} products</div>
          <p className="text-xs text-gray-600 mt-1">Seed #{seed}</p>
        </div>
      </div>

      {/* Discord Push */}
      <DealsDiscordPush initialWebhook={discordWebhook} />

      {/* Today's vault products */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Zap size={14} style={{ color: "#f59e0b" }} /> Today&apos;s Vault Products
          </h2>
          <Link href="/deals" target="_blank" className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300">
            View Live <ExternalLink size={11} />
          </Link>
        </div>
        <div className="divide-y divide-white/5">
          {todayDeals.map((p, i) => {
            const dealPrice = Number(p.price) * (1 - DISCOUNT_PCT / 100);
            return (
              <div key={p.id} className="flex items-center gap-4 px-5 py-3 hover:bg-white/2 transition-colors">
                <span className="text-xs text-gray-600 w-5 shrink-0">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{p.title}</p>
                  <span className={`text-xs ${CATEGORY_COLORS[p.category] ?? "text-gray-400"}`}>{p.category}</span>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-amber-400">${dealPrice.toFixed(2)}</p>
                  <p className="text-xs text-gray-600 line-through">${Number(p.price).toFixed(2)}</p>
                </div>
                <Link href={`/admin/products/${p.id}/inventory`}
                  className="text-xs text-gray-600 hover:text-amber-400 transition-colors shrink-0">
                  Stock
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      <div className="glass-card p-5">
        <h2 className="text-sm font-semibold text-white mb-3">How the Deal Vault Works</h2>
        <div className="space-y-2 text-sm text-gray-400">
          <p>• The vault automatically selects {todayDeals.length} products daily using a date-based seed</p>
          <p>• All selected products get {DISCOUNT_PCT}% off their regular price</p>
          <p>• The vault resets at midnight UTC every day</p>
          <p>• Use the Discord push button above to notify your community about today&apos;s deals</p>
          <p>• To change which products appear, adjust product prices or active status</p>
        </div>
      </div>
    </div>
  );
}
