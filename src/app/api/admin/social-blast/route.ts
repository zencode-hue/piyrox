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
      where: { key: { in: [
        "ai_api_key", 
        "zapier_webhook_url", 
        "telegram_bot_token", 
        "telegram_chat_id",
        "marketing_webhook_url",
        "pinterest_access_token",
        "pinterest_board_id"
      ] } }
    });
    const map: Record<string, string> = {};
    settings.forEach(s => map[s.key] = s.value);

    const apiKey = map["ai_api_key"];
    const zapierUrl = map["zapier_webhook_url"];
    const tgToken = map["telegram_bot_token"];
    const tgChatId = map["telegram_chat_id"];
    const genericWebhook = map["marketing_webhook_url"];
    const pinToken = map["pinterest_access_token"];
    const pinBoardId = map["pinterest_board_id"];
    
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

          let success = false;
          for (const m of modelsToTry) {
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
                  model: m,
                  messages: [
                    { role: "system", content: `You are the Metra AI Marketing Director. Tone: ${tone}. Length: ${length}. Generate JSON ads for: ${Object.keys(requestedPlatforms).join(", ")}. Include {{TRACKING_LINK}}.` },
                    { role: "user", content: `Product: ${product.title}\nDescription: ${product.description}\nPrice: $${Number(product.price).toFixed(2)}` }
                  ],
                  temperature: 0.8,
                  response_format: { type: "json_object" }
                }),
              });

              const rawText = await aiRes.text();
              let aiData: any;
              try { aiData = JSON.parse(rawText); } catch { continue; }

              // Handle error in body (even on 200 OK)
              if (aiData?.error) {
                const errMsg = aiData.error?.message || "";
                console.error(`[Social Blast] ${m} error in body: ${errMsg}`);
                if (errMsg.toLowerCase().includes("provider") || errMsg.toLowerCase().includes("rate")) {
                  await new Promise((r) => setTimeout(r, 800));
                }
                continue;
              }

              if (!aiRes.ok) {
                console.error(`[Social Blast] ${m} HTTP ${aiRes.status}: ${rawText.slice(0, 200)}`);
                continue;
              }

              const content = aiData?.choices?.[0]?.message?.content;
              if (content && typeof content === "string" && content.trim()) {
                const ads = JSON.parse(content || "{}");
                dallePrompt = ads.dalle_prompt || "";
                for (const p of platforms) {
                  if (ads[p]) finalAds[p] = ads[p];
                }
                success = true;
                break;
              }
            } catch (err) {
              console.error(`[Social Blast] Exception for model ${m}:`, err);
            }
          }

          if (!success) {
            throw new Error("AI Service Unavailable on all fallback models");
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

    // 5. Execution (Multi-Platform)
    const secret = process.env.INTERNAL_BYPASS_KEY || "metramart-ai-secret-2024";
    const bypassHeaders = { 
      "Content-Type": "application/json",
      "X-Internal-AI-Bypass": secret 
    };
    const successDestinations = [];

    // Discord Push
    if (platforms.includes("discord") && finalAds.discord) {
      try {
        const dRes = await fetch(`${origin}/api/admin/discord-push`, {
          method: "POST",
          headers: bypassHeaders,
          body: JSON.stringify({ message: `🚀 **SOCIAL BLAST** 🚀\n\n${finalAds.discord}` }),
        });
        if (dRes.ok) successDestinations.push("Discord");
      } catch (err) {
        console.error("Discord Push Failed:", err);
      }
    }

    // Telegram Push
    if (platforms.includes("telegram") && finalAds.telegram && tgToken && tgChatId) {
      try {
        const { sendToTelegram } = await import("@/lib/social");
        const ok = await sendToTelegram(tgToken, tgChatId, `🚀 *SOCIAL BLAST* 🚀\n\n${finalAds.telegram}`);
        if (ok) successDestinations.push("Telegram");
      } catch (err) {
        console.error("Telegram Push Failed:", err);
      }
    }

    // Pinterest Push
    if (platforms.includes("pinterest") && finalAds.pinterest && pinToken && pinBoardId) {
      try {
        const pRes = await fetch("https://api.pinterest.com/v5/pins", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${pinToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            board_id: pinBoardId,
            title: product.title,
            description: finalAds.pinterest,
            link: `${origin}/api/social/click/${blast.id}/pinterest`,
            media_source: {
              source_type: "image_url",
              url: product.imageUrl || "https://metramart.xyz/logo.png",
            },
          }),
        });
        if (pRes.ok) successDestinations.push("Pinterest");
      } catch (err) {
        console.error("Pinterest Push Failed:", err);
      }
    }

    // Webhook / Zapier Push
    const webhookUrl = genericWebhook || zapierUrl;
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "social_blast",
            blastId: blast.id,
            product: product.title,
            price: Number(product.price).toFixed(2),
            url: `${appUrl}/checkout/confirm?productId=${product.id}`,
            ads: finalAds,
            imagePrompt: dallePrompt,
            manualImage: manualImage,
            timestamp: new Date().toISOString()
          }),
        });
        successDestinations.push(genericWebhook ? "Webhook" : "Zapier");
      } catch (err) {
        console.error("Webhook Push Failed:", err);
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
