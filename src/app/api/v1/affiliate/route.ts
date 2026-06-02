import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "@/lib/auth";
import crypto from "crypto";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required", data: null }, { status: 401 });
    }

    const affiliate = await db.affiliate.findUnique({
      where: { userId: session.user.id },
      include: { referrals: true },
    });

    if (!affiliate) {
      return NextResponse.json({ data: null, error: null, meta: { enrolled: false } });
    }

    return NextResponse.json({
      data: {
        referralCode: affiliate.referralCode,
        commissionPct: Number(affiliate.commissionPct),
        totalEarned: Number(affiliate.totalEarned),
        pendingPayout: Number(affiliate.pendingPayout),
        referralCount: affiliate.referrals.length,
      },
      error: null,
      meta: { enrolled: true },
    });
  } catch (error) {
    console.error("Affiliate error:", error);
    return NextResponse.json({ error: "Internal server error", data: null }, { status: 500 });
  }
}

export async function POST() {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required", data: null }, { status: 401 });
    }

    const existing = await db.affiliate.findUnique({ where: { userId: session.user.id } });
    if (existing) {
      return NextResponse.json({ error: "Already enrolled in affiliate program", data: null }, { status: 409 });
    }

    const referralCode = `PYX-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

    const affiliate = await db.affiliate.create({
      data: {
        userId: session.user.id,
        referralCode,
        commissionPct: 10,
      },
    });

    return NextResponse.json({
      data: { referralCode: affiliate.referralCode, commissionPct: 10 },
      error: null,
    }, { status: 201 });
  } catch (error) {
    console.error("Affiliate join error:", error);
    return NextResponse.json({ error: "Internal server error", data: null }, { status: 500 });
  }
}
