import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';

async function getUserIdFromToken(req: Request): Promise<number | null> {
  const authHeader = req.headers.get('authorization');
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number };
        return decoded.userId;
      } catch (error) {
        console.error('Error verifying token:', error);
      }
    }
  }

  // Fallback to cookie
  const cookie = req.headers.get('cookie');
  if (cookie) {
    const token = cookie.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number };
        return decoded.userId;
      } catch (error) {
        console.error('Error verifying token:', error);
      }
    }
  }



  return null;
}

export async function GET(req: Request) {
  try {
    const userId = await getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const res = await query(
      'SELECT name, email, plan, message_count, last_message_date FROM users WHERE id = $1',
      [userId]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: res.rows[0] });
  } catch (error) {
    console.error('Profile error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
