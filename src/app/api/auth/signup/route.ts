import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import crypto from 'crypto';
import { Resend } from 'resend';

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const resend = new Resend(process.env.RESEND_API_KEY);

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

// Send verification email
async function sendVerificationEmail(name: string, email: string, token: string) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/verify?token=${token}&email=${encodeURIComponent(email)}`;
  
  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'support@piyrox.sbs',
      to: email,
      subject: 'Verify your PiyRox account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to PiyRox, ${name}!</h2>
          <p>Thank you for signing up. Please verify your email address to activate your account.</p>
          <p>
            <a href="${verificationUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email
            </a>
          </p>
          <p>Or copy this link: <code>${verificationUrl}</code></p>
          <p>This link expires in 24 hours.</p>
          <hr />
          <p style="color: #666; font-size: 12px;">If you didn't create this account, please ignore this email.</p>
        </div>
      `
    });
    return true;
  } catch (error) {
    console.error('Failed to send verification email:', error);
    return false;
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

    // Send verification email
    const emailSent = await sendVerificationEmail(name, email, verificationToken);

    return NextResponse.json({
      success: true,
      message: emailSent 
        ? 'Account created! Check your email to verify your account.' 
        : 'Account created! Please check your email (or spam folder) to verify.',
      user: { name, email },
      emailSent
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred during signup. Please try again.' },
      { status: 500 }
    );
  }
}

