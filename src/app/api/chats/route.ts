import { NextResponse } from 'next/server';
import { query, initDb } from '@/lib/db';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

// Initialize the database and create tables if they don't exist
initDb().catch(console.error);

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as any;
    return decoded.userId;
  } catch (e) {
    return null;
  }
}

export async function GET() {
  try {
    const userId = await getUser();
    let res;
    if (userId) {
      res = await query('SELECT * FROM chats WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    } else {
      // For anonymous users, we don't return server-side chats
      return NextResponse.json({ success: true, chats: [] });
    }
    return NextResponse.json({ success: true, chats: res.rows });
  } catch (error) {
    console.error('Fetch chats error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch chats' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getUser();
    const chat = await req.json();

    if (!chat.id || !chat.title) {
      return NextResponse.json({ success: false, message: 'Invalid chat data' }, { status: 400 });
    }

    // Upsert chat
    const existing = await query('SELECT id FROM chats WHERE id = $1', [chat.id]);
    
    if (existing.rows.length > 0) {
      await query(
        'UPDATE chats SET title = $1, messages = $2, user_id = $3 WHERE id = $4',
        [chat.title, JSON.stringify(chat.messages || []), userId || null, chat.id]
      );
    } else {
      await query(
        'INSERT INTO chats (id, user_id, title, messages, created_at) VALUES ($1, $2, $3, $4, $5)',
        [chat.id, userId || null, chat.title, JSON.stringify(chat.messages || []), chat.createdAt || Date.now()]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Save chat error:', error);
    return NextResponse.json({ success: false, message: 'Failed to save chat' }, { status: 500 });
  }
}
