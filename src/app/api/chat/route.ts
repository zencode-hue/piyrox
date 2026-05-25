import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import jwt from 'jsonwebtoken';

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

async function getUserIdFromToken(req: Request): Promise<number | null> {
  const authHeader = req.headers.get('authorization');
  const cookie = req.headers.get('cookie');

  let token: string | undefined;

  if (authHeader) {
    token = authHeader.split(' ')[1];
  }

  if (!token && cookie) {
    token = cookie.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1];
  }

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number };
    return decoded.userId;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const { messages, model, system_prompt } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ success: false, message: 'Invalid request' }, { status: 400 });
    }

    const userId = await getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const userResult = await query('SELECT plan, message_count, last_message_date FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    if (user.plan === 'free') {
      const today = new Date().toISOString().split('T')[0];
      if (user.last_message_date === today && user.message_count >= 20) {
        return NextResponse.json({ success: false, message: 'You have reached your daily message limit.' }, { status: 429 });
      }

      if (user.last_message_date === today) {
        await query('UPDATE users SET message_count = message_count + 1 WHERE id = $1', [userId]);
      } else {
        await query('UPDATE users SET message_count = 1, last_message_date = $1 WHERE id = $2', [today, userId]);
      }
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

    const finalSystemPrompt = system_prompt || getSystemPrompt(model);
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
              { role: 'system', content: finalSystemPrompt },
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
