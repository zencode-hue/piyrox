import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendDiscordNotification } from "@/lib/discord";

export const dynamic = "force-dynamic";

const DISCOUNT_PCT = 20;
const DEALS_COUNT = 7;

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getDaySeed(): number {
  const now = new Date();
  return now.getUTCFullYear() * 10000 + (now.getUTCMonth() + 1) * 100 + now.getUTCDate();
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const secretParam = req.nextUrl.searchParams.get("secret");
    const isVercelCron = authHeader === `Bearer ${process.env.CRON_SECRET}`;
    const isManual = secretParam === process.env.CRON_SECRET;

    if (!isVercelCron && !isManual) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const webhookUrl = process.env.DISCORD_DEALS_WEBHOOK_URL ?? process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) {
      return NextResponse.json({ error: "No webhook configured" }, { status: 503 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://metramart.xyz";

    // Fetch products directly from DB to avoid self-fetch issues in some environments
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const products = await (db.product.findMany as any)({
      where: { isActive: true },
      select: { id: true, title: true, price: true }
    }) as Array<{ id: string; title: string; price: { toString(): string } }>;

    if (!products.length) {
      return NextResponse.json({ ok: false, message: "No active products for deals" });
    }

    const seed = getDaySeed();
    const shuffled = seededShuffle(products, seed);
    const selected = shuffled.slice(0, Math.min(DEALS_COUNT, shuffled.length));

    const dealFields = selected.map((p) => {
      const originalPrice = Number(p.price);
      const dealPrice = Math.round(originalPrice * 0.8 * 100) / 100;
      const savings = Math.round((originalPrice - dealPrice) * 100) / 100;

      return {
        name: `${p.title}`,
        value: [
          `~~$${originalPrice.toFixed(2)}~~ → **$${dealPrice.toFixed(2)}**`,
          `Save **$${savings.toFixed(2)}** (${DISCOUNT_PCT}% OFF)`,
          `[Grab Deal](${appUrl}/checkout/confirm?productId=${p.id})`,
        ].join("\n"),
        inline: true,
      };
    });

    const dateStr = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

    const payload = {
      username: "MetraMart Deals",
      avatar_url: `${appUrl}/logo.png`,
      embeds: [
        {
          title: "🔥  DAILY DEAL VAULT — NOW OPEN",
          description: [
            `> **${selected.length} exclusive deals** just dropped for **${dateStr}**`,
            `> Each deal is **${DISCOUNT_PCT}% OFF** — vault resets at midnight UTC`,
            "",
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
            `**[→ View All Deals](${appUrl}/deals)**`,
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
          ].join("\n"),
          color: 0xea580c,
          fields: dealFields,
          footer: {
            text: `MetraMart • Deals reset daily at midnight UTC • Seed #${seed}`,
            icon_url: `${appUrl}/logo.png`,
          },
          timestamp: new Date().toISOString(),
        },
      ],
    };

    await sendDiscordNotification(webhookUrl, payload);
    return NextResponse.json({ ok: true, dealsNotified: selected.length });
  } catch (err) {
    console.error("[CRON deals-notify] Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

