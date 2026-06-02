import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required", data: null }, { status: 400 });
    }

    const order = await db.order.findUnique({
      where: { id: orderId },
      select: {
        id: true, status: true, amount: true, paymentProvider: true,
        createdAt: true, updatedAt: true,
        product: { select: { title: true, category: true } },
        variant: { select: { name: true } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found", data: null }, { status: 404 });
    }

    return NextResponse.json({ data: order, error: null });
  } catch (error) {
    console.error("Track order error:", error);
    return NextResponse.json({ error: "Internal server error", data: null }, { status: 500 });
  }
}
