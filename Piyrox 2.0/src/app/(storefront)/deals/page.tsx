import type { Metadata } from "next";
import { Tag, Clock, Zap, Lock } from "lucide-react";
import DealCard from "@/components/storefront/DealCard";
import DealCountdown from "@/components/storefront/DealCountdown";
import { getDealsData } from "@/lib/server-data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Daily Deals — PIYROX",
  description: "Daily deals with 20% off on premium digital subscriptions. Refreshes every 24 hours. Limited time only.",
};

export default async function DealsPage() {
  const { deals, resetAt } = await getDealsData();

  return (
    <div className="min-h-screen bg-black">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,255,255,0.08) 0%, transparent 60%)" }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 40% 40% at 0% 100%, rgba(255,255,255,0.04) 0%, transparent 50%)" }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-6 glass-card"
              style={{ color: "#ffffff" }}>
              <span className="w-2 h-2 rounded-full animate-pulse bg-white" />
              VAULT OPEN — 24H ONLY
            </div>

            <h1 className="text-5xl sm:text-6xl font-black mb-4 tracking-tight">
              <span className="gradient-text-violet">DEAL</span>
              <span className="text-white"> VAULT</span>
            </h1>

            <p className="text-lg mb-2 max-w-xl mx-auto text-white/70">
              {deals.length} products unlocked at{" "}
              <span className="font-black text-white">20% OFF</span>
            </p>
            <p className="text-sm mb-8 text-white/50">Vault resets every 24 hours. Access expires at midnight.</p>

            <div className="inline-flex items-center gap-4 px-6 py-3 rounded-xl glass-card">
              <DealCountdown resetAt={resetAt} />
            </div>
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className="border-y border-white/10 py-2.5">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-6 text-xs flex-wrap">
          {[
            { icon: Zap, text: "INSTANT DELIVERY" },
            { icon: Lock, text: "ENCRYPTED CREDENTIALS" },
            { icon: Clock, text: "RESETS AT MIDNIGHT UTC" },
            { icon: Tag, text: `${deals.length} DEALS ACTIVE` },
          ].map(({ icon: Icon, text }) => (
            <span key={text} className="flex items-center gap-1.5 text-white/60">
              <Icon size={12} /> {text}
            </span>
          ))}
        </div>
      </div>

      {/* Deals grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {deals.length === 0 ? (
          <div className="text-center py-20 text-white/40">
            <Lock size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">Vault is empty</p>
            <p className="text-sm mt-1 text-white/50">New deals unlock daily at midnight UTC.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {deals.map((deal) => (
                <DealCard key={deal.id} {...deal} />
              ))}
            </div>

            <div className="mt-12 text-center">
              <div className="inline-flex items-center gap-3 px-6 py-4 rounded-xl text-sm glass-card text-white/60">
                <Clock size={16} className="text-white/80" />
                Vault closes at midnight UTC. Prices revert to normal after reset.
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}