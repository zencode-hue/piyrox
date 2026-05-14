import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ToolCall {
  action: string;
  params: Record<string, unknown>;
  raw: string;
}

// ─── Tool Executor ────────────────────────────────────────────────────────────
async function executeTool(
  tool: ToolCall,
  origin: string,
  bypassHeaders: Record<string, string>
): Promise<string> {
  try {
    switch (tool.action) {
      // ── Blog ────────────────────────────────────────────────────────────────
      case "create_blog_post": {
        const params = { ...tool.params } as Record<string, unknown>;
        if (!params.slug && params.title) {
          params.slug = (params.title as string)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
        }
        const res = await fetch(`${origin}/api/admin/blog`, {
          method: "POST",
          headers: { ...bypassHeaders, "Content-Type": "application/json" },
          body: JSON.stringify(params),
        });
        const data = await res.json();
        if (!res.ok) return `❌ Blog creation failed: ${data.error ?? "Unknown error"}`;
        return `✅ Blog post created: "${params.title}" (Slug: ${data.slug || params.slug})`;
      }

      // ── Discord ─────────────────────────────────────────────────────────────
      case "push_discord_deals": {
        const res = await fetch(`${origin}/api/admin/discord-push`, {
          method: "POST",
          headers: { ...bypassHeaders, "Content-Type": "application/json" },
          body: JSON.stringify({ type: "deals" }),
        });
        const data = await res.json();
        if (!res.ok) return `❌ Discord deals failed: ${data.error ?? "Unknown error"}`;
        return `✅ Today's deals pushed to Discord!`;
      }

      case "send_discord_message": {
        const res = await fetch(`${origin}/api/admin/discord-push`, {
          method: "POST",
          headers: { ...bypassHeaders, "Content-Type": "application/json" },
          body: JSON.stringify({ message: tool.params.message }),
        });
        const data = await res.json();
        if (!res.ok) return `❌ Discord message failed: ${data.error ?? "Unknown error"}`;
        return `✅ Discord announcement sent!`;
      }

      // ── Email ───────────────────────────────────────────────────────────────
      case "send_email": {
        const res = await fetch(`${origin}/api/admin/send-email`, {
          method: "POST",
          headers: { ...bypassHeaders, "Content-Type": "application/json" },
          body: JSON.stringify({
            to: tool.params.audience || "all",
            subject: tool.params.subject || "MetraMart Announcement",
            message: tool.params.message || "Check your dashboard for the latest updates.",
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

      // ── Database ─────────────────────────────────────────────────────────────
      case "run_db_query": {
        let { model, action, args } = tool.params as {
          model: string;
          action: string;
          args: any;
        };
        const { db: prisma } = await import("@/lib/db");
        
        // Fix for common AI mistakes
        if (action === "aggregate" && args?.count === true) {
          action = "count";
          delete args.count;
        }

        // Ensure args are wrapped in 'where' for read actions if they look like filters
        const readActions = ["count", "findMany", "findUnique", "findFirst", "aggregate"];
        if (readActions.includes(action)) {
          if (args && !args.where && !args.select && !args.include && !args._count && !args.data) {
            // If they just passed filters, wrap them
            args = { where: args };
          }
        }

        // Helper to replace date placeholders
        const processDates = (obj: any) => {
          if (!obj || typeof obj !== "object") return;
          const now = new Date();
          const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const startOfYesterday = new Date(startOfToday.getTime() - 86400000);
          
          for (const key in obj) {
            if (typeof obj[key] === "string") {
              if (obj[key] === "TODAY_START") obj[key] = startOfToday.toISOString();
              else if (obj[key] === "TODAY_END") obj[key] = now.toISOString();
              else if (obj[key] === "YESTERDAY_START") obj[key] = startOfYesterday.toISOString();
              else if (obj[key] === "NOW") obj[key] = now.toISOString();
            } else if (typeof obj[key] === "object") {
              processDates(obj[key]);
            }
          }
        };
        processDates(args);

        const dbModel = (prisma as unknown as Record<string, unknown>)[model] as Record<string, Function> | undefined;
        if (!dbModel || typeof dbModel[action] !== "function") {
          return `❌ Invalid model/action: ${model}.${action}`;
        }
        
        const result = await dbModel[action](args ?? {});
        return `✅ DB Result (${model}.${action}): ${JSON.stringify(result, null, 2).substring(0, 1500)}`;
      }

      // ── Inventory ────────────────────────────────────────────────────────────
      case "update_inventory_count": {
        const { productId, count } = tool.params as { productId: string; count: number };
        const updated = await db.product.update({
          where: { id: productId },
          data: { stockCount: count },
        });
        return `✅ Inventory updated for "${updated.title}": ${count} units.`;
      }

      // ── Social Blast ─────────────────────────────────────────────────────────
      case "social_media_blast": {
        const res = await fetch(`${origin}/api/admin/social-blast`, {
          method: "POST",
          headers: { ...bypassHeaders, "Content-Type": "application/json" },
          body: JSON.stringify(tool.params),
        });
        const data = await res.json();
        if (!res.ok) return `❌ Social blast failed: ${data.error ?? "Unknown error"}`;
        return `✅ Social blast launched! Product: ${data.product}. Destinations: ${(data.destinations || []).join(", ")}.`;
      }

      // ── Product Management ────────────────────────────────────────────────────
      case "toggle_product": {
        const { productId, active } = tool.params as { productId: string; active: boolean };
        const updated = await db.product.update({
          where: { id: productId },
          data: { isActive: active },
        });
        return `✅ Product "${updated.title}" is now ${active ? "ACTIVE" : "INACTIVE"}.`;
      }

      // ── Discount ─────────────────────────────────────────────────────────────
      case "create_discount": {
        const { code, percent, maxUses } = tool.params as {
          code: string;
          percent: number;
          maxUses?: number;
        };
        const discount = await db.discountCode.create({
          data: {
            code: code.toUpperCase(),
            type: "PERCENTAGE",
            value: percent,
            usageLimit: maxUses ?? 100,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days
          },
        });
        return `✅ Discount code "${discount.code}" created: ${percent}% off (Limit: ${discount.usageLimit}).`;
      }

      default:
        return `❌ Unknown tool action: "${tool.action}". Check available tools.`;
    }
  } catch (err) {
    return `❌ Tool execution error [${tool.action}]: ${String(err)}`;
  }
}

// ─── Tool Call Parser ─────────────────────────────────────────────────────────
function parseToolCalls(reply: string): ToolCall[] {
  const toolCalls: ToolCall[] = [];
  const seen = new Set<string>();

  // 1. JSON format: {"action": "...", "params": {...}}
  // We look for the pattern and then find the matching closing brace for the whole object
  const startRegex = /\{\s*"action"\s*:\s*"([^"]+)"/g;
  let match;
  while ((match = startRegex.exec(reply)) !== null) {
    const startIndex = match.index;
    let braceCount = 0;
    let foundEnd = false;
    let endIndex = startIndex;

    for (let i = startIndex; i < reply.length; i++) {
      if (reply[i] === "{") braceCount++;
      else if (reply[i] === "}") braceCount--;

      if (braceCount === 0 && i > startIndex) {
        endIndex = i + 1;
        foundEnd = true;
        break;
      }
    }

    if (foundEnd) {
      const raw = reply.substring(startIndex, endIndex);
      if (seen.has(raw)) continue;
      try {
        const parsed = JSON.parse(raw) as { action: string; params: Record<string, unknown> };
        if (parsed.action && parsed.params !== undefined) {
          toolCalls.push({ action: parsed.action, params: parsed.params, raw });
          seen.add(raw);
        }
      } catch (_) {}
    }
  }

  // 2. XML format: <tool_call>action_name<arg_key>k</arg_key><arg_value>v</arg_value>...</tool_call>
  const xmlRegex = /<tool_call>([\s\S]*?)<\/tool_call>/g;
  let xm: RegExpExecArray | null;
  while ((xm = xmlRegex.exec(reply)) !== null) {
    const raw = xm[0];
    if (seen.has(raw)) continue;
    try {
      const block = xm[1].trim();
      const actionMatch = block.match(/^([a-z_]+)/);
      if (!actionMatch) continue;
      const action = actionMatch[1];
      const params: Record<string, unknown> = {};
      const pairRegex = /<arg_key>([^<]+)<\/arg_key>\s*<arg_value>([\s\S]*?)<\/arg_value>/g;
      let pm: RegExpExecArray | null;
      while ((pm = pairRegex.exec(block)) !== null) {
        const key = pm[1].trim();
        let value: unknown = pm[2].trim();
        try { value = JSON.parse(value as string); } catch (_) {}
        params[key] = value;
      }
      toolCalls.push({ action, params, raw });
      seen.add(raw);
    } catch (_) {}
  }

  // 3. Anthropic-style <tool_use> format
  const anthropicRegex = /<tool_use>\s*<name>([^<]+)<\/name>\s*<input>([\s\S]*?)<\/input>\s*<\/tool_use>/g;
  let am: RegExpExecArray | null;
  while ((am = anthropicRegex.exec(reply)) !== null) {
    const raw = am[0];
    if (seen.has(raw)) continue;
    try {
      const action = am[1].trim();
      const params = JSON.parse(am[2].trim()) as Record<string, unknown>;
      toolCalls.push({ action, params, raw });
      seen.add(raw);
    } catch (_) {}
  }

  return toolCalls;
}

// ─── Model Fallback Chain ─────────────────────────────────────────────────────
const FALLBACK_MODELS = [
  "google/gemma-4-31b-it:free",
];

async function callOpenRouter(
  apiKey: string,
  model: string,
  messages: unknown[],
  temperature: number
): Promise<{ content: string; model: string }> {
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "HTTP-Referer": "https://metramart.xyz",
    "X-Title": "MetraMart Admin AI",
  };

  const modelsToTry = [model, ...FALLBACK_MODELS.filter((m) => m !== model)];

  for (const m of modelsToTry) {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers,
        body: JSON.stringify({ model: m, messages, temperature, max_tokens: 2000 }),
      });
      if (!res.ok) continue;
      const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
      const content = data.choices?.[0]?.message?.content;
      if (content) return { content, model: m };
    } catch (_) {
      continue;
    }
  }
  return { content: "⚠️ All AI models are currently unavailable. Please try again shortly.", model: "none" };
}

// ─── Tool Definitions (for system prompt) ─────────────────────────────────────
const TOOL_DEFINITIONS = `
AVAILABLE TOOLS — respond with JSON tool call when execution is needed:
{ "action": "create_blog_post", "params": { "title": "str", "excerpt": "str", "content": "html", "category": "str", "emoji": "str", "published": true } }
{ "action": "push_discord_deals", "params": {} }
{ "action": "send_discord_message", "params": { "message": "str" } }
{ "action": "send_email", "params": { "audience": "all|customers|guests|custom", "subject": "str", "message": "str", "customEmail": "str" } }
{ "action": "run_db_query", "params": { "model": "user|product|order|blogPost|socialBlast|discountCode|pageView", "action": "count|findMany|findUnique|aggregate|create|update|delete|updateMany|deleteMany|upsert", "args": {} } }
{ "action": "update_inventory_count", "params": { "productId": "str", "count": 10 } }
{ "action": "social_media_blast", "params": { "productId": "str", "platforms": ["twitter","instagram","facebook","discord","telegram","pinterest"], "tone": "str" } }
{ "action": "toggle_product", "params": { "productId": "str", "active": true } }
{ "action": "create_discount", "params": { "code": "SALE20", "percent": 20, "maxUses": 100 } }

TOOL RULES:
- Use EXACTLY ONE tool call per action.
- Both JSON and XML formats are supported.
- JSON format: { "action": "name", "params": { "key": "value" } }
- XML format: <tool_call>action_name<arg_key>k</arg_key><arg_value>v</arg_value></tool_call>
- After triggering a tool, confirm it with a human-readable summary.
- Never show raw code to the admin — wrap it in your narration.
- For DB dates, you can use: "TODAY_START", "TODAY_END", "YESTERDAY_START", "NOW".
`;

// ─── Main Route ───────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { error: authError } = await requireAdminApi();
    if (authError) return authError;

    const { messages, context, model: selectedModelName } = await req.json() as {
      messages: Array<{ role: string; content: string }>;
      context?: string;
      model?: string;
    };

    const origin = new URL(req.url).origin;
    const bypassKey = process.env.INTERNAL_BYPASS_KEY || "metramart-ai-secret-2024";
    const bypassHeaders: Record<string, string> = {
      "X-Internal-AI-Bypass": bypassKey,
      "Content-Type": "application/json",
    };

    const keySetting = await db.siteSetting.findUnique({ where: { key: "ai_api_key" } });
    const apiKey = keySetting?.value;
    if (!apiKey) return NextResponse.json({ error: "No AI API Key configured." }, { status: 400 });

    // ── Live Metrics ──────────────────────────────────────────────────────────
    const now = new Date();
    const ago24h = new Date(now.getTime() - 86_400_000);
    const ago7d  = new Date(now.getTime() - 7 * 86_400_000);

    const [
      userCount, orderCount, lowStockCount, activeProducts,
      revenueTotal, revenue24h, revenue7d, lowStockItems, topCustomers,
      recentOrders, socialBlastCount,
    ] = await Promise.all([
      db.user.count(),
      db.order.count(),
      db.product.count({ where: { stockCount: { lte: 5 } } }),
      db.product.count({ where: { isActive: true } }),
      db.order.aggregate({ _sum: { amount: true }, where: { status: "PAID" } }),
      db.order.aggregate({ _sum: { amount: true }, where: { status: "PAID", createdAt: { gte: ago24h } } }),
      db.order.aggregate({ _sum: { amount: true }, where: { status: "PAID", createdAt: { gte: ago7d } } }),
      db.product.findMany({ where: { stockCount: { lte: 5 }, isActive: true }, select: { title: true, stockCount: true, id: true } }),
      db.user.findMany({ take: 5, orderBy: { orders: { _count: "desc" } }, select: { email: true, name: true } }),
      db.order.findMany({ take: 5, orderBy: { createdAt: "desc" }, include: { user: { select: { email: true } } } }),
      db.socialBlast.count(),
    ]);

    const totalRev = Number(revenueTotal._sum?.amount ?? 0).toFixed(2);
    const rev24h   = Number(revenue24h._sum?.amount ?? 0).toFixed(2);
    const rev7d    = Number(revenue7d._sum?.amount ?? 0).toFixed(2);

    // ── Mode Detection ─────────────────────────────────────────────────────────
    const CONTEXT_MODELS: Record<string, string> = {
      seo:       "google/gemma-4-31b-it:free",
      marketing: "google/gemma-4-31b-it:free",
      strategy:  "google/gemma-4-31b-it:free",
      task:      "google/gemma-4-31b-it:free",
      general:   "google/gemma-4-31b-it:free",
    };

    let orchestrationMode = context || "auto";
    if (orchestrationMode === "auto") {
      const lastMsg = (messages[messages.length - 1]?.content || "").toLowerCase();
      if (/seo|keyword|meta|rank|optimize|serp/.test(lastMsg))                          orchestrationMode = "seo";
      else if (/campaign|social|post|market|facebook|ig|ads|copy|newsletter|blast|write|description|content|blog|story|article/.test(lastMsg)) orchestrationMode = "marketing";
      else if (/strategy|plan|growth|revenue|monetize|profit|churn/.test(lastMsg))     orchestrationMode = "strategy";
      else if (/run|execute|push|send|task|discord|action|update|create|count|how many|query|delete|edit|change|email/.test(lastMsg)) orchestrationMode = "task";
      else orchestrationMode = "general";
    }

    // ── Model Selection ────────────────────────────────────────────────────────
    let selectedModel = "google/gemma-4-31b-it:free"; // Enforced Global Model
    
    // Auto-routing or explicit selection both point to Gemma now
    selectedModel = "google/gemma-4-31b-it:free";

    console.log(`[AI Router] Mode: ${orchestrationMode}, Model: ${selectedModel}, Name: ${selectedModelName}`);

    // ── Persona ────────────────────────────────────────────────────────────────
    const PERSONAS: Record<string, string> = {
      seo:       "[Metra AI — SEO Hawk] 🦅 Page-1 ranking expert. Diagnose meta gaps, keyword opportunities, and competitor blind spots.",
      marketing: "[Metra AI — Marketing Director] 🎯 World-class CMO. High-conversion copy, emoji-rich, NO bold or headers.",
      strategy:  "[Metra AI — Growth Strategist] 📈 Data-driven business analyst. Revenue models, churn reduction, monetisation.",
      task:      "[Metra AI — Task Engine] ⚡ You are the EXECUTOR. Use tools for every action. Never say you'll do it — DO IT NOW.",
      general:   "[Metra AI — Command Centre] 🛡️ Total administrative control of MetraMart. Direct, decisive, and data-aware.",
    };

    const systemPrompt = `
You are METRA AI — the autonomous intelligence behind MetraMart, the world's #1 premium digital marketplace.
Products: Streaming (Netflix, Disney+, Spotify, YT Premium), AI Tools (ChatGPT Plus, Midjourney, Claude), Software (Windows, Adobe), Gaming (Xbox Game Pass, PS Plus).

ACTIVE PERSONA: ${PERSONAS[orchestrationMode] || PERSONAS.general}

${TOOL_DEFINITIONS}

━━━ LIVE STORE METRICS ━━━
👥 Users: ${userCount}  |  📦 Orders: ${orderCount}  |  💰 Total Revenue: $${totalRev}
📈 24h Revenue: $${rev24h}  |  7d Revenue: $${rev7d}
🛍️ Active Products: ${activeProducts}  |  📢 Social Blasts Sent: ${socialBlastCount}
⚠️ Low Stock (≤5 units): ${lowStockCount} items — ${lowStockItems.map((i) => `${i.title}(${i.stockCount})[${i.id}]`).join(", ") || "None"}
🏆 VIP Customers: ${topCustomers.map((c) => c.email).join(", ") || "None yet"}
🕐 Recent Orders: ${recentOrders.map((o) => `#${o.id.slice(-6)} $${o.amount} (${o.user?.email ?? "Guest"})`).join(" | ") || "None"}

━━━ RULES ━━━
1. Always open with your persona bracket.
2. Be decisive — never ask if you should do something, just do it using tools.
3. Use emojis to structure responses.
4. In marketing mode: NO **bold**, NO # headers — clean prose only.
5. After every tool call, narrate what happened in plain English.
6. You have FULL authority to READ, EDIT, and CREATE data in the database.
7. Available Models: user, product, order, blogPost, socialBlast, discountCode, pageView, affiliate, referral, inventoryItem, productVariant, staffMember.
8. If a user asks "how many X" or "list X" or "change X" — use run_db_query immediately.
`.trim();

    // ── Call AI ────────────────────────────────────────────────────────────────
    const aiMessages = [
      { role: "system", content: systemPrompt },
      ...messages.filter((m) => m.role !== "system"),
    ];

    const temperature = orchestrationMode === "marketing" ? 0.85 : 0.35;
    const aiResponse = await callOpenRouter(apiKey, selectedModel, aiMessages, temperature);
    let reply = aiResponse.content;
    const finalModel = aiResponse.model;

    // ── Execute Tool Calls ────────────────────────────────────────────────────
    const toolCalls = parseToolCalls(reply);
    if (toolCalls.length > 0) {
      let cleanReply = reply;
      const results: string[] = [];

      for (const tc of toolCalls) {
        cleanReply = cleanReply.replace(tc.raw, "").trim();
        const result = await executeTool(tc, origin, bypassHeaders);
        results.push(result);
      }

      // Strip model noise
      cleanReply = cleanReply
        .replace(/Clear\s*Console/gi, "")
        .replace(/<\/?tool_call>/g, "")
        .replace(/<arg_key>[^<]*<\/arg_key>/g, "")
        .replace(/<arg_value>[^<]*<\/arg_value>/g, "")
        .trim();

      reply = cleanReply
        ? `${cleanReply}\n\n━━━ Action Results ━━━\n${results.join("\n")}`
        : `━━━ Action Results ━━━\n${results.join("\n")}`;
    }

    return NextResponse.json({ reply, model: finalModel });
  } catch (err) {
    console.error("[Metra AI] Critical Error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}