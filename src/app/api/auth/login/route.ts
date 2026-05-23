import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import crypto from 'crypto';

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Initialize database tables
async function initDb() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        plan VARCHAR(50) DEFAULT 'free',
        is_verified BOOLEAN DEFAULT FALSE,
        verification_token VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  } finally {
    client.release();
  }
}

export async function POST(req: Request) {
  try {
    await initDb();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Hash password for comparison
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT id, name, email, plan, is_verified FROM users WHERE email = $1 AND password = $2',
        [email, hashedPassword]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { success: false, message: 'Invalid email or password' },
          { status: 401 }
        );
      }

      const user = result.rows[0];

      // Check if email is verified
      if (!user.is_verified) {
        return NextResponse.json(
          { success: false, message: 'Please verify your email before logging in', verified: false },
          { status: 403 }
        );
      }

      // Create response with user data
      const response = NextResponse.json({
        success: true,
        message: 'Login successful!',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          plan: user.plan
        }
      });

      // Set auth cookie
      response.cookies.set('auth_token', JSON.stringify(user), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 // 7 days
      });

      return response;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred during login. Please try again.' },
      { status: 500 }
    );
  }
}
