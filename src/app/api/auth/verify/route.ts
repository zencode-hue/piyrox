import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
      return NextResponse.redirect(new URL('/login?error=invalid_link', req.url));
    }

    const client = await pool.connect();
    try {
      const res = await client.query(
        'SELECT id FROM users WHERE email = $1 AND verification_token = $2',
        [email, token]
      );

      if (res.rows.length === 0) {
        return NextResponse.redirect(new URL('/login?error=invalid_token', req.url));
      }

      await client.query(
        'UPDATE users SET is_verified = TRUE, verification_token = NULL WHERE email = $1',
        [email]
      );

      return NextResponse.redirect(new URL('/login?verified=true', req.url));
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.redirect(new URL('/login?error=server_error', req.url));
  }
}
