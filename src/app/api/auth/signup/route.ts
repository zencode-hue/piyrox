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
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 8 characters' },
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

    // Hash password using SHA256 (for production, use bcrypt)
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    
    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const client = await pool.connect();
    try {
      await client.query(
        'INSERT INTO users (name, email, password, is_verified, verification_token) VALUES ($1, $2, $3, $4, $5)',
        [name, email, hashedPassword, false, verificationToken]
      );
    } catch (e: any) {
      if (e.code === '23505') { // Unique violation
        return NextResponse.json(
          { success: false, message: 'Email already registered' },
          { status: 400 }
        );
      }
      throw e;
    } finally {
      client.release();
    }

    return NextResponse.json({
      success: true,
      message: 'Account created successfully! You can now log in.',
      user: { name, email }
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred during signup. Please try again.' },
      { status: 500 }
    );
  }
}

