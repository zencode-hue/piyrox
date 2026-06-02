import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required", data: null }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        data: null,
        error: null,
        meta: { message: "If an account exists, a reset link has been sent." },
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.verificationToken.create({
      data: {
        identifier: `reset:${user.email}`,
        token,
        expires,
      },
    });

    // In production: await sendPasswordResetEmail(user.email, token);

    return NextResponse.json({
      data: null,
      error: null,
      meta: { message: "If an account exists, a reset link has been sent." },
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Internal server error", data: null }, { status: 500 });
  }
}
