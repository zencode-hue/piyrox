import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages, model } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ success: false, message: 'Invalid request' }, { status: 400 });
    }

    const openaiKey = process.env.OPENAI_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    // Route to appropriate model
    if (model === 'jarvis-v3' && anthropicKey) {
      // Anthropic Claude
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 4096,
          system: 'You are Jarvis V3, an advanced AI assistant by PiyRox AI Lab. You are helpful, precise, and thoughtful.',
          messages: messages.filter((m: { role: string }) => m.role !== 'system'),
        }),
      });
      const data = await res.json();
      if (data.content?.[0]?.text) {
        return NextResponse.json({ success: true, content: data.content[0].text });
      }
    }

    if (openaiKey) {
      // OpenAI
      const modelMap: Record<string, string> = {
        'piyrox-4': 'gpt-4o',
        'piyrox-4o': 'gpt-4o-mini',
        'piyrox-3.5': 'gpt-3.5-turbo',
        'jarvis-v3': 'gpt-4o',
      };
      const openaiModel = modelMap[model] || 'gpt-4o-mini';

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${openaiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: openaiModel,
          messages: [
            {
              role: 'system',
              content: `You are ${model === 'jarvis-v3' ? 'Jarvis V3' : model.toUpperCase()}, an advanced AI assistant by PiyRox AI Lab. You are helpful, precise, and thoughtful. Format responses with markdown when appropriate.`,
            },
            ...messages,
          ],
          max_tokens: 4096,
          temperature: 0.7,
        }),
      });
      const data = await res.json();
      if (data.choices?.[0]?.message?.content) {
        return NextResponse.json({ success: true, content: data.choices[0].message.content });
      }
    }

    // Fallback demo response
    const demoResponses: Record<string, string> = {
      'piyrox-4': "I'm **PiyRox-4**, the most capable model in the PiyRox lineup. To enable real AI responses, add your `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` to the environment variables.\n\nI'm currently running in demo mode — but once connected, I can help with coding, analysis, writing, research, and much more.",
      'piyrox-4o': "I'm **PiyRox-4o**, optimized for speed and intelligence. Add your `OPENAI_API_KEY` to the environment to enable real responses.",
      'jarvis-v3': "I'm **Jarvis V3**, PiyRox's advanced reasoning model. Add your `ANTHROPIC_API_KEY` to enable Claude-powered responses.",
      'piyrox-3.5': "I'm **PiyRox-3.5**, fast and efficient for everyday tasks. Add your `OPENAI_API_KEY` to enable real responses.",
    };

    return NextResponse.json({
      success: true,
      content: demoResponses[model] || "I'm a PiyRox AI assistant. Configure your API keys to enable real responses.",
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
