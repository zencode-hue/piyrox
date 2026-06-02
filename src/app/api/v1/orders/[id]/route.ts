import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required", data: null }, { status: 401 });
    }

    const order = await db.order.findFirst({
      where: { id: params.id, userId: session.user.id },
      include: {
        product: true,
        variant: true,
        deliveryLog: {
          include: { inventoryItem: true },
        },
        discountCode: { select: { code: true, type: true, value: true } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found", data: null }, { status: 404 });
    }

    return NextResponse.json({ data: order, error: null });
  } catch (error) {
    console.error("Order detail error:", error);
    return NextResponse.json({ error: "Internal server error", data: null }, { status: 500 });
  }
}
