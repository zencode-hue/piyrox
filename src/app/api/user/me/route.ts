import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET!;
    const payload = jwt.verify(token, secret) as { userId: number; email: string; plan: string };

    const res = await query(
      'SELECT id, name, email, plan FROM users WHERE id = $1',
      [payload.userId]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const user = res.rows[0];
    return NextResponse.json({
      success: true,
      data: { id: user.id, name: user.name, email: user.email, plan: user.plan || 'free' },
    });
  } catch {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
}
