import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const product = await db.product.findUnique({
      where: { id: params.id },
      include: {
        variants: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
        reviews: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        _count: { select: { reviews: true, orders: true } },
      },
    });

    if (!product || !product.isActive) {
      return NextResponse.json({ error: "Product not found", data: null }, { status: 404 });
    }

    // Get stock count
    const availableStock = await db.inventoryItem.count({
      where: { productId: product.id, status: "AVAILABLE" },
    });

    return NextResponse.json({
      data: { ...product, availableStock },
      error: null,
    });
  } catch (error) {
    console.error("Product detail error:", error);
    return NextResponse.json({ error: "Internal server error", data: null }, { status: 500 });
  }
}
