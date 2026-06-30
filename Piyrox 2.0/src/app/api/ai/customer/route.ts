import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { messages, productId } = await req.json().catch(() => ({}));

    // Fetch site settings for API key, fall back to env var
    const keySetting = await db.siteSetting.findUnique({ where: { key: "ai_api_key" } });
    const apiKey = keySetting?.value || process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ reply: "Support is currently unavailable. Please contact us on Discord." });
    }

    // ── Full database pull: products with all variants ──────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allProducts = await (db.product.findMany as any)({
      where: { isActive: true },
      orderBy: { isFeatured: "desc" },
      take: 80,
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        category: true,
        imageUrl: true,
        isFeatured: true,
        unlimitedStock: true,
        stockCount: true,
        avgRating: true,
        variants: {
          where: { isActive: true },
          select: { name: true, price: true, unlimitedStock: true, stockCount: true },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    // Build a rich, fully-detailed catalog the AI can reason over
    const liveCatalog = allProducts.map((p: {
      id: string; title: string; description: string;
      price: { toString(): string }; category: string;
      isFeatured: boolean; unlimitedStock: boolean; stockCount: number;
      avgRating: { toString(): string };
      variants: { name: string; price: { toString(): string }; unlimitedStock: boolean; stockCount: number }[];
    }) => {
      const inStock = p.unlimitedStock || p.stockCount > 0;
      const stockLabel = inStock ? "In Stock" : "Out of Stock";
      const topLabel = p.isFeatured ? " ⭐ TOP PRODUCT" : "";
      const rating = Number(p.avgRating).toFixed(1);

      let line = `• [${p.category}]${topLabel} ${p.title} — Base Price: $${Number(p.price).toFixed(2)} | Rating: ${rating}★ | ${stockLabel}`;

      if (p.variants.length > 0) {
        const variantList = p.variants.map((v) => {
          const vs = v.unlimitedStock || v.stockCount > 0 ? "✅" : "❌";
          return `${v.name}: $${Number(v.price).toFixed(2)} ${vs}`;
        }).join(" | ");
        line += `\n  Variants: ${variantList}`;
      }

      if (p.description) {
        line += `\n  About: ${p.description.slice(0, 120)}${p.description.length > 120 ? "…" : ""}`;
      }

      return line;
    }).join("\n\n");

    // ── Product page context (when user is on a product page) ───────────────
    let productContext = "";
    if (productId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const product = await (db.product.findUnique as any)({
        where: { id: productId },
        include: {
          variants: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
          reviews: { take: 3, orderBy: { createdAt: "desc" }, select: { rating: true, comment: true } },
        },
      });
      if (product) {
        const variantDetails = product.variants.map((v: { name: string; price: { toString(): string }; unlimitedStock: boolean; stockCount: number }) =>
          `${v.name}: $${Number(v.price).toFixed(2)} [${v.unlimitedStock || v.stockCount > 0 ? "In Stock" : "Out of Stock"}]`
        ).join(", ");

        const recentReviews = product.reviews.map((r: { rating: number; comment?: string }) =>
          `"${r.comment || "No comment"}" (${r.rating}★)`
        ).join(" | ");

        productContext = `

PRODUCT THE USER IS CURRENTLY VIEWING:
  Name: ${product.title}
  Base Price: $${Number(product.price).toFixed(2)}
  Category: ${product.category}
  Description: ${product.description}
  In Stock: ${product.unlimitedStock || product.stockCount > 0 ? "Yes" : "No"}
  Rating: ${Number(product.avgRating).toFixed(1)}★
  Variants: ${variantDetails || "None — single product"}
  Recent Reviews: ${recentReviews || "No reviews yet"}

Since the user is already on this product page, guide them towards purchasing this specific product. Mention the variants and their prices clearly.`;
      }
    }

    // ── Full PIYROX knowledge base ─────────────────────────────────────────
    const systemPrompt = `You are PiyRox AI — the official smart Personal Shopper and Support Assistant for PIYROX.

═══ ABOUT PIYROX ═══
PIYROX (piyrox.sbs) is a premium digital marketplace offering the best deals on digital subscriptions and tools.
We specialise in: Streaming services, AI Tools, Gaming products, and Software licences.
Our promise: Instant automated delivery after payment. No waiting. No manual steps.
Payment methods accepted: Crypto (Bitcoin, Ethereum, USDT, 100+ coins via Paymento), Binance Gift Cards, Wallet Balance.
Support: Discord community + 24/7 ticket support. Always respond within minutes.
Replacement Guarantee: Every product verified. If anything goes wrong, we replace it — no questions asked.
Why cheaper?: We source subscriptions in bulk and pass the savings to customers. All products are legitimate & functional.

═══ CATEGORIES WE SELL ═══
1. STREAMING — Netflix, Spotify, Prime Video, Disney+, IPTV and more
2. AI_TOOLS — ChatGPT Plus, Midjourney, Claude, Notion AI, Canva Pro and more
3. GAMING — Game keys, PSN credits, Xbox Game Pass, Steam gift cards and more
4. SOFTWARE — Microsoft Office, Adobe CC, Antivirus, VPN licences and more

═══ HOW IT WORKS ═══
Step 1: Customer browses the store and picks a product (and variant if available)
Step 2: Customer pays securely via crypto or Binance gift card
Step 3: Credentials/keys are INSTANTLY emailed to the customer — fully automated

═══ LIVE PRODUCT CATALOG (fetched live from database) ═══
${liveCatalog}
${productContext}

═══ YOUR ROLE & RULES ═══
1. GREET: If the user just says "hi" or "hello", warmly greet them and ask what they're looking for today 🛍️
2. CLARIFY: If the request is vague (e.g. "I need streaming"), ask clarifying questions — "Are you looking for movies, TV shows, or music?"
3. RECOMMEND: Always name specific products from the catalog above with their EXACT prices (including variant prices). Never make up prices.
4. VARIANTS: If a product has variants (e.g. 1 Month, 1 Year, Individual, Family), list all variant options with their prices when recommending.
5. STOCK: Only recommend products that are "In Stock" or "✅". If out of stock, apologise and suggest an alternative.
6. CLOSE: Guide the user to checkout. Remind them delivery is INSTANT after payment. 🚀
7. SUPPORT: Handle questions about delivery times, payment methods, replacements, and account issues.
8. TONE: Be concise, enthusiastic, persuasive, and helpful. Use emojis generously! 🎉
9. NEVER: Mention competitor platforms. Never make up product details, prices, or availability.
10. FORMAT: Plain text + emojis only. NO markdown bold (**), NO headers (#). Keep replies short and punchy.

MANDATORY IDENTITY: You are PiyRox AI, the official assistant for PIYROX at piyrox.sbs.`;

    // ── Model list: poolside/laguna-m.1:free first, then fallbacks ─────────
    const modelsToTry = [
      "poolside/laguna-m.1:free",
      "google/gemma-4-31b-it:free",
      "qwen/qwen-2.5-72b-instruct:free",
      "meta-llama/llama-3.3-70b-instruct:free",
      "google/gemma-2-9b-it:free",
      "mistralai/mistral-7b-instruct:free",
      "deepseek/deepseek-chat:free",
    ];

    let reply = "";
    for (const m of modelsToTry) {
      try {
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://piyrox.sbs",
            "X-Title": "PIYROX Customer AI",
          },
          body: JSON.stringify({
            model: m,
            messages: [
              { role: "system", content: systemPrompt },
              ...(messages || []),
            ],
            temperature: 0.65,
            max_tokens: 600,
          }),
        });

        const rawText = await res.text();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let data: any;
        try { data = JSON.parse(rawText); } catch { continue; }

        if (data?.error) {
          const errMsg = data.error?.message || "";
          console.error(`[Customer AI] ${m} error: ${errMsg}`);
          if (errMsg.toLowerCase().includes("provider") || errMsg.toLowerCase().includes("rate")) {
            await new Promise((r) => setTimeout(r, 500));
          }
          continue;
        }

        if (!res.ok) { continue; }

        const content = data?.choices?.[0]?.message?.content;
        if (content && typeof content === "string" && content.trim()) {
          reply = content;
          break;
        }
      } catch (err) {
        console.error(`[Customer AI] Exception for model ${m}:`, err);
        continue;
      }
    }

    if (!reply) {
      return NextResponse.json({ reply: "I'm having a bit of trouble connecting right now. Please try again or reach us on Discord! 💬" });
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("[Customer AI Error]:", error);
    return NextResponse.json({ reply: "An error occurred. Please try again." }, { status: 500 });
  }
}
