import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 });
    }

    const res = await query(
      'SELECT id, name, password, plan, is_verified FROM users WHERE email = $1',
      [email]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Invalid email or password' }, { status: 401 });
    }

    const user = res.rows[0];
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

    if (user.password !== hashedPassword) {
      return NextResponse.json({ success: false, message: 'Invalid email or password' }, { status: 401 });
    }

    if (!user.is_verified) {
      return NextResponse.json({
        success: false,
        message: 'Please verify your email address before logging in. Check your inbox.',
      }, { status: 403 });
    }

    const secret = process.env.JWT_SECRET!;
    const token = jwt.sign(
      { userId: user.id, email, plan: user.plan || 'free' },
      secret,
      { expiresIn: '7d' }
    );

    const response = NextResponse.redirect(new URL('/', req.url));

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
