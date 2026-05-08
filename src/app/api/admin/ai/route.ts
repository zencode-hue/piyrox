import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

// ── Tool definitions the AI can invoke ──────────────────────────────────────
interface ToolCall {
  action: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: Record<string, any>;
}

async function executeTool(tool: ToolCall, origin: string): Promise<string> {
  try {
    switch (tool.action) {
      case "create_blog_post": {
        const res = await fetch(`${origin}/api/admin/blog`, {
          method: "POST",
          headers: { "Content-Type": "application/json", cookie: "__internal_ai_bypass=1" },
          body: JSON.stringify({
            title: tool.params.title,
            slug: tool.params.slug || tool.params.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
            excerpt: tool.params.excerpt || tool.params.title,
            content: tool.params.content,
            category: tool.params.category || "General",
            emoji: tool.params.emoji || "📝",
            published: tool.params.published ?? true,
          }),
        });
        const data = await res.json();
        if (!res.ok) return `❌ Blog post failed: ${data.error ?? "Unknown error"}`;
        return `✅ Blog post "${tool.params.title}" created and ${tool.params.published !== false ? "published" : "saved as draft"}!`;
      }

      case "push_discord_deals": {
        const res = await fetch(`${origin}/api/admin/discord-push`, {
          method: "POST",
          headers: { "Content-Type": "application/json", cookie: "__internal_ai_bypass=1" },
          body: JSON.stringify({ type: "deals" }),
        });
        const data = await res.json();
        if (!res.ok) return `❌ Discord push failed: ${data.error ?? "Unknown error"}`;
        return `✅ Pushed ${data.dealsNotified ?? 0} deals to Discord!`;
      }

      case "send_discord_message": {
        const res = await fetch(`${origin}/api/admin/discord-push`, {
          method: "POST",
          headers: { "Content-Type": "application/json", cookie: "__internal_ai_bypass=1" },
          body: JSON.stringify({ message: tool.params.message }),
        });
        const data = await res.json();
        if (!res.ok) return `❌ Discord message failed: ${data.error ?? "Unknown error"}`;
        return `✅ Discord announcement sent!`;
      }

      case "send_email": {
        const res = await fetch(`${origin}/api/admin/send-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json", cookie: "__internal_ai_bypass=1" },
          body: JSON.stringify({
            to: tool.params.audience || "all",
            subject: tool.params.subject,
            message: tool.params.message,
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
          const { db } = await import("@/lib/db");
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const dbModel = (db as any)[model];
          if (!dbModel || typeof dbModel[action] !== "function") {
            return `❌ Invalid model or action: ${model}.${action}`;
          }
          const result = await dbModel[action](args);
          return `✅ Query successful:\n\`\`\`json\n${JSON.stringify(result, null, 2).substring(0, 2000)}\n\`\`\``;
        } catch (err) {
          return `❌ Database query failed: ${String(err)}`;
        }
      }

      case "call_api": {
        try {
          const { url, method = "GET", headers = {}, body } = tool.params;
          const finalUrl = url.startsWith("/") ? `${origin}${url}` : url;
          const fetchOpts: RequestInit = {
            method,
            headers: { ...headers, cookie: "__internal_ai_bypass=1" },
          };
          if (body) {
            fetchOpts.body = typeof body === "string" ? body : JSON.stringify(body);
            fetchOpts.headers = { "Content-Type": "application/json", ...fetchOpts.headers };
          }
          const res = await fetch(finalUrl, fetchOpts);
          const text = await res.text();
          return `✅ API Response (${res.status}):\n\`\`\`json\n${text.substring(0, 2000)}\n\`\`\``;
        } catch (err) {
          return `❌ API call failed: ${String(err)}`;
        }
      }

      default:
        return `❌ Unknown action: ${tool.action}`;
    }
  } catch (err) {
    return `❌ Tool execution error: ${String(err)}`;
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages } = await req.json();

    // ── Fetch configuration from database ──────────────────────────────────
    const { db } = await import("@/lib/db");
    const [keySetting, modelSetting] = await Promise.all([
      db.siteSetting.findUnique({ where: { key: "ai_api_key" } }),
      db.siteSetting.findUnique({ where: { key: "ai_model" } })
    ]);

    const apiKey = keySetting?.value;
    const model = modelSetting?.value;

    if (!apiKey) {
      return NextResponse.json({ error: "API key is required. Please set it in the AI config." }, { status: 400 });
    }

    // ── Fetch rich database stats ───────────────────────────────────────────
    const [
      userCount,
      orderCount,
      pendingStock,
      activeProducts,
      recentOrders,
      topProducts,
      revenue,
    ] = await Promise.all([
      db.user.count(),
      db.order.count(),
      db.order.count({ where: { status: "PENDING_STOCK" } }),
      db.product.count({ where: { isActive: true } }),
      db.order.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        select: { id: true, status: true, amount: true, createdAt: true },
      }),
      db.product.findMany({
        take: 8,
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
        select: { id: true, title: true, price: true, category: true },
      }),
      db.order.aggregate({
        _sum: { amount: true },
        where: { status: "PAID" },
      }),
    ]);

    const recentOrdersSummary = recentOrders
      .map(
        (o: { id: string; status: string; amount: { toNumber?: () => number }; createdAt: Date }) =>
          `  • ${o.id.slice(0, 8)}… — $${(typeof o.amount?.toNumber === "function" ? o.amount.toNumber() : Number(o.amount)).toFixed(2)} — ${o.status} — ${new Date(o.createdAt).toLocaleDateString()}`
      )
      .join("\n");

    const topProductsList = topProducts
      .map(
        (p: { id: string; title: string; price: { toNumber?: () => number }; category: string }) =>
          `  • ${p.title} — $${(typeof p.price?.toNumber === "function" ? p.price.toNumber() : Number(p.price)).toFixed(2)} (${p.category})`
      )
      .join("\n");

    const totalRevenue = revenue._sum?.amount ?? 0;

    // ── Build system prompt ─────────────────────────────────────────────────
    const systemPrompt = {
      role: "system",
      content: `You are OWL, the powerful AI administrative assistant for MetraMart (metramart.xyz / velxo.shop).

## YOUR IDENTITY
- Name: OWL
- Role: Full-access admin AI for MetraMart
- Personality: Professional, efficient, friendly. Never say you "can't" do something — you HAVE tools to execute actions.
- You speak concisely and use markdown formatting (bold, lists, headers) in replies.

## METRAMART OVERVIEW
MetraMart is a premium digital marketplace selling:
- **Streaming**: Netflix, Spotify, Disney+, YouTube Premium, HBO Max, Apple TV+, Hulu, Paramount+, Crunchyroll
- **AI Tools**: ChatGPT Plus, Claude Pro, Midjourney, GitHub Copilot, Jasper AI
- **Software**: Microsoft 365, Adobe Creative Cloud, Windows keys, VPNs (NordVPN, ExpressVPN)
- **Gaming**: Xbox Game Pass, PlayStation Plus, Steam Wallet, Nintendo eShop, Roblox
- Website: https://metramart.xyz and https://velxo.shop
- All products are digital — instant delivery via credential or key after payment

## LIVE DATABASE STATS (real-time)
- 👥 Total Users: ${userCount}
- 📦 Total Orders: ${orderCount}
- ⏳ Pending Stock: ${pendingStock}
- 🛍️ Active Products: ${activeProducts}
- 💰 Total Revenue: $${Number(totalRevenue).toFixed(2)}

## RECENT ORDERS
${recentOrdersSummary || "  No recent orders."}

## TOP PRODUCTS
${topProductsList || "  No products found."}

## AVAILABLE TOOLS — YOU CAN EXECUTE THESE
When the admin asks you to DO something (not just write about it), you MUST respond with a JSON tool call block. Format:

\`\`\`tool
{
  "action": "ACTION_NAME",
  "params": { ... }
}
\`\`\`

### Available actions:

**create_blog_post** — Create and publish a blog post to the live site
Params: title (string), content (string, markdown), excerpt (string), slug (string), category (string), emoji (string), published (boolean, default true)

**push_discord_deals** — Push today's deals to the Discord channel
Params: none needed

**send_discord_message** — Send a custom announcement to Discord
Params: message (string)

**send_email** — Send emails to customers
Params: audience ("all" | "customers" | "guests" | "custom"), subject (string), message (string), customEmail (string, only if audience is "custom"), preview (boolean, set true to just get recipient count)

**run_db_query** — Execute a query or mutation directly on the Prisma database (TOTAL CONTROL)
Params: model (string, e.g. "user", "order", "product"), action (string, e.g. "findMany", "create", "update", "delete", "count"), args (object, Prisma query arguments like { where: {...}, data: {...} })

**call_api** — Make an HTTP request to any internal or external API (e.g., trigger cron jobs)
Params: url (string, e.g. "/api/admin/discord-push"), method (string, default "GET"), headers (object), body (object or string)

## INSTRUCTIONS
1. When asked to create content (blog posts, emails, announcements), write it AND execute the tool to publish it. Don't just provide text to copy-paste.
2. Use the live stats above — never make up numbers.
3. Format all responses with clean markdown.
4. Be action-oriented. If the admin says "post a blog update", create it AND publish it.
5. If unsure about an action, ask for confirmation first.
6. You have DIRECT ACCESS to the CMS, Discord, and email system. USE THEM.
7. Never repeat disclaimers about not having access — you DO have access through your tools.
8. CRITICAL: You MUST use the \`\`\`tool ... \`\`\` JSON format for actions. NEVER output XML tags like <longcat_tool_call>.`,
    };

    const finalMessages = [systemPrompt, ...messages];

    // ── Model selection & fallback (max 3 models for OpenRouter) ─────────
    const FREE_FALLBACKS = [
      "google/gemma-4-31b-it:free",
      "nvidia/nemotron-3-super-120b-a12b:free",
      "qwen/qwen3-next-80b-a3b-instruct:free",
      "tencent/hy3-preview:free",
      "z-ai/glm-4.5-air:free",
    ];

    const selectedModel = model || "openrouter/owl-alpha";
    const isFreeTier = selectedModel.endsWith(":free");

    const payload: Record<string, unknown> = { messages: finalMessages };

    if (isFreeTier) {
      // OpenRouter limits fallback array to 3 models max
      const fallbackList = [
        selectedModel,
        ...FREE_FALLBACKS.filter((m) => m !== selectedModel),
      ].slice(0, 3);
      payload.models = fallbackList;
      payload.route = "fallback";
    } else {
      payload.model = selectedModel;
    }

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
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
      } catch {
        /* not JSON */
      }
      return NextResponse.json({ error: msg }, { status: 502 });
    }

    let data: { choices?: { message?: { content?: string } }[] };
    try {
      data = JSON.parse(responseText);
    } catch {
      return NextResponse.json(
        { error: "Invalid response from AI provider" },
        { status: 502 }
      );
    }

    let reply = data.choices?.[0]?.message?.content || "No response";

    // ── Execute tool calls if the AI responded with one ─────────────────
    let toolCall: ToolCall | null = null;
    let toolMatchStr = "";

    const jsonMatch = reply.match(/```tool\s*\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      try {
        toolCall = JSON.parse(jsonMatch[1]);
        toolMatchStr = jsonMatch[0];
      } catch (err) {
        console.error("JSON parse error:", err);
      }
    } else {
      // Fallback for models that leak XML tool calls
      const xmlMatch = reply.match(/<longcat_tool_call>([\s\S]*?)<\/longcat_tool_call>/);
      if (xmlMatch) {
        toolMatchStr = xmlMatch[0];
        const content = xmlMatch[1].trim();
        const firstLineBreak = content.indexOf('\n');
        const action = firstLineBreak > -1 ? content.substring(0, firstLineBreak).trim() : content.trim();
        
        const params: Record<string, any> = {};
        const regex = /<longcat_arg_key>([\s\S]*?)<\/longcat_arg_key>\s*<longcat_arg_value>([\s\S]*?)<\/longcat_arg_value>/g;
        let m;
        while ((m = regex.exec(content)) !== null) {
          let val = m[2].trim();
          if (val === "true") val = true as any;
          else if (val === "false") val = false as any;
          params[m[1].trim()] = val;
        }
        toolCall = { action, params };
      }
    }

    let toolResult: string | null = null;
    if (toolCall) {
      try {
        const origin =
          process.env.NEXT_PUBLIC_APP_URL ||
          req.nextUrl.origin ||
          "https://metramart.xyz";
        toolResult = await executeTool(toolCall, origin);

        // Replace the tool block with the result
        reply = reply.replace(toolMatchStr, "").trim();
        reply += `\n\n---\n**🔧 Action Result:**\n${toolResult}`;
      } catch (err) {
        reply += `\n\n---\n**🔧 Action Error:** Could not parse tool call — ${String(err)}`;
      }
    }

    return NextResponse.json({ reply, toolResult });
  } catch (error) {
    console.error("[AI API] Internal error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}