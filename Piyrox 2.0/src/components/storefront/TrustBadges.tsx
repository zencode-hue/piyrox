"use client";

const badges = [
  { emoji: "⚡", label: "Instant Delivery" },
  { emoji: "🔒", label: "Secure Payments" },
  { emoji: "⭐", label: "4.8/5 Rating" },
  { emoji: "🛡️", label: "Replacement Guarantee" },
  { emoji: "👥", label: "10,000+ Customers" },
  { emoji: "✅", label: "Verified Products" },
];

export default function TrustBadges() {
  return (
    <section
      className="border-y overflow-hidden py-3"
      style={{
        background: "#09090b",
        borderColor: "rgba(255,255,255,0.06)",
      }}
    >
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
      <div
        className="flex w-max"
        style={{ animation: "marquee 25s linear infinite" }}
      >
        {[...badges, ...badges].map((b, i) => (
          <div
            key={`${b.label}-${i}`}
            className="flex items-center gap-2 px-8 shrink-0"
          >
            <span className="text-base">{b.emoji}</span>
            <span className="text-xs font-medium text-white/70 whitespace-nowrap">
              {b.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
