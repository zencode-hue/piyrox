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
      includeImage = false,
      manualContent = null,
      manualImage = null
    } = body;

    // 1. Get Product Data
    let product;
    if (productId) {
      product = await db.product.findUnique({ where: { id: productId } });
    } else {
      const products = await db.product.findMany({ where: { isActive: true }, take: 20 });
      if (products.length > 0) {
        product = products[Math.floor(Math.random() * products.length)];
      }
    }

    if (!product) {
      return NextResponse.json({ error: "No products available to blast. Create a product first." }, { status: 404 });
    }

    // 2. Fetch Settings
    const settings = await db.siteSetting.findMany({
      where: { key: { in: ["ai_api_key", "zapier_webhook_url"] } }
    });
    const map: Record<string, string> = {};
    settings.forEach(s => map[s.key] = s.value);

    const apiKey = map["ai_api_key"];
    const zapierUrl = map["zapier_webhook_url"];
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://metramart.xyz";

    // Create a SocialBlast entry
    const blast = await db.socialBlast.create({
      data: {
        productId: product.id,
        productTitle: product.title,
        platforms,
        tone,
        length,
        status: "GENERATING",
        content: manualContent || {},
        imageUrl: manualImage,
      }
    });

    let finalAds: any = manualContent ? { ...manualContent } : {};
    let dallePrompt = "";

    // 3. Multi-Format AI Generation (if not manual)
    if (!manualContent) {
      if (!apiKey) {
        // Fallback if no API key
        finalAds = platforms.reduce((acc: any, p: string) => {
          acc[p] = `Check out our new ${product.title}! Only $${Number(product.price).toFixed(2)}. {{TRACKING_LINK}}`;
          return acc;
        }, {});
      } else {
        const platformPrompts = {
          twitter: "Short punchy tweet < 280 chars with emojis and trending hashtags",
          instagram: "Engaging story-style caption with emojis and hashtags",
          facebook: "Professional yet exciting long-form post with a clear Call to Action",
          discord: "Markdown formatted announcement with bold headers and bullet points",
          linkedin: "Professional, value-driven post focusing on benefits",
          telegram: "Short, direct broadcast message with emojis",
          pinterest: "Inspirational and descriptive pin caption with keywords and hashtags",
        };

        const requestedPlatforms = platforms.reduce((acc: any, p: string) => {
          if ((platformPrompts as any)[p]) acc[p] = (platformPrompts as any)[p];
          return acc;
        }, {});

        try {
          const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
              "HTTP-Referer": "https://metramart.xyz",
              "X-Title": "MetraMart Admin",
            },
            body: JSON.stringify({
              model: "openai/gpt-4o-mini",
              messages: [
                { role: "system", content: `You are the Metra AI Marketing Director. Tone: ${tone}. Length: ${length}. Generate JSON ads for: ${Object.keys(requestedPlatforms).join(", ")}. Include {{TRACKING_LINK}}.` },
                { role: "user", content: `Product: ${product.title}\nDescription: ${product.description}\nPrice: $${Number(product.price).toFixed(2)}` }
              ],
              temperature: 0.8,
              response_format: { type: "json_object" }
            }),
          });

          if (aiRes.ok) {
            const aiData = await aiRes.json();
            const ads = JSON.parse(aiData.choices?.[0]?.message?.content || "{}");
            dallePrompt = ads.dalle_prompt || "";
            // Merge generated ads
            for (const p of platforms) {
              if (ads[p]) finalAds[p] = ads[p];
            }
          } else {
            console.error("OpenRouter Error:", await aiRes.text());
            throw new Error("AI Service Unavailable");
          }
        } catch (e) {
          console.error("AI Generation Failed, using fallback:", e);
          platforms.forEach((p: string) => {
            if (!finalAds[p]) finalAds[p] = `Check out ${product.title}! Available now for $${Number(product.price).toFixed(2)}. {{TRACKING_LINK}}`;
          });
        }
      }
    }

    // 4. Inject Tracking Links
    const reqUrl = new URL(req.url);
    const origin = reqUrl.origin;
    for (const p of platforms) {
      if (finalAds[p]) {
        const trackingLink = `${origin}/api/social/click/${blast.id}/${p}`;
        finalAds[p] = finalAds[p].split("{{TRACKING_LINK}}").join(trackingLink);
        // If not present, append it
        if (!finalAds[p].includes(trackingLink)) {
          finalAds[p] += `\n\nLink: ${trackingLink}`;
        }
      }
    }

    // 5. Execution (Discord & Zapier)
    const secret = process.env.INTERNAL_BYPASS_KEY || "metramart-ai-secret-2024";
    const bypassHeaders = { 
      "Content-Type": "application/json",
      "X-Internal-AI-Bypass": secret 
    };
    const successDestinations = [];

    if (platforms.includes("discord") && finalAds.discord) {
      try {
        const dRes = await fetch(`${origin}/api/admin/discord-push`, {
          method: "POST",
          headers: bypassHeaders,
          body: JSON.stringify({ message: `🚀 **SOCIAL BLAST** 🚀\n\n${finalAds.discord}` }),
        });
        if (dRes.ok) successDestinations.push("Discord");
      } catch (err) {
        console.error("Discord Loopback Failed:", err);
      }
    }

    // 5b. Pinterest Direct Push (if token available)
    if (platforms.includes("pinterest") && finalAds.pinterest) {
      try {
        const pinterestRes = await fetch("https://api.pinterest.com/v5/pins", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.PINTEREST_ACCESS_TOKEN}`,
          },
          body: JSON.stringify({
            board_id: process.env.PINTEREST_BOARD_ID || "",
            note: finalAds.pinterest,
            link: finalAds.pinterest.includes("http") ? finalAds.pinterest : undefined,
          }),
        });
        if (pinterestRes.ok) successDestinations.push("Pinterest");
      } catch (err) {
        console.error("Pinterest Push Failed:", err);
      }
    }

    // 6. Finalize DB Entry
    await db.socialBlast.update({
      where: { id: blast.id },
      data: {
        status: "SENT",
        content: finalAds,
        imagePrompt: dallePrompt,
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
    console.error("[Social Blast Critical Error]:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Internal server error" 
    }, { status: 500 });
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
