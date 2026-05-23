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
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT id, name, is_verified FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { success: false, message: 'Email not found' },
          { status: 404 }
        );
      }

      const user = result.rows[0];

      if (user.is_verified) {
        return NextResponse.json(
          { success: false, message: 'Email is already verified' },
          { status: 400 }
        );
      }

      // Generate new verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');

      // Update token in database
      await client.query(
        'UPDATE users SET verification_token = $1 WHERE email = $2',
        [verificationToken, email]
      );

      // Send verification email
      const emailSent = await sendVerificationEmail(user.name, email, verificationToken);

      return NextResponse.json({
        success: true,
        message: emailSent 
          ? 'Verification email sent! Check your inbox.' 
          : 'Failed to send email. Please try again.',
        emailSent
      });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Resend error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
