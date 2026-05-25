
import { NextResponse } from 'next/server';

const IMAGE_MODEL = 'getimg.ai/stable-diffusion-xl-v2-2';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ success: false, message: 'Prompt is required' }, { status: 400 });
    }

    const openrouterKey = process.env.OPENROUTER_API_KEY || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
    
    if (!openrouterKey) {
      console.error('OpenRouter API key not found');
      return NextResponse.json({ success: false, message: 'API key not configured' }, { status: 500 });
    }

    const res = await fetch('https://openrouter.ai/api/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openrouterKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: IMAGE_MODEL,
        prompt: prompt,
        n: 1,
        size: '1024x1024',
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Image generation failed. Status: ${res.status}. Response: ${errorText}`);
      return NextResponse.json({ success: false, message: 'Image generation failed.' }, { status: res.status });
    }

    const data = await res.json();
    const imageUrl = data.data?.[0]?.url;

    if (imageUrl) {
      return NextResponse.json({ success: true, url: imageUrl });
    } else {
      console.error('Invalid response from image API:', data);
      return NextResponse.json({ success: false, message: 'Failed to get image from API response' }, { status: 502 });
    }

  } catch (error) {
    console.error('Image API error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
