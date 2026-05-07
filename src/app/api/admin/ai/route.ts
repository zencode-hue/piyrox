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

    // Fetch database stats to inject context
    const { db } = await import("@/lib/db");
    const [userCount, orderCount, pendingStock, activeProducts] = await Promise.all([
      db.user.count(),
      db.order.count(),
      db.order.count({ where: { status: "PENDING_STOCK" } }),
      db.product.count({ where: { isActive: true } }),
    ]);

    // Load full store context
    let storeContext = "";
    try {
      const fs = await import("fs");
      const path = await import("path");
      const contextPath = path.join(process.cwd(), "VELXO_DISCORD_BOT_CONTEXT.md");
      storeContext = fs.readFileSync(contextPath, "utf-8");
    } catch (e) {
      console.error("Could not load store context", e);
    }

    const systemPrompt = {
      role: "system",
      content: `You are VelxoBot, the AI assistant for MetraMart (velxo.shop).
      
DATABASE STATS:
- Total Users: ${userCount}
- Total Orders: ${orderCount}
- Pending Stock Orders: ${pendingStock} (need manual fulfillment)
- Active Products: ${activeProducts}

STORE CONTEXT & POLICIES:
${storeContext}

Your job is to help the admin manage the store, write copy, and answer questions. Use the stats and context above to perform tasks perfectly.`
    };

    const finalMessages = [systemPrompt, ...messages];

    const fallbackModels = [
      "google/gemini-2.0-flash-exp:free",
      "google/gemini-1.5-flash",
      "meta-llama/llama-3.3-70b-instruct:free",
      "mistralai/mistral-nemo-free"
    ];

    const targetModel = model || "google/gemini-2.0-flash-exp:free";

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: targetModel,
        models: fallbackModels, // OpenRouter fallback routing
        messages: finalMessages,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("[AI API] OpenRouter error:", errorText);
      return NextResponse.json({ error: "AI provider error" }, { status: 502 });
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content || "No response";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("[AI API] Internal error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}