import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendDiscordNotification } from "@/lib/discord";

export const dynamic = "force-dynamic";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Seeded random so the same minute doesn't fire twice if retried */
function seededRand(seed: number, index: number): number {
  const x = Math.sin(seed + index) * 10000;
  return x - Math.floor(x);
}

// ─── Name / Location pools ────────────────────────────────────────────────────

const FIRST_NAMES = [
  "Alex", "Jordan", "Sam", "Taylor", "Morgan", "Casey", "Riley", "Jamie",
  "Avery", "Quinn", "Blake", "Drew", "Skyler", "Reese", "Peyton", "Logan",
  "Hayden", "Cameron", "Emery", "Finley", "Rowan", "Sage", "Kai", "Zara",
  "Noel", "Ash", "Remy", "Jaden", "Corey", "Dana",
];

const LOCATIONS = [
  "🇺🇸 United States", "🇬🇧 United Kingdom", "🇨🇦 Canada", "🇦🇺 Australia",
  "🇩🇪 Germany", "🇫🇷 France", "🇳🇱 Netherlands", "🇸🇬 Singapore",
  "🇳🇬 Nigeria", "🇿🇦 South Africa", "🇮🇳 India", "🇧🇷 Brazil",
  "🇦🇪 UAE", "🇲🇾 Malaysia", "🇵🇭 Philippines", "🇮🇩 Indonesia",
];

// ─── Review templates ─────────────────────────────────────────────────────────

interface ReviewTemplate {
  rating: number;
  stars: string;
  badge: string;
  comments: string[];
}

const REVIEW_TEMPLATES: ReviewTemplate[] = [
  {
    rating: 5,
    stars: "⭐⭐⭐⭐⭐",
    badge: "✅ Verified Purchase",
    comments: [
      "Worked perfectly straight away. Delivery was instant, no issues at all. Will definitely be back.",
      "Exactly what I needed. Activated first try and everything is running smooth. 10/10.",
      "Super fast delivery and the product works flawlessly. PIYROX never disappoints.",
      "Got it within seconds of paying. Already using it and it's great. Highly recommend.",
      "Legit and fast. I was skeptical at first but this is the real deal. Very happy.",
      "Smooth transaction, product delivered instantly. Already shared this site with my friends.",
    ],
  },
  {
    rating: 5,
    stars: "⭐⭐⭐⭐⭐",
    badge: "✅ Verified Purchase",
    comments: [
      "Honestly surprised how fast this was. Paid and had it in under a minute. Solid.",
      "Works great. No complaints. Will order again next month for sure.",
      "Best price I found anywhere. Delivery was instant and it activated no problem.",
    ],
  },
  {
    rating: 4,
    stars: "⭐⭐⭐⭐",
    badge: "✅ Verified Purchase",
    comments: [
      "Good product, took about 10 mins to get delivered but it works fine. Happy overall.",
      "Works as described. Delivery wasn't instant but came through within the hour. No complaints.",
      "4 stars because it took a little while to activate but support helped me out quickly. Good service.",
      "Product is legit. Took maybe 20 mins to get sorted but it's all working now. Would buy again.",
      "Decent experience. Had a small hiccup at checkout but it got resolved. Product itself is great.",
    ],
  },
  {
    rating: 4,
    stars: "⭐⭐⭐⭐",
    badge: "✅ Verified Purchase",
    comments: [
      "Solid. Took about 30 mins to get my order but support was responsive. Works perfectly now.",
      "Not instant delivery but it came through and works. Would still recommend PIYROX.",
    ],
  },
  {
    rating: 3,
    stars: "⭐⭐⭐",
    badge: "✅ Verified Purchase",
    comments: [
      "Product works but it took almost an hour to get delivered. Not ideal but it got there.",
      "It works, just took longer than expected. Support eventually sorted it out. Average experience.",
      "3 stars. The product is fine but the wait was a bit long. Maybe I just caught a busy time.",
      "Took about 1 hr to get it done, not too bad I guess. Product works so can't complain too much.",
    ],
  },
];

// ─── Variant label pools per category ────────────────────────────────────────

const VARIANT_LABELS: Record<string, string[]> = {
  AI_TOOLS: ["1 Month", "3 Months", "6 Months", "1 Year", "Lifetime"],
  STREAMING: ["1 Month", "3 Months", "6 Months", "1 Year", "Family Plan", "Individual"],
  SOFTWARE: ["1 License", "3 Months", "1 Year", "Lifetime"],
  GAMING: ["1 Month", "3 Months", "6 Months", "1 Year"],
};

function getVariantLabel(category: string): string {
  const labels = VARIANT_LABELS[category] ?? ["1 Month", "3 Months", "6 Months"];
  return pick(labels);
}

// ─── Purchase message builders ────────────────────────────────────────────────

function buildPurchaseEmbed(
  product: { title: string; price: number; category: string },
  appUrl: string
) {
  const name = pick(FIRST_NAMES);
  const location = pick(LOCATIONS);
  const variant = getVariantLabel(product.category);
  const template = pick(REVIEW_TEMPLATES);
  const comment = pick(template.comments);

  // Slightly vary the displayed price (simulate variant pricing ±10%)
  const priceVariance = 0.9 + Math.random() * 0.2;
  const displayPrice = (product.price * priceVariance).toFixed(2);

  // Random time ago (1–59 mins)
  const minsAgo = randInt(1, 59);
  const timeLabel = minsAgo === 1 ? "1 minute ago" : `${minsAgo} minutes ago`;

  // Color based on rating
  const colorMap: Record<number, number> = {
    5: 0x22c55e, // green
    4: 0x3b82f6, // blue
    3: 0xf59e0b, // amber
    2: 0xef4444, // red
    1: 0x6b7280, // gray
  };
  const color = colorMap[template.rating] ?? 0x22c55e;

  return {
    color,
    author: {
      name: `${name} just purchased from PIYROX`,
      icon_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=64`,
    },
    title: `🛒 ${product.title} — ${variant}`,
    description: [
      `> **${name}** from **${location}** just bought **${product.title} (${variant})** for **$${displayPrice}**`,
      "",
      `**Their review:**`,
      `${template.stars}  ${template.badge}`,
      `*"${comment}"*`,
    ].join("\n"),
    fields: [
      { name: "Product", value: product.title, inline: true },
      { name: "Plan", value: variant, inline: true },
      { name: "Price Paid", value: `$${displayPrice}`, inline: true },
      { name: "Rating", value: `${template.stars} (${template.rating}/5)`, inline: true },
      { name: "Location", value: location, inline: true },
      { name: "Purchased", value: timeLabel, inline: true },
    ],
    footer: {
      text: "PIYROX • Real customer purchase • piyrox.xyz",
    },
    timestamp: new Date().toISOString(),
    url: `${appUrl}/products`,
  };
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    // Auth check — supports both Vercel cron header and manual ?secret= param
    const authHeader = req.headers.get("authorization");
    const secretParam = req.nextUrl.searchParams.get("secret");
    const isVercelCron = authHeader === `Bearer ${process.env.CRON_SECRET}`;
    const isManual = secretParam === process.env.CRON_SECRET;

    if (!isVercelCron && !isManual) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Resolve webhook URL — dedicated vouch channel first, then fallback
    const vouchSetting = await db.siteSetting.findUnique({
      where: { key: "discord_vouch_webhook_url" },
    });
    const webhookUrl =
      vouchSetting?.value ||
      process.env.DISCORD_VOUCH_WEBHOOK_URL ||
      process.env.DISCORD_WEBHOOK_URL;

    if (!webhookUrl) {
      return NextResponse.json(
        { error: "No vouch webhook configured. Set DISCORD_VOUCH_WEBHOOK_URL in env or Admin → Settings." },
        { status: 503 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://piyrox.xyz";

    // Fetch a random active product
    const products = await db.product.findMany({
      where: { isActive: true },
      select: { id: true, title: true, price: true, category: true },
    });

    if (!products.length) {
      return NextResponse.json({ ok: false, message: "No active products found" });
    }

    // Use time-based seed so each cron fire picks a different product
    const seed = Date.now();
    const idx = Math.floor(seededRand(seed, 7) * products.length);
    const raw = products[idx];
    const product = {
      title: raw.title,
      price: Number(raw.price),
      category: raw.category as string,
    };

    const embed = buildPurchaseEmbed(product, appUrl);

    await sendDiscordNotification(webhookUrl, {
      username: "PIYROX Reviews",
      avatar_url: `${appUrl}/logo.png`,
      embeds: [embed],
    });

    return NextResponse.json({
      ok: true,
      product: product.title,
      rating: embed.fields?.find((f) => f.name === "Rating")?.value,
    });
  } catch (err) {
    console.error("[CRON auto-vouch] Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
