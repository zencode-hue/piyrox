
import { NextResponse } from 'next/server';

const MODEL_CHAINS: Record<string, string[]> = {
  'piyrox-4': [
    'meta-llama/llama-3.3-70b-instruct:free',
    'openai/gpt-oss-120b:free',
    'qwen/qwen3-next-80b-a3b-instruct:free',
    'arcee-ai/trinity-large-thinking:free',
    'openrouter/owl-alpha',
  ],
  'piyrox-4o': [
    'z-ai/glm-4.5-air:free',
    'liquid/lfm-2.5-1.2b-instruct:free',
  ],
  'piyrox-3.5': [
    'minimax/minimax-m2.5:free',
    'poolside/laguna-xs.2:free',
  ],
  'jarvis-v3': [
    'qwen/qwen3-coder:free',
  ],
};

export async function POST(req: Request) {
  try {
    const { messages, model, prompt } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ success: false, message: 'Invalid request' }, { status: 400 });
    }

    const referer = req.headers.get('referer');
    const siteUrl = referer ? new URL(referer).origin : 'https://chat.piyrox.sbs';

    const openrouterKey = process.env.OPENROUTER_API_KEY || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
    
    if (!openrouterKey) {
      return NextResponse.json({ 
        success: false, 
        message: 'OpenRouter API key not configured.' 
      }, { status: 500 });
    }

    const systemPrompt = getSystemPrompt(model);
    const modelChain = MODEL_CHAINS[model] || MODEL_CHAINS['piyrox-4o'];

    let lastError: any = null;

    for (const modelToUse of modelChain) {
      try {
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openrouterKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': siteUrl,
            'X-Title': 'PiyRox Chat',
          },
          body: JSON.stringify({
            model: modelToUse,
            messages: [
              { role: 'system', content: systemPrompt },
              ...messages.filter((m: { role: string }) => m.role !== 'system'),
            ],
            max_tokens: 2048,
            temperature: 0.7,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.choices?.[0]?.message?.content) {
            return NextResponse.json({ 
              success: true, 
              content: data.choices[0].message.content,
              usedModel: modelToUse,
            });
          }
        }
        lastError = await res.text();
      } catch (error) {
        lastError = error;
      }
    }

    console.error('All models in chain failed. Last error:', lastError);
    return NextResponse.json({ success: false, message: 'Our AI servers are currently overloaded. Please try again in a few moments.' }, { status: 503 });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

function getSystemPrompt(model: string): string {
  const modelNames: Record<string, string> = {
    'piyrox-4': 'PiyRox-4',
    'piyrox-4o': 'PiyRox-4o',
    'piyrox-3.5': 'PiyRox-3.5',
    'jarvis-v3': 'Jarvis V3',
  };

  const modelName = modelNames[model] || 'PiyRox AI';
  
  return `You are ${modelName}, an advanced AI assistant created by PiyRox. You are intelligent, helpful, and direct.

CORE TRAITS:
- Be concise but thorough
- Provide accurate, factual information
- Use clear formatting and structure
- Ask clarifying questions when needed
- Admit uncertainty rather than guessing

CAPABILITIES:
- Write, debug, and optimize code in any language
- Explain complex concepts clearly
- Analyze data and identify patterns
- Provide creative solutions
- Help with writing, research, and analysis
- Answer questions across all domains

RESPONSE STYLE:
- Start with the most important information
- Use bullet points for lists
- Use code blocks for code snippets
- Format with markdown when helpful
- Be conversational but professional
- Provide examples when relevant

Always prioritize accuracy and helpfulness.`;
}
