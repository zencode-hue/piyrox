import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
      return NextResponse.json({ success: false, message: 'Missing token or email' }, { status: 400 });
    }

    const res = await query(
      'SELECT id, plan FROM users WHERE email = $1 AND verification_token = $2',
      [email, token]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Invalid verification token' }, { status: 400 });
    }

    const user = res.rows[0];
    await query('UPDATE users SET is_verified = true, verification_token = NULL WHERE id = $1', [user.id]);

    const secret = process.env.JWT_SECRET!;
    const jwtToken = jwt.sign(
      { userId: user.id, email, plan: user.plan || 'free' },
      secret,
      { expiresIn: '7d' }
    );

    const response = NextResponse.redirect(new URL('/', req.url));
    response.cookies.set('token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
