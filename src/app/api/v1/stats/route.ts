import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [totalOrders, totalProducts, totalCustomers] = await Promise.all([
      db.order.count({ where: { status: "PAID" } }),
      db.product.count({ where: { isActive: true } }),
      db.user.count(),
    ]);

    return NextResponse.json({
      data: { totalOrders, totalProducts, totalCustomers },
      error: null,
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ error: "Internal server error", data: null }, { status: 500 });
  }
}
