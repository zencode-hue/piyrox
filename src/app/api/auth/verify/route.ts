import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
      return NextResponse.json({ success: false, message: 'Missing token or email' }, { status: 400 });
    }

    const res = await query(
      'SELECT id, is_verified FROM users WHERE email = $1 AND verification_token = $2',
      [email, token]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Invalid verification token' }, { status: 400 });
    }

    await query('UPDATE users SET is_verified = true WHERE id = $1', [res.rows[0].id]);

    return NextResponse.redirect(new URL('/login?verified=true', req.url));
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
