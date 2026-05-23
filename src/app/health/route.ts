import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: {
      hasOpenRouter: !!process.env.OPENROUTER_API_KEY,
      hasDatabase: !!process.env.SUPABASE_DB_URL,
      hasJWT: !!process.env.JWT_SECRET,
      hasResend: !!process.env.RESEND_API_KEY,
    }
  });
}
