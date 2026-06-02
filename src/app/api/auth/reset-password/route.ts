import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message, data: null }, { status: 400 });
    }

    const { token, password } = parsed.data;

    const verificationToken = await db.verificationToken.findFirst({
      where: {
        token,
        identifier: { startsWith: "reset:" },
        expires: { gt: new Date() },
      },
    });

    if (!verificationToken) {
      return NextResponse.json({ error: "Invalid or expired reset token", data: null }, { status: 400 });
    }

    const email = verificationToken.identifier.replace("reset:", "");
    const passwordHash = await bcrypt.hash(password, 12);

    await db.user.update({
      where: { email },
      data: { passwordHash },
    });

    await db.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: verificationToken.identifier,
          token: verificationToken.token,
        },
      },
    });

    return NextResponse.json({
      data: null,
      error: null,
      meta: { message: "Password reset successfully." },
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Internal server error", data: null }, { status: 500 });
  }
}
