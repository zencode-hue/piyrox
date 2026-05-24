import { NextResponse } from 'next/server';

const FREE_MODELS: Record<string, string> = {
  'piyrox-4': 'google/gemma-2-9b-it:free',
  'piyrox-4o': 'meta-llama/llama-3.1-8b-instruct:free',
  'piyrox-3.5': 'mistralai/mistral-7b-instruct:free',
  'jarvis-v3': 'qwen/qwen-2.5-coder-32b-instruct:free',
};

// Code-specific free models (better for coding)
const CODE_FREE_MODELS: Record<string, string> = {
  'piyrox-4': 'qwen/qwen-2.5-coder-32b-instruct:free',
  'piyrox-4o': 'meta-llama/llama-3.1-8b-instruct:free',
  'piyrox-3.5': 'mistralai/mistral-7b-instruct:free',
  'jarvis-v3': 'qwen/qwen-2.5-coder-32b-instruct:free',
};

export async function POST(req: Request) {
  try {
    const { messages, model, prompt } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ success: false, message: 'Invalid request' }, { status: 400 });
    }

    // Try both env var names for compatibility
    const openrouterKey = process.env.OPENROUTER_API_KEY || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
    
    if (!openrouterKey) {
      console.error('OpenRouter API key not found in environment variables');
      return NextResponse.json({ 
        success: false, 
        message: 'OpenRouter API key not configured. Please set OPENROUTER_API_KEY environment variable.' 
      }, { status: 500 });
    }

    // Detect if this is a coding-related request
    const isCodingRequest = isCodingPrompt(prompt || messages[0]?.content || '');

    // Select appropriate free model based on user selection and request type
    let selectedModel = FREE_MODELS[model] || FREE_MODELS['piyrox-4o'];
    
    // If coding request, use better free model
    if (isCodingRequest) {
      selectedModel = CODE_FREE_MODELS[model] || CODE_FREE_MODELS['piyrox-4o'];
    }

    // Build system prompt based on model
    const systemPrompt = getSystemPrompt(model);

    let res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openrouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://chat.piyrox.sbs',
        'X-Title': 'PiyRox Chat',
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.filter((m: { role: string }) => m.role !== 'system'),
        ],
        max_tokens: 2048,
        temperature: 0.7,
      }),
    });

    // Fallback if the provider fails
    if (!res.ok) {
      console.error(`Primary model failed, falling back to backup model...`);
      res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openrouterKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://chat.piyrox.sbs',
          'X-Title': 'PiyRox Chat',
        },
        body: JSON.stringify({
          model: 'mistralai/mistral-7b-instruct:free',
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.filter((m: { role: string }) => m.role !== 'system'),
          ],
          max_tokens: 1024,
        }),
      });
    }

    if (!res.ok) {
      console.error(`OpenRouter API responded with status: ${res.status}`);
      let errorText = await res.text();
      try {
        const errJson = JSON.parse(errorText);
        errorText = errJson.error?.message || errorText;
      } catch (e) {
        // Not JSON
      }
      return NextResponse.json({ success: false, message: `Our AI servers are currently overloaded. Please try again in a few moments.` }, { status: 503 });
    }

    let data;
    try {
      data = await res.json();
    } catch (e) {
      console.error('Failed to parse OpenRouter response:', e);
      return NextResponse.json({ success: false, message: 'Invalid response from API' }, { status: 502 });
    }

    if (data.error) {
      console.error('OpenRouter error:', data.error);
      return NextResponse.json({ success: false, message: data.error.message || 'API error' }, { status: 400 });
    }

    if (data.choices?.[0]?.message?.content) {
      return NextResponse.json({ 
        success: true, 
        content: data.choices[0].message.content,
        usedModel: selectedModel,
      });
    }

    return NextResponse.json({ success: false, message: 'No response generated' }, { status: 500 });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

function isCodingPrompt(text: string): boolean {
  const codingKeywords = [
    'code', 'function', 'program', 'script', 'python', 'javascript', 'typescript',
    'java', 'c++', 'c#', 'ruby', 'php', 'swift', 'kotlin', 'rust', 'golang',
    'react', 'node', 'express', 'django', 'flask', 'angular', 'vue', 'svelte',
    'database', 'sql', 'api', 'backend', 'frontend', 'fullstack', 'debug',
    'bug', 'error', 'fix', 'implement', 'algorithm', 'data structure'
  ];
  
  const lowerText = text.toLowerCase();
  return codingKeywords.some(keyword => lowerText.includes(keyword));
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
