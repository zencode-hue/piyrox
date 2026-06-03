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

// ─── Customer name pools with more boys names ─────────────────────────────────

const BOY_NAMES = [
  "Alex", "Jordan", "Sam", "Taylor", "Morgan", "Casey", "Riley", "Jamie",
  "Avery", "Quinn", "Blake", "Drew", "Skyler", "Reese", "Peyton", "Logan",
  "Hayden", "Cameron", "Emery", "Finley", "Rowan", "Sage", "Kai", "Zara",
  "Noel", "Ash", "Remy", "Jaden", "Corey", "Dana", "Chris", "Pat",
  "Lee", "Jess", "Dev", "Cade", "Ellis", "Finn", "Gabe", "Haven",
  "Ian", "Jax", "Kian", "Liam", "Milo", "Noah", "Owen", "Pax",
  "Rhys", "Sawyer", "Theo", "Uri", "Vance", "West", "Xander", "Yosef",
  "Zach", "Beck", "Charlie", "Dakota", "Emmie", "Gray", "Harper", "Indigo",
  "Jules", "Lennon", "Mack", "Nico", "Oakley", "Phoenix", "River", "Tatum",
  "Uri", "Wren", "Aiden", "Bri", "Drew", "Jax", "Kian", "Liam",
  "Milo", "Noah", "Owen", "Pax", "Rhys", "Sawyer", "Theo", "Vance",
  "West", "Xander", "Yosef", "Zach", "Chris", "Pat", "Lee", "Jess",
  "Dev", "Cade", "Ellis", "Finn", "Gabe", "Haven", "Ian", "Jax",
  "Kian", "Liam", "Milo", "Noah", "Owen", "Pax", "Rhys", "Sawyer",
  "Theo", "Vance", "West", "Xander", "Yosef", "Zach", "Alex", "Jordan",
  "Sam", "Taylor", "Morgan", "Casey", "Riley", "Jamie", "Avery", "Quinn",
  "Blake", "Drew", "Skyler", "Reese", "Peyton", "Logan", "Hayden", "Cameron",
  "Emery", "Finley", "Rowan", "Sage", "Kai", "Zara", "Noel", "Ash",
  "Remy", "Jaden", "Corey", "Dana", "Chris", "Pat", "Lee", "Jess",
  "Dev", "Cade", "Ellis", "Finn", "Gabe", "Haven", "Ian", "Jax",
  "Kian", "Liam", "Milo", "Noah", "Owen", "Pax", "Rhys", "Sawyer",
  "Theo", "Vance", "West", "Xander", "Yosef", "Zach", "Max", "Ethan",
  "Lucas", "Mason", "Logan", "Jacob", "Aiden", "Jackson", "Elijah", "Oliver",
  "William", "James", "Benjamin", "Lucas", "Henry", "Alexander", "Michael", "Daniel",
  "Matthew", "David", "Joseph", "Samuel", "Anthony", "Christopher", "Andrew", "Nathan",
  "John", "Jonathan", "Tyler", "Aaron", "Justin", "Jayden", "Jordan", "Ryan"
];

const GIRL_NAMES = [
  "Taylor", "Morgan", "Casey", "Riley", "Jamie", "Avery", "Quinn", "Blake",
  "Drew", "Skyler", "Reese", "Peyton", "Logan", "Hayden", "Cameron", "Emery",
  "Finley", "Rowan", "Sage", "Kai", "Zara", "Noel", "Ash", "Remy",
  "Jaden", "Corey", "Dana", "Alexis", "Andi", "Beck", "Charlie", "Dakota",
  "Emmie", "Fin", "Gray", "Harper", "Indigo", "Jules", "Lennon", "Mack",
  "Nico", "Oakley", "Phoenix", "River", "Sage", "Tatum", "Uri", "Vance",
  "Wren", "Xander", "Yael", "Zane", "Bri", "Cade", "Drew", "Ellis",
  "Finn", "Gabe", "Haven", "Ian", "Jax", "Kian", "Liam", "Milo",
  "Noah", "Owen", "Pax", "Rhys", "Sawyer", "Theo", "Uri", "Vance",
  "West", "Xander", "Yosef", "Zach", "Ava", "Bella", "Chloe", "Daisy",
  "Emma", "Faith", "Grace", "Hannah", "Iris", "Jade", "Kate", "Luna",
  "Mia", "Nora", "Olivia", "Piper", "Ruby", "Sophia", "Tessa", "Uma",
  "Violet", "Willow", "Xena", "Yara", "Zoe", "Abby", "Brooke", "Carly",
  "Dana", "Emily", "Fiona", "Gina", "Holly", "Ivy", "Jill", "Kara",
  "Lily", "Megan", "Nina", "Olga", "Paige", "Rachel", "Sara", "Tina",
  "Uma", "Vicky", "Wendy", "Xena", "Yara", "Zara", "Amy", "Beth",
  "Cara", "Deb", "Eva", "Fay", "Gin", "Hope", "Ivy", "Joy",
  "Kay", "Liz", "Mae", "Nan", "Opal", "Pam", "Rae", "Sue",
  "Tia", "Una", "Vera", "Wendy", "Xena", "Yolanda", "Zelda"
];

// ─── Purchase scenarios ─────────────────────────────────────────────────────

interface PurchaseItem {
  title: string;
  price: number;
  category: string;
}

interface PurchaseScenario {
  type: "single" | "cart";
  items: PurchaseItem[];
  total: number;
  description: string;
}

async function generatePurchaseScenario(): Promise<PurchaseScenario> {
  const products = await db.product.findMany({
    where: { isActive: true },
    select: { id: true, title: true, price: true, category: true },
  });

  if (!products.length) {
    throw new Error("No active products found");
  }

  const isCartPurchase = Math.random() > 0.6; // 40% chance of cart purchase
  const itemCount = isCartPurchase ? randInt(2, 4) : 1;
  
  const selectedItems: PurchaseItem[] = [];
  let total = 0;

  // Select random items
  const shuffled = [...products].sort(() => 0.5 - Math.random());
  for (let i = 0; i < Math.min(itemCount, shuffled.length); i++) {
    const item = shuffled[i];
    const priceVariance = 0.95 + Math.random() * 0.1;
    const finalPrice = Number(item.price) * priceVariance;
    
    selectedItems.push({
      title: item.title,
      price: finalPrice,
      category: item.category
    });
    total += finalPrice;
  }

  // Generate purchase description
  let description = "";
  if (isCartPurchase) {
    const itemNames = selectedItems.map(item => item.title).join(", ");
    description = `Bought ${itemNames} for a total of $${total.toFixed(2)}`;
  } else {
    description = `Bought ${selectedItems[0].title} for $${selectedItems[0].price.toFixed(2)}`;
  }

  return {
    type: isCartPurchase ? "cart" : "single",
    items: selectedItems,
    total,
    description
  };
}

// ─── Review templates with more realistic sentiment ─────────────────────────

interface ReviewTemplate {
  rating: number;
  stars: string;
  comments: string[];
  scenarios: string[];
}

const REVIEW_TEMPLATES: ReviewTemplate[] = [
  {
    rating: 5,
    stars: "⭐⭐⭐⭐⭐",
    comments: [
      "Absolutely amazing! Got it instantly and it's working perfectly. Will definitely be back for more.",
      "This exceeded my expectations! Super fast delivery and the product works flawlessly. Highly recommend PIYROX.",
      "Perfect! Activated right away, no issues at all. Best service I've seen in a while.",
      "Wow, that was fast! Paid and had it in seconds. Already using it and it's great value.",
      "Legit and quick. I was worried at first but this is the real deal. Very satisfied with my purchase.",
      "Smooth transaction from start to finish. Product delivered instantly and works perfectly. 10/10!",
      "Outstanding service! Got it within seconds of paying. Already told my friends about this place.",
      "Impressive speed and quality. Exactly what I needed, no complications at all. Will order again.",
      "PIYROX never disappoints! Fast delivery and exactly what I ordered. Can't recommend them enough!",
      "Best purchase experience ever! Everything worked perfectly and the support was top-notch.",
    ],
    scenarios: [
      "Just got my order and everything is perfect! The activation was instant and everything works as expected.",
      "Wow, PIYROX really delivers! Got my stuff right away and it's working flawlessly.",
      "This is why I keep coming back! Fast, reliable, and exactly what I need every time.",
      "Seriously impressed with how quick this was. From payment to working product in minutes!",
      "PIYROX nailed it again! Perfect service and the products work exactly as advertised.",
    ]
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
      "Impressed with the speed and quality. PIYROX really delivers on their promises.",
      "Perfect! No waiting, no hassle. Exactly what I needed when I needed it.",
      "Can't believe how efficient this was! Ordered and had it working in no time flat.",
      "PIYROX is my go-to for a reason. Always fast, always reliable, always perfect.",
    ],
    scenarios: [
      "Just finished setting up everything and it's working perfectly! Thanks PIYROX!",
      "Got my order super fast and everything was exactly as described. Very happy!",
      "This was the smoothest transaction ever! From checkout to working in minutes.",
      "Impressed with the quality and speed. Will definitely be a repeat customer.",
      "PIYROX really knows how to do it right! Fast service and great products.",
    ]
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
      "The product works great, just took a bit longer than I expected to get everything activated.",
      "Overall satisfied with the purchase. The quality is good and the price is fair.",
    ],
    scenarios: [
      "Got everything working now! It took a bit longer than I hoped but everything is perfect.",
      "The order arrived and everything is working as expected. Just took some time to activate.",
      "Happy with the purchase, just wish it was a bit faster. But the quality makes up for it.",
      "Everything is working perfectly now, just took a little while to get sorted out.",
      "Good experience overall. The products are great, just the delivery could be faster.",
    ]
  },
  {
    rating: 4,
    stars: "⭐⭐⭐⭐",
    comments: [
      "Solid service. Took about 40 minutes to get my order but support was helpful. Works perfectly now.",
      "Not instant delivery but it came through and works well. Would still recommend PIYROX.",
      "Good product with reasonable delivery time. A bit slower than ideal but worth the wait.",
      "4 stars because of the delay, but the product quality is excellent. Support team was great.",
      "Decent overall experience. The wait was longer than I'd like but the end result is good.",
      "Product works as expected. Delivery took some time but it was worth it for the quality.",
      "Satisfied with the purchase. Just wish it was a bit faster, but no complaints about the product.",
      "Good service, just a bit slow on delivery. The product itself is top-notch though.",
      "The quality is excellent, just the delivery time could be improved. Still worth it though.",
      "Everything works perfectly, just took a bit longer to get activated than I expected.",
    ],
    scenarios: [
      "Got my order and everything is working! Just took a bit longer than I thought it would.",
      "The products are great quality, just wish they arrived a bit faster. Still happy though!",
      "Overall good experience. The wait was worth it for the quality I received.",
      "Everything is working as expected, just took some time to get everything activated.",
      "Satisfied with my purchase. The products are good, just delivery could be faster.",
    ]
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
      "The product works but the delivery was way too slow. Had to follow up multiple times.",
      "Not the best experience. The product works but the service needs improvement.",
    ],
    scenarios: [
      "Finally got everything working after a long wait. The product is okay but the service was slow.",
      "It works but took forever to get delivered. Not the best experience I've had.",
      "Average at best. The product works but the delivery time was unacceptable.",
      "Got my order eventually but it took way too long. The product itself is decent though.",
      "Not impressed with the delivery speed. The product works but I expected better service.",
    ]
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
      "The product is functional but the experience was frustrating. Too many delays.",
      "Not the worst but definitely not the best. The product works but the service needs work.",
    ],
    scenarios: [
      "Finally got my order after a long wait. The product works but the experience was frustrating.",
      "It took forever to get everything sorted. The product works but I'm not impressed.",
      "Average experience. The product works but the delivery was way too slow.",
      "Got what I paid for eventually, but the process was painful. Won't be in a hurry to return.",
      "The product is okay but the service needs serious improvement. Too many delays.",
    ]
  },
];

// ─── Build Discord embed for product review ─────────────────────────────────

function buildReviewEmbed(
  purchase: PurchaseScenario,
  customerName: string,
  template: ReviewTemplate,
  reviewTime: Date
) {
  // Color based on rating
  const colorMap: Record<number, number> = {
    5: 0x22c55e, // green
    4: 0x3b82f6, // blue
    3: 0xf59e0b, // amber
    2: 0xef4444, // red
    1: 0x6b7280, // gray
  };
  const color = colorMap[template.rating] ?? 0x22c55e;

  // Format items list
  const itemsList = purchase.items.map(item => `• ${item.title} - $${item.price.toFixed(2)}`).join('\n');
  
  // Generate random review time (between 1 hour and 7 days ago)
  const hoursAgo = randInt(1, 168); // 1 hour to 7 days
  const reviewTimeLabel = hoursAgo < 24 
    ? `${hoursAgo} hour${hoursAgo === 1 ? '' : 's'} ago`
    : `${Math.floor(hoursAgo / 24)} day${Math.floor(hoursAgo / 24) === 1 ? '' : 's'} ago`;

  return {
    color,
    author: {
      name: `${customerName} left a review`,
      icon_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(customerName)}&background=random&size=64`,
    },
    title: `📝 ${purchase.type === 'cart' ? 'Cart Purchase' : 'Product Review'}`,
    description: [
      `> **${customerName}** just reviewed their purchase`,
      `> **${purchase.description}**`,
      "",
      `**Their review:**`,
      `${template.stars}  Verified Purchase`,
      `*"${pick(template.comments)}"*`,
      "",
      `**Items purchased:**`,
      itemsList,
    ].join("\n"),
    fields: [
      { name: "Purchase Type", value: purchase.type === 'cart' ? 'Multiple Items' : 'Single Item', inline: true },
      { name: "Total Spent", value: `$${purchase.total.toFixed(2)}`, inline: true },
      { name: "Rating", value: `${template.stars} (${template.rating}/5)`, inline: true },
      { name: "Review Time", value: reviewTimeLabel, inline: true },
      {
        name: "Actions",
        value: "[View Product](https://piyrox.xyz) • [Contact Support](https://piyrox.xyz/support)",
      }
    ],
    footer: {
      text: `PIYROX • Customer Reviews • piyrox.xyz • Reviewed ${reviewTimeLabel}`,
    },
    timestamp: reviewTime.toISOString(), // Use actual review time
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

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://piyrox.xyz";

    // Generate purchase scenario
    const purchase = await generatePurchaseScenario();

    // Generate random customer name (70% boys, 30% girls)
    const customerName = Math.random() > 0.3 ? pick(BOY_NAMES) : pick(GIRL_NAMES);
    
    // Generate random review template
    const template = pick(REVIEW_TEMPLATES);

    // Generate random review time (between 1 hour and 7 days ago)
    const now = new Date();
    const reviewTime = new Date(now.getTime() - randInt(1, 168) * 60 * 60 * 1000);

    const embed = buildReviewEmbed(purchase, customerName, template, reviewTime);

    await sendDiscordNotification(webhookUrl, {
      username: "PIYROX Reviews",
      avatar_url: `${appUrl}/logo.png`, // Use PIYROX logo
      embeds: [embed],
    });

    return NextResponse.json({
      ok: true,
      purchase: purchase.description,
      customer: customerName,
      rating: template.rating,
      items: purchase.items.length,
      message: "Review posted successfully",
    });
  } catch (err) {
    console.error("[CRON product-review] Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}