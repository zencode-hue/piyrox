import { NextResponse } from 'next/server';

// OpenRouter model mapping based on task type
const MODEL_MAP: Record<string, string> = {
  'piyrox-4': 'openai/gpt-4o-2024-11-20',
  'piyrox-4o': 'openai/gpt-4o-mini',
  'piyrox-3.5': 'openai/gpt-3.5-turbo',
  'jarvis-v3': 'anthropic/claude-3-5-sonnet-20241022',
};

// Code-specific models (higher quality for coding)
const CODE_MODELS: Record<string, string> = {
  'piyrox-4': 'openai/gpt-4o-2024-11-20',
  'piyrox-4o': 'openai/gpt-4o-2024-11-20',
  'piyrox-3.5': 'openai/gpt-4o-mini',
  'jarvis-v3': 'anthropic/claude-3-5-sonnet-20241022',
};

export async function POST(req: Request) {
  try {
    const { messages, model, prompt } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ success: false, message: 'Invalid request' }, { status: 400 });
    }

    const openrouterKey = process.env.OPENROUTER_API_KEY;
    if (!openrouterKey) {
      return NextResponse.json({ success: false, message: 'OpenRouter API key not configured' }, { status: 500 });
    }

    // Detect if this is a coding-related request
    const isCodingRequest = isCodingPrompt(prompt || messages[0]?.content || '');

    // Select appropriate model based on user selection and request type
    let selectedModel = MODEL_MAP[model] || MODEL_MAP['piyrox-4o'];
    
    // If coding request and user selected a lower-tier model, upgrade to better model
    if (isCodingRequest && (model === 'piyrox-3.5' || model === 'piyrox-4o')) {
      selectedModel = CODE_MODELS[model] || CODE_MODELS['piyrox-4o'];
    }

    // Build system prompt based on model
    const systemPrompt = getSystemPrompt(model);

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openrouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://piyrox.sbs',
        'X-Title': 'PiyRox Chat',
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.filter((m: { role: string }) => m.role !== 'system'),
        ],
        max_tokens: 4096,
        temperature: 0.7,
      }),
    });

    const data = await res.json();

    if (data.error) {
      return NextResponse.json({ success: false, message: data.error.message }, { status: 400 });
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
  
  return `You are ${modelName}, an advanced AI assistant by PiyRox AI Lab. 

You are helpful, precise, thoughtful, and knowledgeable. You can:
- Write and debug code in multiple programming languages
- Analyze data and provide insights
- Write and edit various types of content
- Answer questions on a wide range of topics
- Help with complex reasoning and problem-solving

Format your responses using markdown when appropriate. Use code blocks for code snippets. Be concise but thorough.`;
}
