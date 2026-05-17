import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { messages, productId } = await req.json().catch(() => ({}));

    // Fetch site settings for API key
    const keySetting = await db.siteSetting.findUnique({ where: { key: "ai_api_key" } });
    const apiKey = keySetting?.value;

    if (!apiKey) {
      return NextResponse.json({ reply: "Support is currently unavailable. Please contact us on Discord." });
    }

    // Fetch product context if on a product page
    let productContext = "";
    if (productId) {
      const product = await db.product.findUnique({
        where: { id: productId },
        include: { variants: { where: { isActive: true } } }
      });
      if (product) {
        productContext = `
CURRENT PRODUCT CONTEXT:
- Title: ${product.title}
- Price: $${Number(product.price).toFixed(2)}
- Category: ${product.category}
- Description: ${product.description}
- Variants: ${product.variants.map(v => `${v.name} ($${Number(v.price).toFixed(2)})`).join(", ")}
`;
      }
    }

    // Fetch all active products for a live catalog
    const allProducts = await db.product.findMany({
      where: { isActive: true },
      select: { title: true, price: true, category: true, stockCount: true, unlimitedStock: true },
      take: 50
    });

    const liveCatalog = allProducts.map(p => 
      `- ${p.title} (${p.category}): $${Number(p.price).toFixed(2)} [${p.unlimitedStock || p.stockCount > 0 ? "In Stock" : "Out of Stock"}]`
    ).join("\n");

    const BRAND_BIBLE = `
NAME: MetraMart
URL: https://metramart.xyz
LIVE CATALOG (REAL-TIME PRICES):
${liveCatalog}

CORE PROMISE: Instant delivery, 24/7 support, and the lowest market prices.
`;

    const systemPrompt = `You are the MetraMart AI Support Assistant.
${BRAND_BIBLE}
${productContext}

YOUR MISSION:
1. Help customers find the right digital product.
2. Answer questions about delivery (always mention it is INSTANT after payment).
3. Handle basic troubleshooting.
4. If a customer is undecided, recommend a popular product like Netflix or ChatGPT Plus.
5. Keep responses concise, friendly, and professional.
6. NEVER mention any other brands or competitors.
7. Use EMOJIS to make the chat friendly.
8. DO NOT use markdown like bold (**) or headers (#) in the final response. Use plain text and emojis.

MANDATORY: You are Metra AI, the official support for MetraMart.`;

    const modelsToTry = [
      "google/gemma-4-31b-it:free",
      "google/gemma-4-26b-a4b-it:free",
      "google/gemma-4-31b:free",
      "google/gemma-2-9b-it:free",
      "qwen/qwen-2.5-72b-instruct:free",
      "meta-llama/llama-3.1-8b-instruct:free"
    ];

    let reply = "";
    for (const m of modelsToTry) {
      try {
        const payload = {
          model: m,
          messages: [
            { role: "system", content: systemPrompt },
            ...messages
          ],
          temperature: 0.7,
          max_tokens: 500
        };

        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://metramart.xyz",
            "X-Title": "MetraMart Customer AI",
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errorText = await res.text();
          console.error(`[Customer AI] OpenRouter error for model ${m}: Status ${res.status} - ${errorText}`);
          continue;
        }

        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          reply = content;
          break;
        }
      } catch (err) {
        console.error(`[Customer AI] Exception during OpenRouter call for model ${m}:`, err);
        continue;
      }
    }

    if (!reply) {
      return NextResponse.json({ reply: "I'm having a bit of trouble connecting. Please try again in a moment! 🤖" });
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("[Customer AI Error]:", error);
    return NextResponse.json({ reply: "An error occurred. Please try again." }, { status: 500 });
  }
}
