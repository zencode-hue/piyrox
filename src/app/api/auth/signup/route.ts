import { NextResponse } from 'next/server';
import { query, initDb } from '@/lib/db';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    await initDb();
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 });
    }

    // Hash password
    // Basic hash for demonstration, use bcrypt in production
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    
    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    try {
      await query(
        'INSERT INTO users (name, email, password, is_verified, verification_token) VALUES ($1, $2, $3, $4, $5)',
        [name, email, hashedPassword, false, verificationToken]
      );
    } catch (e: any) {
      if (e.code === '23505') { // Unique violation in Postgres
        return NextResponse.json({ success: false, message: 'Email already exists' }, { status: 400 });
      }
      throw e;
    }

    // Send Verification Email via Resend
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      const verifyLink = `https://piyrox.sbs/api/auth/verify?token=${verificationToken}&email=${encodeURIComponent(email)}`;
      
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'PiyRox <' + process.env.RESEND_FROM_EMAIL + '>',
          to: [email],
          subject: 'Verify your PiyRox Account',
          html: `
            <h2>Welcome to PiyRox, ${name}!</h2>
            <p>Please click the link below to verify your account and complete your registration:</p>
            <a href="${verifyLink}" style="display:inline-block;padding:10px 20px;background:#2a8af6;color:#fff;text-decoration:none;border-radius:5px;">Verify My Account</a>
          `
        })
      });
    }

    return NextResponse.json({ success: true, message: 'Registration successful! Please check your email to verify your account.' });
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
