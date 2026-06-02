import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required", data: null }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { balance: true },
    });

    const transactions = await db.balanceTransaction.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({
      data: { balance: Number(user?.balance || 0), transactions },
      error: null,
    });
  } catch (error) {
    console.error("Balance error:", error);
    return NextResponse.json({ error: "Internal server error", data: null }, { status: 500 });
  }
}
