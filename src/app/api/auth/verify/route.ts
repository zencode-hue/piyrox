import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
      return NextResponse.redirect(new URL('/login?error=invalid_link', req.url));
    }

    const res = await query(
      'SELECT id FROM users WHERE email = $1 AND verification_token = $2',
      [email, token]
    );

    if (res.rows.length === 0) {
      return NextResponse.redirect(new URL('/login?error=invalid_token', req.url));
    }

    await query(
      'UPDATE users SET is_verified = TRUE, verification_token = NULL WHERE email = $1',
      [email]
    );

    return NextResponse.redirect(new URL('/login?verified=true', req.url));
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.redirect(new URL('/login?error=server_error', req.url));
  }
}
