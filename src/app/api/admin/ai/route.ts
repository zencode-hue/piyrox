import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

const TOOL_DEFINITIONS = `
## AVAILABLE TOOLS (Total Control)
Respond with a JSON tool call block for any action:
\`\`\`tool
{ "action": "ACTION_NAME", "params": { ... } }
\`\`\`

ACTIONS:
1. create_blog_post: title, content (markdown), excerpt, category, emoji.
2. push_discord_deals: No params. Pushes daily highlights.
3. send_discord_message: message (string). Custom announcements.
4. send_email: audience ("all"|"customers"|"guests"), subject, message (PLAIN TEXT), customEmail, preview (bool).
5. run_db_query: model ("user"|"order"|"product"), action ("findMany"|"create"|"update"|"delete"), args (Prisma object).
6. call_api: url, method (default POST), body.
7. read_env: keys (optional array).
8. read_file: path (string).
`;

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
  const bypassHeaders = { 
    "Content-Type": "application/json", 
    "X-Internal-AI-Bypass": "1",
    "cookie": "__internal_ai_bypass=1"
  };

  switch (tool.action) {
    case "create_blog_post": {
      const res = await fetch(`${origin}/api/admin/blog`, {
        method: "POST",
        headers: bypassHeaders,
        body: JSON.stringify(tool.params),
      });
      const data = await res.json();
      if (!res.ok) return `❌ Blog failed: ${data.error ?? "Unknown error"}`;
      return `✅ Blog post created: ${data.data?.slug}`;
    }

    case "push_discord_deals": {
      const res = await fetch(`${origin}/api/admin/discord-push?type=deals`, {
        method: "POST",
        headers: bypassHeaders,
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
        const dbModel = (db as any)[model];
        if (!dbModel || typeof dbModel[action] !== "function") return `❌ Invalid model/action: ${model}.${action}`;
        const result = await dbModel[action](args);
        return `✅ Success: ${JSON.stringify(result, null, 2).substring(0, 1500)}`;
      } catch (err) { return `❌ DB Error: ${String(err)}`; }
    }

    case "call_api": {
      try {
        let { method = "POST" } = tool.params;
        const { url, headers = {}, body } = tool.params;
        const finalUrl = url.startsWith("/") ? `${origin}${url}` : url;
        const fetchOpts: RequestInit = {
          method,
          headers: { ...headers, ...bypassHeaders },
        };
        if (body) fetchOpts.body = typeof body === "string" ? body : JSON.stringify(body);
        const res = await fetch(finalUrl, fetchOpts);
        const text = await res.text();
        return `✅ API Response (${res.status}): ${text.substring(0, 1500)}`;
      } catch (err) { return `❌ API Error: ${String(err)}`; }
    }

    case "read_env": {
      try {
        const keys = tool.params.keys;
        if (Array.isArray(keys)) {
          const result: Record<string, string> = {};
          for (const k of keys) result[k] = process.env[k] || "";
          return `✅ Env: ${JSON.stringify(result, null, 2)}`;
        }
        return `✅ Env (Partial): ${JSON.stringify(process.env, null, 2).substring(0, 2000)}`;
      } catch (err) { return `❌ Env Error: ${String(err)}`; }
    }

    case "read_file": {
      try {
        const fs = await import("fs/promises");
        const path = await import("path");
        const safePath = path.resolve(process.cwd(), tool.params.path);
        if (!safePath.startsWith(process.cwd())) return "❌ Access denied";
        const content = await fs.readFile(safePath, "utf-8");
        return `✅ File (${tool.params.path}):\n${content.substring(0, 3000)}`;
      } catch (err) { return `❌ File Error: ${String(err)}`; }
    }

    default:
      return `❌ Unknown action: ${tool.action}`;
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

    const { db } = await import("@/lib/db");
    const [keySetting, modelSetting] = await Promise.all([
      db.siteSetting.findUnique({ where: { key: "ai_api_key" } }),
      db.siteSetting.findUnique({ where: { key: "ai_model" } })
    ]);

    const apiKey = keySetting?.value;
    const globalModel = modelSetting?.value;
    let selectedModel = bodyModel || globalModel || "inclusionai/ring-2.6-1t:free";

    if (!apiKey) {
      return NextResponse.json({ error: "API key is required." }, { status: 400 });
    }

    const [userCount, orderCount, lowStockCount, activeProducts, revenue, recentOrders, topProducts] = await Promise.all([
      db.user.count(),
      db.order.count(),
      db.product.count({ where: { stock: { lte: 5 } } }),
      db.product.count({ where: { isActive: true } }),
      db.order.aggregate({ _sum: { amount: true }, where: { status: "PAID" } }),
      db.order.findMany({ take: 10, orderBy: { createdAt: "desc" }, include: { user: true } }),
      db.product.findMany({ take: 8, where: { isActive: true }, orderBy: { orders: { _count: "desc" } } })
    ]);

    const recentOrdersSummary = recentOrders.map(o => `• ${o.id.slice(0,8)} | $${Number(o.amount).toFixed(2)} | ${o.status} | ${o.user?.email || "Guest"} | ${new Date(o.createdAt).toLocaleDateString()}`).join("\n");
    const topProductsList = topProducts.map(p => `• ${p.title} | $${Number(p.price).toFixed(2)} | ${p.category}`).join("\n");
    const totalRevenue = revenue._sum?.amount ?? 0;

    const BRAND_BIBLE = `
NAME: MetraMart
URL: https://metramart.xyz
SLOGAN: The World's #1 Premium Digital Marketplace
INVENTORY: 
- Streaming: Netflix Premium (4K), Spotify Family/Individual, YouTube Premium (No Ads), Disney+, Hulu, Apple TV+, Paramount+.
- AI Tools: ChatGPT Plus (GPT-4), Claude Pro, Midjourney (Basic/Standard), Jasper AI.
- Software: Microsoft Windows 10/11 Pro Keys, Office 2021/365, Adobe Creative Cloud.
- Gaming: Xbox Game Pass Ultimate, Steam Wallet Gift Cards, PlayStation Plus.
- VPNs: NordVPN, ExpressVPN, Surfshark.
IDENTITY RULES:
1. NEVER mention "Velxo".
2. NEVER say "I am an AI model" or mention "GPT-4", "Ring", or "Llama". 
3. You are Metra AI, the internal brain of MetraMart.
4. NEVER use placeholders like "[Brand Name]" or "[Your Product]". Use "MetraMart" and specific items from the inventory list above.
`;

    const FORMATTING_RULES = `
- EMAILS: Use PLAIN TEXT ONLY. NO asterisks (*), NO hashtags (#), NO bold (**). Use line breaks for structure.
- SOCIAL MEDIA: Use EMOJIS for structure. NO headers (#). NO bold (**).
- ADMIN CHAT: Markdown is allowed for internal readability.
`;

    const SPECIALIZED_PROMPTS: Record<string, string> = {
      seo: `${BRAND_BIBLE}
        You are the Metra AI SEO Specialist. Your job is to rank MetraMart products on Page 1.
        Training: You use LSI keywords, analyze search intent, and write meta tags that trigger high CTR.
        Action: Provide keyword-rich titles and descriptions. Identify semantic gaps.
        ID: [Metra AI - SEO Specialist]`,

      marketing: `${BRAND_BIBLE} ${FORMATTING_RULES}
        You are the Metra AI CMO. You write copy that SELLS.
        Training: You use AIDA framework. You focus on FOMO and urgency.
        Action: Generate creative, non-generic social posts and email campaigns.
        ID: [Metra AI - Marketing]`,

      strategy: `${BRAND_BIBLE}
        You are the Metra AI Strategist. You maximize revenue.
        Training: You understand churn rates, upsells, and cross-sells.
        Action: Suggest pricing adjustments and loyalty programs.
        ID: [Metra AI - Strategist]`,

      task: `${BRAND_BIBLE}
        You are the Metra AI Task Engine. You execute admin operations.
        Training: You prioritize precision. You confirm actions. You never make up data.
        Action: Create blogs, push discord deals, and manage stock.
        ID: [Metra AI - Task Engine]`,

      general: `${BRAND_BIBLE}
        You are Metra AI General Intelligence.
        Training: You are helpful, polite, and deeply knowledgeable about MetraMart operations.
        ID: [Metra AI - General]`,
    };

    const defaultSystemPrompt = `You are Metra AI, the total-control administrative brain for MetraMart.
${BRAND_BIBLE}
${FORMATTING_RULES}
${TOOL_DEFINITIONS}

LIVE STATS:
- Users: ${userCount} | Orders: ${orderCount} | Revenue: $${Number(totalRevenue).toFixed(2)}
- Inventory: ${activeProducts} Active | ${lowStockCount} Low Stock Alert!
- Top Sellers:
${topProductsList}
- Recent Activity:
${recentOrdersSummary}

MANDATORY: Identify yourself in brackets at the start of every reply. NEVER mention Velxo. NEVER use [Your Brand] or other placeholders. You ARE MetraMart.`;

    let orchestrationMode = context || "auto";
    if (orchestrationMode === "auto") {
      const lastMsg = messages[messages.length - 1]?.content?.toLowerCase() || "";
      if (/seo|keyword|meta|rank/.test(lastMsg)) orchestrationMode = "seo";
      else if (/campaign|social|post|market/.test(lastMsg)) orchestrationMode = "marketing";
      else if (/strategy|plan|growth/.test(lastMsg)) orchestrationMode = "strategy";
      else if (/run|execute|push|send|task/.test(lastMsg)) orchestrationMode = "task";
      else orchestrationMode = "general";
    }

    const contextPrompt = SPECIALIZED_PROMPTS[orchestrationMode] || SPECIALIZED_PROMPTS.general;
    const hasSystemPrompt = messages.some((m: { role: string }) => m.role === "system");
    
    let finalMessages;
    if (hasSystemPrompt) {
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