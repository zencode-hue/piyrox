import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export async function GET(req: Request) {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT id, name, email, plan, is_verified, created_at FROM users ORDER BY created_at DESC'
      );

      return NextResponse.json({
        success: true,
        users: result.rows
      });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Admin users error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred' },
      { status: 500 }
    );
  }
}
