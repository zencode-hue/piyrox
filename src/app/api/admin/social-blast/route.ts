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
      // Pick a random active product
      const products = await db.product.findMany({ where: { isActive: true }, take: 20 });
      product = products[Math.floor(Math.random() * products.length)];
    }

    if (!product) return NextResponse.json({ error: "No products available for advertising." }, { status: 404 });

    // 2. Fetch AI API Key
    const keySetting = await db.siteSetting.findUnique({ where: { key: "ai_api_key" } });
    const apiKey = keySetting?.value;
    if (!apiKey) return NextResponse.json({ error: "AI API Key missing." }, { status: 503 });

    // 3. Ask AI to write a Social Media Ad
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://metramart.xyz";
    const systemPrompt = `You are the Metra AI Social Media Manager. Write a punchy, high-energy advertisement for a digital product. Use EMOJIS. Keep it under 280 characters for Twitter. Include the link.`;
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
        temperature: 0.9,
      }),
    });

    const aiData = await aiRes.json();
    const adText = aiData.choices?.[0]?.message?.content || `🔥 Check out our latest ${product.title}! Only $${Number(product.price).toFixed(2)} at ${appUrl}/checkout/confirm?productId=${product.id}`;

    // 4. Push to Discord (Simulating Social Blast)
    const bypassHeaders = { "X-Internal-AI-Bypass": process.env.INTERNAL_BYPASS_KEY || "metramart-ai-secret-2024" };
    const origin = new URL(req.url).origin;

    const discordRes = await fetch(`${origin}/api/admin/discord-push`, {
      method: "POST",
      headers: { ...bypassHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ message: `🚀 **SOCIAL MEDIA BLAST** 🚀\n\n${adText}` }),
    });

    if (!discordRes.ok) {
      const dErr = await discordRes.json();
      return NextResponse.json({ error: `AI generated ad, but Discord push failed: ${dErr.error}` }, { status: 500 });
    }

    // 5. Log the Blast to SiteSettings
    try {
      const logsSetting = await db.siteSetting.findUnique({ where: { key: "social_blast_logs" } });
      let logs = logsSetting ? JSON.parse(logsSetting.value) : [];
      if (!Array.isArray(logs)) logs = [];
      
      logs.unshift({
        id: Math.random().toString(36).substring(7),
        product: product.title,
        ad: adText,
        status: "SUCCESS",
        source: productId ? "MANUAL" : "AUTO",
        createdAt: new Date().toISOString()
      });

      // Keep only last 50
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
      message: "Social media advertisement generated and blasted successfully!",
      product: product.title,
      ad: adText
    });

  } catch (error) {
    console.error("[Social Blast Error]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
