"use client";

const BADGES = [
  { emoji: "⚡", label: "Instant Delivery" },
  { emoji: "🔒", label: "Secure Payments" },
  { emoji: "⭐", label: "4.8/5 Rating" },
  { emoji: "🛡️", label: "Replacement Guarantee" },
  { emoji: "👥", label: "10,000+ Customers" },
  { emoji: "✅", label: "Verified Products" },
];

export default function TrustBadges() {
  const doubled = [...BADGES, ...BADGES];

  return (
    <div
      className="relative overflow-hidden border-y"
      style={{ borderColor: "rgba(255,255,255,0.05)", backgroundColor: "#09090b" }}
    >
      <div className="flex animate-marquee whitespace-nowrap py-3.5">
        {doubled.map((b, i) => (
          <span
            key={i}
            className="mx-6 inline-flex items-center gap-2 text-xs font-medium text-zinc-400 shrink-0"
          >
            <span className="text-sm">{b.emoji}</span>
            {b.label}
          </span>
        ))}
      </div>

      {/* Gradient fade edges */}
      <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#09090b] to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#09090b] to-transparent z-10 pointer-events-none" />

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
}
