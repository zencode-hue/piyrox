import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { error: authError } = await requireAdminApi();
    if (authError) return authError;

    const { productId } = await req.json().catch(() => ({}));

    // 1. Get Product Data
    let product;
    if (productId) {
      product = await db.product.findUnique({ where: { id: productId } });
    } else {
      const products = await db.product.findMany({ where: { isActive: true }, take: 20 });
      product = products[Math.floor(Math.random() * products.length)];
    }

    if (!product) return NextResponse.json({ error: "No products available." }, { status: 404 });

    // 2. Fetch AI Key & Brand Tone
    const settings = await db.siteSetting.findMany({
      where: { key: { in: ["ai_api_key", "marketing_brand_tone", "zapier_webhook_url"] } }
    });
    const map: Record<string, string> = {};
    settings.forEach(s => map[s.key] = s.value);

    const apiKey = map["ai_api_key"];
    if (!apiKey) return NextResponse.json({ error: "AI Key missing." }, { status: 503 });

    const tone = map["marketing_brand_tone"] || "High-Energy & Professional";
    const zapierUrl = map["zapier_webhook_url"];

    // 3. Multi-Format AI Generation
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://metramart.xyz";
    const systemPrompt = `You are the Metra AI Marketing Director. Tone: ${tone}.
Generate a multi-platform marketing blast for this product.
Return a JSON object exactly like this:
{
  "twitter": "Short punchy tweet < 280 chars with emojis",
  "instagram": "Engaging story-style caption with hashtags",
  "facebook": "Professional yet exciting long-form post",
  "discord": "Markdown formatted announcement with bold headers"
}`;

    const userPrompt = `Product: ${product.title}\nCategory: ${product.category}\nPrice: $${Number(product.price).toFixed(2)}\nURL: ${appUrl}/checkout/confirm?productId=${product.id}`;

    const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b:free",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.85,
        response_format: { type: "json_object" }
      }),
    });

    const aiData = await aiRes.json();
    let ads: any;
    try {
      ads = JSON.parse(aiData.choices?.[0]?.message?.content || "{}");
    } catch (e) {
      // Fallback if AI didn't return perfect JSON
      const fallback = aiData.choices?.[0]?.message?.content || "Check out our latest deals!";
      ads = { twitter: fallback, instagram: fallback, facebook: fallback, discord: fallback };
    }

    // 4. Multi-Platform Execution
    const origin = new URL(req.url).origin;
    const bypassHeaders = { "X-Internal-AI-Bypass": process.env.INTERNAL_BYPASS_KEY || "metramart-ai-secret-2024" };

    // A. Discord Push
    const discordRes = await fetch(`${origin}/api/admin/discord-push`, {
      method: "POST",
      headers: { ...bypassHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ message: `🚀 **MULTI-PLATFORM BLAST** 🚀\n\n${ads.discord}` }),
    });

    // B. Zapier Push (The Bridge to Twitter/Meta/etc.)
    if (zapierUrl) {
      await fetch(zapierUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "social_blast",
          product: product.title,
          price: Number(product.price).toFixed(2),
          url: `${appUrl}/checkout/confirm?productId=${product.id}`,
          ads: ads,
          timestamp: new Date().toISOString()
        }),
      }).catch(err => console.error("Zapier Push Failed:", err));
    }

    // 5. Persistent Logging
    try {
      const logsSetting = await db.siteSetting.findUnique({ where: { key: "social_blast_logs" } });
      let logs = logsSetting ? JSON.parse(logsSetting.value) : [];
      if (!Array.isArray(logs)) logs = [];
      
      logs.unshift({
        id: Math.random().toString(36).substring(7),
        product: product.title,
        ads: ads, // Save all versions
        status: "SUCCESS",
        destinations: ["Discord", zapierUrl ? "Zapier (Meta/X/LinkedIn)" : ""].filter(Boolean),
        source: productId ? "MANUAL" : "AUTO",
        createdAt: new Date().toISOString()
      });

      logs = logs.slice(0, 50);
      await db.siteSetting.upsert({
        where: { key: "social_blast_logs" },
        update: { value: JSON.stringify(logs) },
        create: { key: "social_blast_logs", value: JSON.stringify(logs) }
      });
    } catch (e) {
      console.error("[Logging Error]:", e);
    }

    return NextResponse.json({ 
      ok: true, 
      product: product.title,
      ads: ads,
      destinations: ["Discord", zapierUrl ? "Zapier" : ""]
    });

  } catch (error) {
    console.error("[Social Blast Error]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
