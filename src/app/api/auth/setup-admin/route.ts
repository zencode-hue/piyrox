import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { secret, email, password, name } = await req.json();

    if (secret !== process.env.ADMIN_SETUP_SECRET) {
      return NextResponse.json({ error: "Invalid setup secret", data: null }, { status: 403 });
    }

    const existing = await db.user.findFirst({ where: { role: "ADMIN" } });
    if (existing) {
      return NextResponse.json({ error: "Admin already exists", data: null }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const admin = await db.user.create({
      data: {
        email: email.toLowerCase().trim(),
        passwordHash,
        name: name || "Admin",
        role: "ADMIN",
        emailVerified: new Date(),
      },
    });

    return NextResponse.json({
      data: { id: admin.id, email: admin.email },
      error: null,
      meta: { message: "Admin account created." },
    }, { status: 201 });
  } catch (error) {
    console.error("Admin setup error:", error);
    return NextResponse.json({ error: "Internal server error", data: null }, { status: 500 });
  }
}
