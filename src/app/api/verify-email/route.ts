import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token is required", data: null }, { status: 400 });
    }

    const verificationToken = await db.verificationToken.findFirst({
      where: {
        token,
        expires: { gt: new Date() },
        identifier: { not: { startsWith: "reset:" } },
      },
    });

    if (!verificationToken) {
      return NextResponse.json({ error: "Invalid or expired token", data: null }, { status: 400 });
    }

    await db.user.update({
      where: { email: verificationToken.identifier },
      data: { emailVerified: new Date() },
    });

    await db.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: verificationToken.identifier,
          token: verificationToken.token,
        },
      },
    });

    // Redirect to login with success message
    return NextResponse.redirect(new URL("/auth/login?verified=true", req.url));
  } catch (error) {
    console.error("Verify email error:", error);
    return NextResponse.json({ error: "Internal server error", data: null }, { status: 500 });
  }
}
