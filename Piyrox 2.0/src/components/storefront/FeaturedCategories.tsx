"use client";

import Link from "next/link";
import { Monitor, Cpu, Gamepad2, Code2 } from "lucide-react";

const CATEGORIES = [
  { id: "STREAMING", label: "Streaming", desc: "Netflix, Spotify, IPTV & more", icon: Monitor },
  { id: "AI_TOOLS", label: "AI Tools", desc: "ChatGPT, Midjourney & more", icon: Cpu },
  { id: "GAMING", label: "Gaming", desc: "Game keys, accounts & boosts", icon: Gamepad2 },
  { id: "SOFTWARE", label: "Software", desc: "Licenses, VPNs & utilities", icon: Code2 },
];

export default function FeaturedCategories() {
  return (
    <section className="border-t border-white/5" style={{ backgroundColor: "#09090b" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 mb-3">Categories</p>
          <h2 className="text-2xl font-bold text-white">Browse by Category</h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.id}`}
              className="group rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-1"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-white/[0.06] transition-colors"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <cat.icon size={22} className="text-white" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">{cat.label}</h3>
              <p className="text-xs text-zinc-500">{cat.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
