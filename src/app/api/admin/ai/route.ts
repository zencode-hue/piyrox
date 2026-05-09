import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

async function executeTool(tool: { action: string; params: any }, origin: string, bypassHeaders: Record<string, string>) {
  try {
    switch (tool.action) {
      case "create_blog_post": {
        const params = { ...tool.params };
        if (!params.slug && params.title) {
          params.slug = params.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
        }
        const res = await fetch(`${origin}/api/admin/blog`, {
          method: "POST",
          headers: bypassHeaders,
          body: JSON.stringify(params),
        });
        const data = await res.json();
        if (!res.ok) return `❌ Blog creation failed: ${data.error ?? "Unknown error"}`;
        return `✅ Blog post created: ${params.title} (Slug: ${data.slug || params.slug})`;
      }

      case "push_discord_deals": {
        const res = await fetch(`${origin}/api/admin/discord-push`, {
          method: "POST",
          headers: bypassHeaders,
          body: JSON.stringify({ type: "deals" }),
        });
        const data = await res.json();
        if (!res.ok) return `❌ Discord deals failed: ${data.error ?? "Unknown error"}`;
        return `✅ Today's deals pushed to Discord!`;
      }

      case "send_discord_message": {
        const res = await fetch(`${origin}/api/admin/discord-push`, {
          method: "POST",
          headers: bypassHeaders,
          body: JSON.stringify({ message: tool.params.message }),
        });
        const data = await res.json();
        if (!res.ok) return `❌ Discord message failed: ${data.error ?? "Unknown error"}`;
        return `✅ Discord announcement sent!`;
      }

      case "send_email": {
        const res = await fetch(`${origin}/api/admin/send-email`, {
          method: "POST",
          headers: bypassHeaders,
          body: JSON.stringify({
            to: tool.params.audience || "all",
            subject: tool.params.subject || "MetraMart Announcement",
            message: tool.params.message || "Please check your dashboard for the latest updates.",
            type: tool.params.type || "announcement",
            customEmail: tool.params.customEmail,
            preview: tool.params.preview ?? false,
          }),
        });
        const data = await res.json();
        if (!res.ok) return `❌ Email failed: ${data.error ?? "Unknown error"}`;
        if (data.preview) return `📊 Preview: would send to ${data.count} recipients.`;
        return `✅ Email sent to ${data.sent} recipients! (${data.failed || 0} failed)`;
      }

      case "run_db_query": {
        try {
          const { model, action, args } = tool.params;
          const { db: prisma } = await import("@/lib/db");
          const dbModel = (prisma as any)[model];
          if (!dbModel || typeof dbModel[action] !== "function") return `❌ Invalid model/action: ${model}.${action}`;
          const result = await dbModel[action](args);
          return `✅ Success: ${JSON.stringify(result, null, 2).substring(0, 1500)}`;
        } catch (err) { return `❌ DB Error: ${String(err)}`; }
      }

      case "update_inventory_count": {
        try {
          const { productId, count } = tool.params;
          const updated = await db.product.update({
            where: { id: productId },
            data: { stockCount: count }
          });
          return `✅ Inventory updated for ${updated.title}: ${count} items.`;
        } catch (err) { return `❌ Inventory Error: ${String(err)}`; }
      }

      default:
        return `❌ Unknown action: ${tool.action}`;
    }
  } catch (err) {
    return `❌ Tool execution error: ${String(err)}`;
  }
}

const TOOL_DEFINITIONS = `
Available Tools (USE JSON FORMAT):
1. { "action": "create_blog_post", "params": { "title": "str", "excerpt": "str", "content": "html", "category": "str", "emoji": "str", "published": true } }
2. { "action": "push_discord_deals", "params": {} }
3. { "action": "send_discord_message", "params": { "message": "str" } }
4. { "action": "send_email", "params": { "audience": "all|customers|guests|custom", "subject": "str", "message": "str", "customEmail": "str|array" } }
5. { "action": "run_db_query", "params": { "model": "user|product|order|blogPost", "action": "count|findMany|findUnique", "args": {} } }
6. { "action": "update_inventory_count", "params": { "productId": "str", "count": 10 } }
`;

export async function POST(req: NextRequest) {
  try {
    const { error: authError } = await requireAdminApi();
    if (authError) return authError;

    const { messages, context, model: selectedModelName } = await req.json();
    let selectedModel = selectedModelName || "auto";
    const origin = new URL(req.url).origin;
    const bypassHeaders = { "X-Internal-AI-Bypass": process.env.INTERNAL_BYPASS_KEY || "metramart-ai-secret-2024" };

    const keySetting = await db.siteSetting.findUnique({ where: { key: "ai_api_key" } });
    const apiKey = keySetting?.value;
    if (!apiKey) return NextResponse.json({ error: "No AI API Key configured." }, { status: 400 });

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [
      userCount, orderCount, lowStockCount, activeProducts, 
      revenueTotal, revenue24h, recentOrders, topProducts,
      lowStockItems, topCustomers
    ] = await Promise.all([
      db.user.count(),
      db.order.count(),
      db.product.count({ where: { stockCount: { lte: 5 } } }),
      db.product.count({ where: { isActive: true } }),
      db.order.aggregate({ _sum: { amount: true }, where: { status: "PAID" } }),
      db.order.aggregate({ _sum: { amount: true }, where: { status: "PAID", createdAt: { gte: twentyFourHoursAgo } } }),
      db.order.findMany({ take: 10, orderBy: { createdAt: "desc" }, include: { user: true } }),
      db.product.findMany({ take: 8, where: { isActive: true }, orderBy: { orders: { _count: "desc" } } }),
      db.product.findMany({ where: { stockCount: { lte: 5 }, isActive: true }, select: { title: true, stockCount: true, id: true } }),
      db.user.findMany({ take: 5, orderBy: { orders: { _count: "desc" } }, select: { email: true, name: true } })
    ]);

    const totalRev = Number(revenueTotal._sum?.amount ?? 0).toFixed(2);
    const rev24h = Number(revenue24h._sum?.amount ?? 0).toFixed(2);
    
    const BRAND_BIBLE = `
NAME: MetraMart
IDENTITY: World's #1 Premium Digital Marketplace.
BRAIN: Metra AI (Total Control Administrative Interface).
INVENTORY: Streaming (Netflix, Spotify, YT Premium), AI Tools (ChatGPT Plus, Midjourney), Software (Windows, Adobe), Gaming (Xbox Game Pass).
RULES: 
1. Identify yourself in brackets at the start.
2. If orchestrationMode="task", use TOOLS for ANY execution.
3. If orchestrationMode="marketing", follow STRICT_CLEAN_TEXT.
`;

    const SPECIALIZED_PROMPTS: Record<string, string> = {
      seo: `[Metra AI - SEO Specialist (OWL)] You are a Page 1 ranking expert. Analyze keywords and suggest metadata improvements for top visibility.`,
      marketing: `[Metra AI - Marketing Specialist (GPT)] You are a world-class CMO. Write high-conversion, emoji-rich copy. NO bold or headers.`,
      strategy: `[Metra AI - Strategy Thinker (Qwen)] You are a business growth analyst. Use data to suggest monetization improvements and churn reduction.`,
      task: `[Metra AI - Task Engine (Ring)] YOU ARE THE EXECUTOR. Trigger Discord, Email, and DB actions using TOOLS. Confirm every operation.`,
      general: `[Metra AI - General (Nemotron)] Total administrative support. Guide the admin through MetraMart operations.`,
    };

    let orchestrationMode = context || "auto";
    if (orchestrationMode === "auto") {
      const lastMsg = (messages[messages.length - 1]?.content || "").toLowerCase();
      if (/seo|keyword|meta|rank|optimize/.test(lastMsg)) orchestrationMode = "seo";
      else if (/campaign|social|post|market|facebook|ig|ads|copy|newsletter/.test(lastMsg)) orchestrationMode = "marketing";
      else if (/strategy|plan|growth|revenue|monetize|profit/.test(lastMsg)) orchestrationMode = "strategy";
      else if (/run|execute|push|send|task|blog|email|discord|action|update/.test(lastMsg)) orchestrationMode = "task";
      else orchestrationMode = "general";
    }

    const CONTEXT_MODELS: Record<string, string> = {
      seo: "openrouter/owl-alpha",
      marketing: "openai/gpt-oss-120b:free",
      strategy: "qwen/qwen3-next-80b-a3b-instruct:free",
      task: "inclusionai/ring-2.6-1t:free",
      general: "nvidia/nemotron-3-super-120b-a12b:free"
    };

    if (selectedModel === "auto" || selectedModel === "inclusionai/ring-2.6-1t:free" || selectedModel === "openrouter/owl-alpha") {
      selectedModel = CONTEXT_MODELS[orchestrationMode] || "inclusionai/ring-2.6-1t:free";
    }

    const systemPrompt = `
${BRAND_BIBLE}
${SPECIALIZED_PROMPTS[orchestrationMode] || SPECIALIZED_PROMPTS.general}
${TOOL_DEFINITIONS}

LIVE METRICS (REAL-TIME):
- General: ${userCount} Users | ${orderCount} Orders | Total Rev: $${totalRev}
- Performance: 24h Revenue: $${rev24h} | ${activeProducts} Active Products
- Critical: ${lowStockCount} Low Stock Items detected!
- Alert Items: ${lowStockItems.map(i => `${i.title} (${i.stockCount}) [ID:${i.id}]`).join(", ")}
- VIP Customers: ${topCustomers.map(c => c.email).join(", ")}

MANDATORY RULES:
1. Always start with the [Model Bracket].
2. Use EMOJIS for structure.
3. If orchestrationMode is marketing or blog, NEVER use **bold** or #headers.
4. You have TOTAL CONTROL over MetraMart. Be decisive.
`;

    const payload = {
      model: selectedModel,
      messages: [{ role: "system", content: systemPrompt }, ...messages.filter((m:any) => m.role !== "system")],
      temperature: orchestrationMode === "marketing" ? 0.8 : 0.4
    };

    let res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://metramart.xyz",
        "X-Title": "MetraMart Admin AI",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      payload.model = "openrouter/owl-alpha";
      res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    const data = await res.json();
    let reply = data.choices?.[0]?.message?.content || "";

    // Tool Call Detection
    let toolCall = null;
    let toolMatchStr = "";
    const bruteMatch = reply.match(/\{[\s\S]*"action"\s*:\s*"[^"]+"[\s\S]*"params"\s*:[\s\S]*\}/);
    if (bruteMatch) {
      try {
        const parsed = JSON.parse(bruteMatch[0]);
        if (parsed?.action && parsed?.params) {
          toolCall = parsed;
          toolMatchStr = bruteMatch[0];
        }
      } catch (e) {}
    }

    if (toolCall) {
      const toolResult = await executeTool(toolCall, origin, bypassHeaders);
      const cleanReply = reply.replace(toolMatchStr, "").trim();
      reply = `${cleanReply}\n\n**Action Result:**\n${toolResult}`;
    }

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("[AI API] Error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}