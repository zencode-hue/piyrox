import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendDiscordNotification } from "@/lib/discord";

export const dynamic = "force-dynamic";

// ─── Helper functions ─────────────────────────────────────────────────────────

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

// ─── Customer name pools ─────────────────────────────────────────────────────

const CUSTOMER_NAMES = [
  "Alex", "Jordan", "Sam", "Taylor", "Morgan", "Casey", "Riley", "Jamie",
  "Avery", "Quinn", "Blake", "Drew", "Skyler", "Reese", "Peyton", "Logan",
  "Hayden", "Cameron", "Emery", "Finley", "Rowan", "Sage", "Kai", "Zara",
  "Noel", "Ash", "Remy", "Jaden", "Corey", "Dana", "Chris", "Pat",
  "Lee", "Morgan", "Jess", "Dev", "Riley", "Avery", "Quinn", "Blake",
  "Cameron", "Drew", "Finley", "Hayden", "Jamie", "Jordan", "Logan",
  "Morgan", "Noel", "Peyton", "Riley", "Sam", "Taylor", "Alexis",
  "Andi", "Beck", "Charlie", "Dakota", "Emmie", "Fin", "Gray", "Harper",
  "Indigo", "Jules", "Kai", "Lennon", "Mack", "Nico", "Oakley", "Phoenix",
  "Quinn", "River", "Sage", "Tatum", "Uri", "Vance", "Wren", "Xander",
  "Yael", "Zane", "Aiden", "Bri", "Cade", "Drew", "Ellis", "Finn",
  "Gabe", "Haven", "Ian", "Jax", "Kian", "Liam", "Milo", "Noah",
  "Owen", "Pax", "Quinn", "Rhys", "Sawyer", "Theo", "Uri", "Vance",
  "West", "Xander", "Yosef", "Zach", "Ava", "Bella", "Chloe", "Daisy",
  "Emma", "Faith", "Grace", "Hannah", "Iris", "Jade", "Kate", "Luna",
  "Mia", "Nora", "Olivia", "Piper", "Quinn", "Ruby", "Sophia", "Tessa",
  "Uma", "Violet", "Willow", "Xena", "Yara", "Zoe", "Abby", "Brooke",
  "Carly", "Dana", "Emily", "Fiona", "Gina", "Holly", "Ivy", "Jill",
  "Kara", "Lily", "Megan", "Nina", "Olga", "Paige", "Rachel", "Sara",
  "Tina", "Uma", "Vicky", "Wendy", "Xena", "Yara", "Zara", "Amy",
  "Beth", "Cara", "Deb", "Eva", "Fay", "Gin", "Hope", "Ivy",
  "Joy", "Kay", "Liz", "Mae", "Nan", "Opal", "Pam", "Rae",
  "Sue", "Tia", "Una", "Vera", "Wendy", "Xena", "Yolanda", "Zelda"
];

// ─── Review templates with realistic sentiment ─────────────────────────────────

interface ReviewTemplate {
  rating: number;
  stars: string;
  comments: string[];
}

const REVIEW_TEMPLATES: ReviewTemplate[] = [
  {
    rating: 5,
    stars: "⭐⭐⭐⭐⭐",
    comments: [
      "Absolutely amazing! Got it instantly and it's working perfectly. Will definitely be back for more.",
      "This exceeded my expectations! Super fast delivery and the product works flawlessly. Highly recommend MetraMart.",
      "Perfect! Activated right away, no issues at all. Best service I've seen in a while.",
      "Wow, that was fast! Paid and had it in seconds. Already using it and it's great value.",
      "Legit and quick. I was worried at first but this is the real deal. Very satisfied with my purchase.",
      "Smooth transaction from start to finish. Product delivered instantly and works perfectly. 10/10!",
      "Outstanding service! Got it within seconds of paying. Already told my friends about this place.",
      "Impressive speed and quality. Exactly what I needed, no complications at all. Will order again.",
    ],
  },
  {
    rating: 5,
    stars: "⭐⭐⭐⭐⭐",
    comments: [
      "Honestly surprised how fast this was. Paid and had it in under a minute. Solid service.",
      "Works great, no complaints at all. Will definitely be ordering again next month.",
      "Best price I found online. Delivery was instant and it activated without any issues.",
      "Fast and reliable. Got my product quickly and it's working perfectly as described.",
      "Top-notch service! The product arrived exactly as promised and works flawlessly.",
      "Smooth experience from payment to delivery. Very happy with this purchase.",
      "Impressed with the speed and quality. MetraMart really delivers on their promises.",
      "Perfect! No waiting, no hassle. Exactly what I needed when I needed it.",
    ],
  },
  {
    rating: 4,
    stars: "⭐⭐⭐⭐",
    comments: [
      "Good product, took about 15 minutes to get delivered but it works fine. Happy with the purchase.",
      "Works as described. Delivery wasn't instant but came through within 30 minutes. No major complaints.",
      "4 stars because it took a little while to activate but support helped me out quickly. Good overall service.",
      "Product is legit. Took maybe 25 minutes to get sorted but it's all working now. Would buy again.",
      "Decent experience. Had a small hiccup but it got resolved quickly. The product itself is great.",
      "Slightly slower than expected but the quality makes up for it. Support was responsive when needed.",
      "Good value for money. The wait was a bit long but the product works perfectly now.",
      "Almost perfect! Just a minor delay in delivery but everything else was excellent.",
    ],
  },
  {
    rating: 4,
    stars: "⭐⭐⭐⭐",
    comments: [
      "Solid service. Took about 40 minutes to get my order but support was helpful. Works perfectly now.",
      "Not instant delivery but it came through and works well. Would still recommend MetraMart.",
      "Good product with reasonable delivery time. A bit slower than ideal but worth the wait.",
      "4 stars because of the delay, but the product quality is excellent. Support team was great.",
      "Decent overall experience. The wait was longer than I'd like but the end result is good.",
      "Product works as expected. Delivery took some time but it was worth it for the quality.",
      "Satisfied with the purchase. Just wish it was a bit faster, but no complaints about the product.",
      "Good service, just a bit slow on delivery. The product itself is top-notch though.",
    ],
  },
  {
    rating: 3,
    stars: "⭐⭐⭐",
    comments: [
      "Product works but it took almost an hour to get delivered. Not ideal but it got there in the end.",
      "It works, just took longer than I expected. Support eventually sorted it out. Average experience overall.",
      "3 stars. The product is fine but the wait was quite long. Maybe I just caught a busy time.",
      "Took about 1.5 hours to get it done, not too bad I guess. Product works so can't complain too much.",
      "Slow delivery but the product itself is decent. Support could be a bit more responsive.",
      "Average experience. The product works as advertised but the delivery time was frustrating.",
      "It's okay, I guess. The wait was annoying but at least it works. Might try again sometime.",
      "3 stars because of the slow delivery. The product is fine but the service could be faster.",
    ],
  },
  {
    rating: 3,
    stars: "⭐⭐⭐",
    comments: [
      "Product works but delivery took forever. Had to follow up multiple times to get it sorted.",
      "It's functional but the wait time was excessive. Support was slow to respond but eventually helped.",
      "Decent product but the service needs improvement. Delivery took way too long for my liking.",
      "3 stars because of the poor delivery experience. The product itself is okay but not worth the wait.",
      "Slow and a bit frustrating. Got what I paid for eventually but the process could be smoother.",
      "Average at best. The product works but the delivery time was unacceptable. Support was mediocre.",
      "Not impressed with the delivery speed. The product is fine but I expected better service.",
      "It works, just barely. The wait was too long and support wasn't very helpful. Won't rush back.",
    ],
  },
];

// ─── Build Discord embed for product review ─────────────────────────────────

function buildReviewEmbed(
  product: { title: string; price: number },
  customerName: string,
  template: ReviewTemplate
) {
  // Slightly vary the displayed price (simulate ±5%)
  const priceVariance = 0.95 + Math.random() * 0.1;
  const displayPrice = (product.price * priceVariance).toFixed(2);
  
  // Random time ago (10 mins to 3 hours)
  const minsAgo = randInt(10, 180);
  const timeLabel = minsAgo < 60 
    ? `${minsAgo} minutes ago` 
    : `${Math.floor(minsAgo / 60)} hour${Math.floor(minsAgo / 60) === 1 ? '' : 's'} ago`;

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
      name: `${customerName} left a review`,
      icon_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(customerName)}&background=random&size=64`,
    },
    title: `📝 Review for ${product.title}`,
    description: [
      `> **${customerName}** just reviewed **${product.title}** (paid $${displayPrice})`,
      "",
      `**Their review:**`,
      `${template.stars}  Verified Purchase`,
      `*"${pick(template.comments)}"*`,
    ].join("\n"),
    fields: [
      { name: "Product", value: product.title, inline: true },
      { name: "Price Paid", value: `$${displayPrice}`, inline: true },
      { name: "Rating", value: `${template.stars} (${template.rating}/5)`, inline: true },
      { name: "Review Time", value: timeLabel, inline: true },
    ],
    footer: {
      text: "MetraMart • Customer Reviews • metramart.xyz",
    },
    timestamp: new Date().toISOString(),
  };
}

// ─── Route handler ───────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    // Security check - verify custom authorization header
    const securityToken = req.headers.get("X-Cron-Security-Token");
    const expectedToken = process.env.CRON_SECURITY_TOKEN;

    if (!securityToken || securityToken !== expectedToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Resolve webhook URL - dedicated review channel first, then fallback
    const reviewSetting = await db.siteSetting.findUnique({
      where: { key: "discord_review_webhook_url" },
    });
    const webhookUrl =
      reviewSetting?.value ||
      process.env.DISCORD_REVIEW_WEBHOOK_URL ||
      process.env.DISCORD_WEBHOOK_URL;

    if (!webhookUrl) {
      return NextResponse.json(
        { error: "No review webhook configured. Set DISCORD_REVIEW_WEBHOOK_URL in env or Admin → Settings." },
        { status: 503 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://metramart.xyz";

    // Fetch a random active product
    const products = await db.product.findMany({
      where: { isActive: true },
      select: { id: true, title: true, price: true },
    });

    if (!products.length) {
      return NextResponse.json({ ok: false, message: "No active products found" });
    }

    // Use time-based seed so each cron fire picks a different product
    const seed = Date.now();
    const idx = Math.floor(seededRand(seed, 3) * products.length);
    const raw = products[idx];
    const product = {
      title: raw.title,
      price: Number(raw.price),
    };

    // Generate random customer name and review template
    const customerName = pick(CUSTOMER_NAMES);
    const template = pick(REVIEW_TEMPLATES);

    const embed = buildReviewEmbed(product, customerName, template);

    await sendDiscordNotification(webhookUrl, {
      username: "MetraMart Reviews",
      avatar_url: `${appUrl}/logo.png`,
      embeds: [embed],
    });

    return NextResponse.json({
      ok: true,
      product: product.title,
      customer: customerName,
      rating: template.rating,
      message: "Review posted successfully",
    });
  } catch (err) {
    console.error("[CRON product-review] Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}