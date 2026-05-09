import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { error: authError } = await requireAdminApi();
    if (authError) return authError;

    const body = await req.json().catch(() => ({}));
    const { 
      productId, 
      tone = "High-Energy & Professional", 
      length = "Medium", 
      platforms = ["twitter", "instagram", "facebook", "discord"],
      includeImage = false
    } = body;

    // 1. Get Product Data
    let product;
    if (productId) {
      product = await db.product.findUnique({ where: { id: productId } });
    } else {
      const products = await db.product.findMany({ where: { isActive: true }, take: 20 });
      product = products[Math.floor(Math.random() * products.length)];
    }

    if (!product) return NextResponse.json({ error: "No products available." }, { status: 404 });

    // 2. Fetch AI Key
    const settings = await db.siteSetting.findMany({
      where: { key: { in: ["ai_api_key", "zapier_webhook_url"] } }
    });
    const map: Record<string, string> = {};
    settings.forEach(s => map[s.key] = s.value);

    const apiKey = map["ai_api_key"];
    if (!apiKey) return NextResponse.json({ error: "AI Key missing." }, { status: 503 });

    const zapierUrl = map["zapier_webhook_url"];
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://metramart.xyz";

    // Create a SocialBlast entry to get an ID for tracking links
    const blast = await db.socialBlast.create({
      data: {
        productId: product.id,
        productTitle: product.title,
        platforms,
        tone,
        length,
        status: "GENERATING",
        content: {},
      }
    });

    // 3. Multi-Format AI Generation
    const platformPrompts = {
      twitter: "Short punchy tweet < 280 chars with emojis and trending hashtags",
      instagram: "Engaging story-style caption with emojis and hashtags",
      facebook: "Professional yet exciting long-form post with a clear Call to Action",
      discord: "Markdown formatted announcement with bold headers and bullet points",
      linkedin: "Professional, value-driven post focusing on benefits",
      telegram: "Short, direct broadcast message with emojis",
    };

    const requestedPlatforms = platforms.reduce((acc: any, p: string) => {
      if ((platformPrompts as any)[p]) acc[p] = (platformPrompts as any)[p];
      return acc;
    }, {});

    const systemPrompt = `You are the Metra AI Marketing Director. 
Tone: ${tone}. 
Content Length: ${length}.
Generate a multi-platform marketing blast for this product. 
${includeImage ? "Also generate a 'dalle_prompt' that would create a stunning high-converting social media image for this product." : ""}
Return a JSON object with keys for each platform: ${Object.keys(requestedPlatforms).join(", ")} ${includeImage ? "and 'dalle_prompt'" : ""}.
Ensure each platform's content is unique and optimized for that specific medium.
Include the tracking link: {{TRACKING_LINK}} in every post where appropriate.`;

    const userPrompt = `Product: ${product.title}\nDescription: ${product.description}\nCategory: ${product.category}\nPrice: $${Number(product.price).toFixed(2)}`;

    const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.8,
        response_format: { type: "json_object" }
      }),
    });

    const aiData = await aiRes.json();
    let ads: any = {};
    try {
      ads = JSON.parse(aiData.choices?.[0]?.message?.content || "{}");
    } catch (e) {
      console.error("AI JSON Parse Error:", e);
      ads = { twitter: "Check out " + product.title + "!" };
    }

    // 4. Inject Tracking Links & Clean up
    const origin = new URL(req.url).origin;
    const finalAds: any = {};
    
    for (const platform of platforms) {
      if (ads[platform]) {
        const trackingLink = `${origin}/api/social/click/${blast.id}/${platform}`;
        finalAds[platform] = ads[platform].replace("{{TRACKING_LINK}}", trackingLink);
        if (!finalAds[platform].includes(trackingLink)) {
          finalAds[platform] += `\n\nCheck it out: ${trackingLink}`;
        }
      }
    }

    // 5. Execution
    const bypassHeaders = { "X-Internal-AI-Bypass": process.env.INTERNAL_BYPASS_KEY || "metramart-ai-secret-2024" };
    const successDestinations = [];

    if (platforms.includes("discord") && finalAds.discord) {
      await fetch(`${origin}/api/admin/discord-push`, {
        method: "POST",
        headers: { ...bypassHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ message: `🚀 **SOCIAL BLAST** 🚀\n\n${finalAds.discord}` }),
      });
      successDestinations.push("Discord");
    }

    if (zapierUrl) {
      await fetch(zapierUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "social_blast",
          blastId: blast.id,
          product: product.title,
          price: Number(product.price).toFixed(2),
          url: `${appUrl}/checkout/confirm?productId=${product.id}`,
          ads: finalAds,
          imagePrompt: ads.dalle_prompt,
          timestamp: new Date().toISOString()
        }),
      }).catch(err => console.error("Zapier Push Failed:", err));
      successDestinations.push("Zapier (Meta/X/LinkedIn)");
    }

    // 6. Finalize DB Entry
    await db.socialBlast.update({
      where: { id: blast.id },
      data: {
        status: "SENT",
        content: finalAds,
        imagePrompt: ads.dalle_prompt,
      }
    });

    return NextResponse.json({ 
      ok: true, 
      id: blast.id,
      product: product.title,
      ads: finalAds,
      destinations: successDestinations
    });

  } catch (error) {
    console.error("[Social Blast Error]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { error: authError } = await requireAdminApi();
    if (authError) return authError;

    const blasts = await db.socialBlast.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { product: true }
    });

    return NextResponse.json(blasts);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
