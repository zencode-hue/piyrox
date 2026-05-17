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

        // ── Auto-fix common AI field name mistakes ──────────────────────────────
        const fixFields = (obj: any, modelName: string): any => {
          if (!obj || typeof obj !== "object") return obj;
          if (Array.isArray(obj)) return obj.map((i: any) => fixFields(i, modelName));
          const result: any = {};
          for (const key of Object.keys(obj)) {
            let newKey = key;
            // product model: 'name' → 'title'
            if (modelName === "product" && key === "name") newKey = "title";
            // order model: 'customerId' → 'userId'
            if (modelName === "order" && key === "customerId") newKey = "userId";
            // user model: 'username' → 'name'
            if (modelName === "user" && key === "username") newKey = "name";
            result[newKey] = fixFields(obj[key], modelName);
          }
          return result;
        };
        args = fixFields(args, model);

        // Fix: aggregate count:true shorthand
        if (action === "aggregate" && args?.count === true) {
          action = "count";
          delete args.count;
        }

        // Fix: unwrapped filter args for read operations
        const readActions = ["count", "findMany", "findUnique", "findFirst", "aggregate"];
        if (readActions.includes(action)) {
          if (args && !args.where && !args.select && !args.include && !args._count && !args.data) {
            args = { where: args };
          }
        }

        // Fix: updateMany with title filter — find IDs first, then update by id
        // This avoids Prisma errors when AI tries to filter by title in updateMany
        if ((action === "update" || action === "updateMany") && args?.where?.title?.contains) {
          const found = await (prisma as any)[model].findMany({
            where: { title: { contains: args.where.title.contains, mode: "insensitive" } },
            select: { id: true, title: true },
          });
          if (!found.length) return `❌ No ${model} found matching "${args.where.title.contains}"`;
          if (found.length === 1) {
            // Convert to single update by id
            args.where = { id: found[0].id };
            action = "update";
          } else {
            // Update all matched by id list
            args.where = { id: { in: found.map((f: any) => f.id) } };
            action = "updateMany";
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
          return `❌ Invalid model/action: ${model}.${action}. Valid models: product, user, order, blogPost, discountCode, socialBlast, inventoryItem, affiliate`;
        }

        const result = await dbModel[action](args ?? {});
        return `✅ DB Result (${model}.${action}): ${JSON.stringify(result, null, 2).substring(0, 2000)}`;
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
// openrouter/free is FIRST — strictly routes to free-tier models only.
// Never uses paid models regardless of availability.
const FALLBACK_MODELS = [
  "openrouter/free",
  "google/gemma-4-31b-it:free",
  "google/gemma-4-26b-a4b-it:free",
  "google/gemma-4-31b:free",
  "google/gemma-2-9b-it:free",
  "qwen/qwen-2.5-72b-instruct:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "mistralai/mistral-7b-instruct:free",
  "deepseek/deepseek-chat:free",
  "openrouter/free",
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

  // Deduplicate: start with requested model, then run through fallbacks
  const uniqueModels = new Set([model, ...FALLBACK_MODELS]);
  const modelsToTry = Array.from(uniqueModels);

  let lastErrorMessage = "";

  for (const m of modelsToTry) {
    try {
      // Ensure messages are in the correct format for multimodal
      const processedMessages = messages.map((msg: any) => {
        if (typeof msg.content === "string") return msg;
        return msg; // already an array (multimodal)
      });

      console.log(`[AI Router] Trying model: ${m}`);

      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: m,
          messages: processedMessages,
          temperature,
          max_tokens: 2000,
        }),
      });

      // Read body once
      const rawText = await res.text();
      let data: any;
      try {
        data = JSON.parse(rawText);
      } catch {
        lastErrorMessage = `Non-JSON response from OpenRouter: ${rawText.slice(0, 200)}`;
        console.error(`[AI Router] Non-JSON from ${m}:`, rawText.slice(0, 200));
        continue;
      }

      // ── Check for error field in the JSON (even on 200 OK) ──
      if (data?.error) {
        const errMsg = data.error?.message || JSON.stringify(data.error);
        lastErrorMessage = errMsg;
        console.error(`[AI Router] ${m} returned error in body (status ${res.status}): ${errMsg}`);
        // If it's a provider error, add a small delay before trying next model
        if (errMsg.toLowerCase().includes("provider") || errMsg.toLowerCase().includes("rate")) {
          await new Promise((r) => setTimeout(r, 800));
        }
        continue;
      }

      // ── Non-OK HTTP status without error field ──
      if (!res.ok) {
        lastErrorMessage = `HTTP ${res.status}: ${rawText.slice(0, 200)}`;
        console.error(`[AI Router] ${m} returned HTTP ${res.status}: ${rawText.slice(0, 200)}`);
        continue;
      }

      // ── Extract content ──
      const content = data?.choices?.[0]?.message?.content;
      if (content && typeof content === "string" && content.trim()) {
        console.log(`[AI Router] Success with model: ${m}`);
        return { content, model: m };
      }

      // Empty content is a soft failure
      lastErrorMessage = `${m} returned empty content`;
      console.warn(`[AI Router] Empty content from: ${m}`);

    } catch (err: any) {
      lastErrorMessage = err?.message || String(err);
      console.error(`[AI Router] Exception for model ${m}:`, lastErrorMessage);
    }
  }

  const finalError = lastErrorMessage
    ? `⚠️ All AI models are currently unavailable.\nLast OpenRouter error: "${lastErrorMessage}"\n\n💡 **Fix:** Go to Admin → AI → ⚙️ Settings and verify your OpenRouter API key is valid and has credits at openrouter.ai`
    : "⚠️ All AI models are currently unavailable. Please check your OpenRouter API key in Admin → AI → Settings.";

  return { content: finalError, model: "none" };
}


// ─── Tool Definitions (for system prompt) ─────────────────────────────────────
const TOOL_DEFINITIONS = `
AVAILABLE TOOLS — use JSON tool call format:
{ "action": "create_blog_post", "params": { "title": "str", "excerpt": "str", "content": "html", "category": "str", "emoji": "str", "published": true } }
{ "action": "push_discord_deals", "params": {} }
{ "action": "send_discord_message", "params": { "message": "str" } }
{ "action": "send_email", "params": { "audience": "all|customers|guests|custom", "subject": "str", "message": "str", "customEmail": "str" } }
{ "action": "run_db_query", "params": { "model": "product|user|order|blogPost|socialBlast|discountCode|inventoryItem|affiliate", "action": "count|findMany|findUnique|findFirst|aggregate|create|update|updateMany|delete|deleteMany", "args": {} } }
{ "action": "update_inventory_count", "params": { "productId": "str", "count": 10 } }
{ "action": "social_media_blast", "params": { "productId": "str", "platforms": ["discord","twitter","instagram","facebook","telegram","pinterest"], "tone": "str" } }
{ "action": "toggle_product", "params": { "productId": "str", "active": true } }
{ "action": "create_discount", "params": { "code": "SALE20", "percent": 20, "maxUses": 100 } }

━━━ EXACT PRISMA FIELD NAMES (CRITICAL — use these exactly) ━━━
product:  id, title, description, price (Decimal), category, isActive (bool), stockCount (int), unlimitedStock (bool), imageUrl, slug, createdAt
user:     id, name, email, role ("USER"|"ADMIN"), createdAt, balance (Decimal)
order:    id, amount (Decimal), status ("PENDING"|"PAID"|"FAILED"|"PENDING_STOCK"), paymentProvider, userId, createdAt
blogPost: id, title, slug, excerpt, content, published (bool), category, emoji, createdAt
discountCode: id, code, type ("PERCENTAGE"|"FIXED"), value (Decimal), usageCount, usageLimit, expiresAt, isActive (bool)
inventoryItem: id, productId, status ("AVAILABLE"|"DELIVERED"), encryptedData, createdAt
affiliate: id, userId, code, commissionPct (Decimal), totalEarned (Decimal), pendingPayout (Decimal), status

━━━ DB QUERY RULES ━━━
- FIELD NAMES: Use "title" NOT "name" for products. Use "amount" NOT "total" for orders.
- To update a product by name: use { "model": "product", "action": "updateMany", "args": { "where": { "title": { "contains": "Directv", "mode": "insensitive" } }, "data": { "price": 64.99 } } }
- To find product ID: use findMany with title contains filter, then use the id in subsequent calls.
- For price updates: pass price as a number (64.99), NOT a string.
- Use EXACTLY ONE tool call per action.
- After triggering a tool, narrate what happened in plain English.
- For DB dates: "TODAY_START", "TODAY_END", "YESTERDAY_START", "NOW".
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
    const apiKey = keySetting?.value || process.env.OPENROUTER_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "No AI API Key configured. Go to Admin → AI → ⚙️ Settings to add your OpenRouter key." }, { status: 400 });

    // ── Live Metrics ──────────────────────────────────────────────────────────
    const now = new Date();
    const ago24h = new Date(now.getTime() - 86_400_000);
    const ago7d  = new Date(now.getTime() - 7 * 86_400_000);

    const [
      userCount, orderCount, lowStockCount, activeProducts,
      revenueTotal, revenue24h, revenue7d, lowStockItems, topCustomers,
      recentOrders, socialBlastCount, allProducts,
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
      db.product.findMany({ select: { id: true, title: true, price: true, category: true, isActive: true }, orderBy: { title: "asc" } }),
    ]);

    const totalRev = Number(revenueTotal._sum?.amount ?? 0).toFixed(2);
    const rev24h   = Number(revenue24h._sum?.amount ?? 0).toFixed(2);
    const rev7d    = Number(revenue7d._sum?.amount ?? 0).toFixed(2);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const productCatalog = (allProducts as any[]).map((p: any) =>
      `  ${p.isActive ? "✅" : "❌"} [id:${p.id}] ${p.title} (${p.category}) — $${Number(p.price).toFixed(2)}`
    ).join("\n");

    // ── Mode Detection ─────────────────────────────────────────────────────────
    const CONTEXT_MODELS: Record<string, string> = {
      seo:       "google/gemma-4-31b:free",
      marketing: "google/gemma-4-31b:free",
      strategy:  "google/gemma-4-31b:free",
      task:      "google/gemma-4-31b:free",
      general:   "google/gemma-4-31b:free",
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
    let selectedModel = "google/gemma-4-31b:free"; // Enforced Global Model
    if (orchestrationMode !== "auto") {
      selectedModel = "google/gemma-4-31b:free";
    }  console.log(`[AI Router] Mode: ${orchestrationMode}, Model: ${selectedModel}, Name: ${selectedModelName}`);

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

━━━ PRODUCT CATALOG (use these exact IDs for tool calls) ━━━
${productCatalog}

━━━ RULES ━━━
1. Always open with your persona bracket.
2. Be decisive — never ask if you should do something, just do it using tools.
3. Use emojis to structure responses.
4. In marketing mode: NO **bold**, NO # headers — clean prose only.
5. After every tool call, narrate what happened in plain English.
6. You have FULL authority to READ, EDIT, and CREATE data in the database.
7. ALWAYS use exact field names from the schema above. Product field is "title" not "name".
8. When asked to edit/update a product: look up its id from the PRODUCT CATALOG above, then use run_db_query with that exact id.
9. If a user asks "how many X" or "list X" or "change X" — use run_db_query immediately.
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