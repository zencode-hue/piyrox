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
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://piyrox.sbs'}/api/auth/verify?token=${token}&email=${encodeURIComponent(email)}`;
  
  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'support@piyrox.sbs',
      to: email,
      subject: 'Verify your PiyRox account',
      html: `
        <div style="font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #09090b; padding: 40px; border-radius: 16px; color: #ffffff; border: 1px solid #27272a;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="background: linear-gradient(to right, #3b82f6, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 32px; font-weight: 800; margin: 0;">PiyRox</h1>
          </div>
          <h2 style="font-size: 22px; font-weight: 600; margin-bottom: 16px; color: #ffffff;">Welcome aboard, ${name}!</h2>
          <p style="color: #a1a1aa; line-height: 1.6; margin-bottom: 32px; font-size: 16px;">
            You're one step away from unlocking the ultimate AI development ecosystem. Please verify your email address to activate your account and start building the future.
          </p>
          <div style="text-align: center; margin-bottom: 32px;">
            <a href="${verificationUrl}" style="background: linear-gradient(135deg, #2563eb, #7c3aed); color: #ffffff; padding: 16px 36px; text-decoration: none; border-radius: 12px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 4px 20px rgba(99, 102, 241, 0.3);">
              Verify Email Address
            </a>
          </div>
          <p style="color: #71717a; font-size: 14px; text-align: center; margin-bottom: 12px;">
            Or copy and paste this link into your browser:
          </p>
          <div style="background-color: #18181b; padding: 16px; border-radius: 8px; border: 1px solid #27272a; word-break: break-all;">
            <code style="color: #60a5fa; font-size: 13px;">${verificationUrl}</code>
          </div>
          <div style="margin-top: 40px; border-top: 1px solid #27272a; padding-top: 24px;">
            <p style="color: #71717a; font-size: 13px; text-align: center; margin: 0;">
              This secure link will expire in 24 hours. If you didn't create a PiyRox account, you can safely ignore this email.
            </p>
          </div>
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

