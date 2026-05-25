import { NextResponse } from 'next/server';
import { query, initDb } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    await initDb();
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const verificationToken = nanoid(32);

    try {
      await query(
        'INSERT INTO users (name, email, password, is_verified, verification_token) VALUES ($1, $2, $3, $4, $5)',
        [name, email, hashedPassword, false, verificationToken]
      );
    } catch (e: any) {
      if (e.code === '23505') { // Unique violation for email
        return NextResponse.json({ success: false, message: 'Email already exists' }, { status: 409 });
      }
      throw e;
    }

    const verifyLink = `https://piyrox.sbs/api/auth/verify?token=${verificationToken}`;
    
    await resend.emails.send({
      from: 'PiyRox <' + process.env.RESEND_FROM_EMAIL + '>',
      to: [email],
      subject: 'Verify your PiyRox Account',
      html: `
        <h2>Welcome to PiyRox, ${name}!</h2>
        <p>Please click the link below to verify your account and complete your registration:</p>
        <a href="${verifyLink}" style="display:inline-block;padding:10px 20px;background:#2a8af6;color:#fff;text-decoration:none;border-radius:5px;">Verify My Account</a>
      `
    });

    return NextResponse.json({ success: true, message: 'Registration successful! Please check your email to verify your account.' }, { status: 201 });
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
