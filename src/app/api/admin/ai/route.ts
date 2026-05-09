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
          let { method = "GET" } = tool.params;
          const { url, headers = {}, body } = tool.params;
          
          // Internal admin APIs usually require POST
          if (url.startsWith("/api/admin") && !tool.params.method) {
            method = "POST";
          }

          const finalUrl = url.startsWith("/") ? `${origin}${url}` : url;
          const fetchOpts: RequestInit = {
            method,
            headers: { 
              ...headers, 
              "Content-Type": "application/json",
              cookie: "__internal_ai_bypass=1" 
            },
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

      case "read_env": {
        try {
          const keys = tool.params.keys;
          if (Array.isArray(keys)) {
            const result: Record<string, string> = {};
            for (const k of keys) result[k] = process.env[k] || "";
            return `✅ Environment variables:\n\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\``;
          }
          // If no specific keys requested, return all (careful, it's total access as requested)
          return `✅ Environment variables:\n\`\`\`json\n${JSON.stringify(process.env, null, 2).substring(0, 3000)}\n\`\`\``;
        } catch (err) {
          return `❌ Failed to read env: ${String(err)}`;
        }
      }

      case "read_file": {
        try {
          const fs = await import("fs/promises");
          const path = await import("path");
          const safePath = path.resolve(process.cwd(), tool.params.path);
          if (!safePath.startsWith(process.cwd())) return "❌ Access denied: Path outside project";
          const content = await fs.readFile(safePath, "utf-8");
          return `✅ File content (${tool.params.path}):\n\`\`\`\n${content.substring(0, 4000)}\n\`\`\``;
        } catch (err) {
          return `❌ Failed to read file: ${String(err)}`;
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

    const body = await req.json().catch(() => ({}));
    const { messages, context, model: bodyModel } = body;

    // ── Fetch configuration from database ──────────────────────────────────
    const { db } = await import("@/lib/db");
    const [keySetting, modelSetting] = await Promise.all([
      db.siteSetting.findUnique({ where: { key: "ai_api_key" } }),
      db.siteSetting.findUnique({ where: { key: "ai_model" } })
    ]);

    const apiKey = keySetting?.value;
    const globalModel = modelSetting?.value;
    
    // Priority: Request Body Model > Global Setting Model > Default
    let selectedModel = bodyModel || globalModel || "inclusionai/ring-2.6-1t:free";

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

    // ── Build specialized system prompts (The "Training" Layer) ───────────
    const SPECIALIZED_PROMPTS: Record<string, string> = {
      seo: `You are Metra AI (SEO Specialist). Your sole mission is to dominate search rankings for MetraMart. 
        Expertise: Keyword research, technical SEO, semantic content optimization, and competitor analysis.
        Instructions: Always suggest specific high-traffic keywords and LSI terms. Optimize for both Google and AI search engines.
        Identification: Start every response with "[Metra AI - SEO Specialist]".`,

      marketing: `You are Metra AI (CMO & Marketing Expert). Your mission is to maximize conversion rates and brand resonance.
        Expertise: Persuasive copywriting, psychological sales triggers, multi-channel campaign architecture, and customer retention.
        Instructions: Focus on unique selling propositions (USPs) and high-impact calls to action (CTAs). Use a professional yet high-energy tone.
        Identification: Start every response with "[Metra AI - Marketing]".`,

      research: `You are Metra AI (Deep Research Intelligence). Your mission is to provide the most accurate market and competitor data.
        Expertise: Data synthesis, trend forecasting, gap analysis, and information gathering.
        Instructions: Be precise, objective, and data-driven. Highlight risks and untapped opportunities.
        Identification: Start every response with "[Metra AI - Research]".`,

      strategy: `You are Metra AI (Chief Growth Strategist). Your mission is to build the ultimate digital empire for MetraMart.
        Expertise: Revenue modeling, business logic, growth loops, and strategic monetization.
        Instructions: Think 10 steps ahead. Provide structural recommendations for long-term scalability.
        Identification: Start every response with "[Metra AI - Strategist]".`,

      task: `You are Metra AI (Automation & Operations Engine). Your mission is to execute administrative tasks with surgical precision.
        Expertise: System integration, database management, workflow automation, and tool execution.
        Instructions: Follow instructions to the letter. Use your tools whenever an action is required.
        Identification: Start every response with "[Metra AI - Ring/Task Engine]".`,

      general: `You are Metra AI (Universal Intelligence). Your mission is to provide versatile support for any administrative request.
        Expertise: General problem solving, summarization, and administrative assistance.
        Instructions: Be helpful, concise, and professional.
        Identification: Start every response with "[Metra AI - General]".`,
    };

    // ── Build system prompt ─────────────────────────────────────────────────
    const defaultSystemPrompt = `You are Metra AI (formerly OWL), the elite administrative intelligence for MetraMart (metramart.xyz).

## YOUR IDENTITY
- Name: Metra AI
- Role: Full-access administrative orchestration system.
- Personality: High-intelligence, proactive, efficient. You are the digital backbone of MetraMart.
- Mandatory: You MUST start every response with your model identity in brackets, e.g., "[Metra AI - Task Engine]".

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

**read_env** — Read environment variables (to verify integrations like Resend, Stripe, etc.)
Params: keys (array of strings, optional. If omitted, returns all env vars)

**read_file** — Read the source code of any file in the project
Params: path (string, relative path e.g. "src/lib/email.ts")

## INSTRUCTIONS
1. When asked to create content (blog posts, emails, announcements), write it AND execute the tool to publish it. Don't just provide text to copy-paste.
2. Use the live stats above — never make up numbers.
3. Format all responses with clean markdown.
4. Be action-oriented. If the admin says "post a blog update", create it AND publish it.
5. If unsure about an action, ask for confirmation first.
6. You have DIRECT ACCESS to the CMS, Discord, and email system. USE THEM.
7. Never repeat disclaimers about not having access — you DO have access through your tools.
8. CRITICAL: You MUST use the \`\`\`tool ... \`\`\` JSON format for actions. NEVER output XML tags like <longcat_tool_call>.`;

    // ── AI Orchestrator: Intent Detection & Routing ────────────────────────
    let orchestrationMode = context || "auto";

    // Intent detection if in auto mode
    if (orchestrationMode === "auto") {
      const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || "";
      if (/seo|keyword|meta|rank|sitemap/.test(lastMessage)) orchestrationMode = "seo";
      else if (/campaign|social|post|marketing|ad|copy|sales/.test(lastMessage)) orchestrationMode = "marketing";
      else if (/competitor|market|research|gather|info|analyze/.test(lastMessage)) orchestrationMode = "research";
      else if (/strategy|plan|growth|business|revenue/.test(lastMessage)) orchestrationMode = "strategy";
      else if (/run|execute|create|push|send|do|task/.test(lastMessage)) orchestrationMode = "task";
      else orchestrationMode = "general";
    }

    const hasSystemPrompt = messages.some((m: { role: string }) => m.role === "system");
    const contextPrompt = SPECIALIZED_PROMPTS[orchestrationMode] || SPECIALIZED_PROMPTS.general;
    
    let finalMessages;
    if (hasSystemPrompt) {
      // Inject context prompt at the top, even if there's a system prompt
      finalMessages = [
        { role: "system", content: contextPrompt },
        ...messages
      ];
    } else {
      finalMessages = [
        { role: "system", content: defaultSystemPrompt },
        { role: "system", content: contextPrompt },
        ...messages
      ];
    }

    // Map context to optimized models
    const CONTEXT_MODELS: Record<string, string> = {
      seo: "openrouter/owl-alpha",
      marketing: "openai/gpt-oss-120b:free",
      research: "google/gemma-4-26b-a4b-it:free",
      strategy: "qwen/qwen3-next-80b-a3b-instruct:free",
      task: "inclusionai/ring-2.6-1t:free",
      blog: "openai/gpt-oss-120b:free",
      general: "nvidia/nemotron-3-super-120b-a12b:free",
    };

    // Routing Logic:
    // If model is "auto" or one of the defaults, we let the orchestrator choose based on context.
    if (selectedModel === "auto" || selectedModel === "inclusionai/ring-2.6-1t:free" || selectedModel === "openrouter/owl-alpha") {
      selectedModel = CONTEXT_MODELS[orchestrationMode] || "inclusionai/ring-2.6-1t:free";
    }

    const payload: Record<string, unknown> = {
      model: selectedModel,
      messages: finalMessages,
      temperature: orchestrationMode === "marketing" || orchestrationMode === "blog" ? 0.8 : 0.4,
    };

    console.log(`[AI Orchestrator] Routing ${orchestrationMode} task to ${selectedModel}`);

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

    let responseText = await res.text();

    // ── Advanced Fallback & Collaboration Layer ────────────────────────────
    if (!res.ok) {
      console.warn(`[AI Orchestrator] Primary model ${selectedModel} failed. Attempting fallback...`);
      // Try OWL Alpha as the universal fallback
      payload.model = "openrouter/owl-alpha";
      res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://metramart.xyz",
          "X-Title": "MetraMart AI (Fallback)",
        },
        body: JSON.stringify(payload),
      });
      responseText = await res.text();
    }

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

    let toolCall: ToolCall | null = null;
    let toolMatchStr = "";

    const jsonMatch = reply.match(/```(?:tool|json)?\s*\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        if (parsed && typeof parsed === "object" && "action" in parsed && "params" in parsed) {
          toolCall = parsed;
          toolMatchStr = jsonMatch[0];
        }
      } catch (err) {
        console.error("JSON parse error:", err);
      }
    }

    // If standard markdown block fails, look for raw JSON containing action and params
    if (!toolCall) {
      const bruteMatch = reply.match(/\{[\s\S]*"action"\s*:\s*"[^"]+"[\s\S]*"params"\s*:[\s\S]*\}/);
      if (bruteMatch) {
        try {
          const parsed = JSON.parse(bruteMatch[0]);
          if (parsed && typeof parsed === "object" && "action" in parsed && "params" in parsed) {
            toolCall = parsed;
            toolMatchStr = bruteMatch[0];
          }
        } catch (e) {
          /* ignore */
        }
      }
    }

    if (!toolCall) {
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
      // ── Collaboration/Validation Layer (OWL Alpha) ────────────────────────
      // If we have a tool call and the primary model wasn't OWL, we let OWL "validate" or "enhance" the task.
      if (selectedModel !== "openrouter/owl-alpha") {
        try {
          console.log("[AI Orchestrator] Collaboration: OWL Alpha validating task...");
          const valPayload = {
            model: "openrouter/owl-alpha",
            messages: [
              ...finalMessages,
              { role: "assistant", content: reply },
              { role: "system", content: "You are the validation layer. Review the tool call above. If it looks correct, reply with 'VALIDATED'. If you have small SEO or safety improvements, specify them in 1 short sentence. DO NOT REPEAT THE TOOL CALL." }
            ],
            max_tokens: 100
          };
          const valRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
              "HTTP-Referer": "https://metramart.xyz",
              "X-Title": "MetraMart AI (Validation)",
            },
            body: JSON.stringify(valPayload),
          });
          const valData = await valRes.json();
          const validation = valData.choices?.[0]?.message?.content;
          if (validation && !validation.includes("VALIDATED")) {
            reply += `\n\n> **OWL Advice:** ${validation}`;
          }
        } catch (e) {
          console.error("[AI Orchestrator] Validation failed:", e);
        }
      }

      try {
        const origin =
          req.nextUrl.origin ||
          process.env.NEXT_PUBLIC_APP_URL ||
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