import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages, model, apiKey } = await req.json();

    if (!apiKey) {
      return NextResponse.json({ error: "API key is required" }, { status: 400 });
    }

    // Fetch live database stats
    const { db } = await import("@/lib/db");
    const [userCount, orderCount, pendingStock, activeProducts] = await Promise.all([
      db.user.count(),
      db.order.count(),
      db.order.count({ where: { status: "PENDING_STOCK" } }),
      db.product.count({ where: { isActive: true } }),
    ]);

    // Load store context, truncated to ~3000 chars to avoid token limits
    let storeContext = "MetraMart - Digital marketplace for streaming, AI tools, software and gaming.";
    try {
      const fs = await import("fs");
      const path = await import("path");
      const contextPath = path.join(process.cwd(), "VELXO_DISCORD_BOT_CONTEXT.md");
      const raw = fs.readFileSync(contextPath, "utf-8");
      storeContext = raw.slice(0, 3000) + (raw.length > 3000 ? "\n...(truncated)" : "");
    } catch { /* context file unavailable - use default */ }

    const systemPrompt = {
      role: "system",
      content: `You are VelxoBot, the AI assistant for MetraMart (velxo.shop).
MetraMart is a digital marketplace for streaming, AI tools, software and gaming.

LIVE DATABASE STATS:
- Total Users: ${userCount}
- Total Orders: ${orderCount}
- Pending Stock Orders: ${pendingStock}
- Active Products: ${activeProducts}

STORE CONTEXT:
${storeContext}

Help the admin manage the store, write product copy, answer questions, and perform tasks using the above data.`,
    };

    const finalMessages = [systemPrompt, ...messages];

    // Free model fallback chain — ordered by quality/reliability on OpenRouter
    const FREE_FALLBACKS = [
      "meta-llama/llama-3.3-70b-instruct:free",
      "qwen/qwen-2.5-72b-instruct:free",
      "mistralai/mistral-nemo:free",
      "google/gemini-2.0-flash-lite-001",
    ];

    const selectedModel = model || FREE_FALLBACKS[0];
    const isFreeTier = selectedModel.endsWith(":free");

    const payload: Record<string, unknown> = { messages: finalMessages };

    if (isFreeTier) {
      // Build fallback list: primary first, then remaining free models (deduped)
      const fallbackList = [
        selectedModel,
        ...FREE_FALLBACKS.filter((m) => m !== selectedModel),
      ].slice(0, 4);
      payload.models = fallbackList;
      payload.route = "fallback";
    } else {
      payload.model = selectedModel;
    }

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://metramart.xyz",
        "X-Title": "MetraMart Admin AI",
      },
      body: JSON.stringify(payload),
    });

    const responseText = await res.text();

    if (!res.ok) {
      console.error("[AI API] OpenRouter error:", responseText);
      let msg = "AI request failed";
      try {
        const parsed = JSON.parse(responseText);
        msg = parsed?.error?.message ?? String(parsed?.error) ?? msg;
      } catch { /* not JSON */ }
      return NextResponse.json({ error: msg }, { status: 502 });
    }

    let data: { choices?: { message?: { content?: string } }[] };
    try {
      data = JSON.parse(responseText);
    } catch {
      return NextResponse.json({ error: "Invalid response from AI provider" }, { status: 502 });
    }

    const reply = data.choices?.[0]?.message?.content || "No response";
    return NextResponse.json({ reply });

  } catch (error) {
    console.error("[AI API] Internal error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}