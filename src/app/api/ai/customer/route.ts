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
- Variants: ${product.variants.map((v: any) => `${v.name} ($${Number(v.price).toFixed(2)})`).join(", ")}
`;
      }
    }

    // Fetch all active products for a live catalog
    const allProducts = await db.product.findMany({
      where: { isActive: true },
      select: { title: true, price: true, category: true, stockCount: true, unlimitedStock: true },
      take: 50
    });

    const liveCatalog = allProducts.map((p: any) =>
      `- ${p.title} (${p.category}): $${Number(p.price).toFixed(2)} [${p.unlimitedStock || p.stockCount > 0 ? "In Stock" : "Out of Stock"}]`
    ).join("\n");

    const systemPrompt = `You are the MetraMart AI Support Assistant.

NAME: MetraMart | URL: https://metramart.xyz
LIVE CATALOG:
${liveCatalog}
${productContext}

YOUR MISSION:
1. Help customers find the right digital product.
2. Answer questions about delivery (always: INSTANT after payment).
3. Handle basic troubleshooting.
4. If undecided, recommend Netflix or ChatGPT Plus.
5. Keep responses concise, friendly, and professional.
6. NEVER mention competitors.
7. Use EMOJIS to make the chat friendly.
8. NO markdown bold (**) or headers (#). Plain text and emojis only.

MANDATORY: You are Metra AI, the official support for MetraMart.`;

    // openrouter/auto first — lets OpenRouter pick the best available free model automatically
    const modelsToTry = [
      "openrouter/auto",
      "google/gemma-4-31b-it:free",
      "google/gemma-4-26b-a4b-it:free",
      "google/gemma-4-31b:free",
      "google/gemma-2-9b-it:free",
      "qwen/qwen-2.5-72b-instruct:free",
      "meta-llama/llama-3.3-70b-instruct:free",
      "mistralai/mistral-7b-instruct:free",
      "deepseek/deepseek-chat:free",
      "openrouter/free"
    ];

    let reply = "";
    for (const m of modelsToTry) {
      try {
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://metramart.xyz",
            "X-Title": "MetraMart Customer AI",
          },
          body: JSON.stringify({
            model: m,
            messages: [
              { role: "system", content: systemPrompt },
              ...messages
            ],
            temperature: 0.7,
            max_tokens: 500
          }),
        });

        const rawText = await res.text();
        let data: any;
        try { data = JSON.parse(rawText); } catch { continue; }

        // Handle error embedded in body (even on 200 OK responses)
        if (data?.error) {
          const errMsg = data.error?.message || "";
          console.error(`[Customer AI] ${m} error in body: ${errMsg}`);
          if (errMsg.toLowerCase().includes("provider") || errMsg.toLowerCase().includes("rate")) {
            await new Promise((r) => setTimeout(r, 600));
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
      return NextResponse.json({ reply: "I'm having a bit of trouble connecting. Please try again in a moment! 🤖" });
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("[Customer AI Error]:", error);
    return NextResponse.json({ reply: "An error occurred. Please try again." }, { status: 500 });
  }
}
