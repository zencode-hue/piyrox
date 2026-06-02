import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();
    if (!code) {
      return NextResponse.json({ error: "Discount code is required", data: null }, { status: 400 });
    }

    const discount = await db.discountCode.findUnique({ where: { code } });

    if (!discount) {
      return NextResponse.json({ error: "Invalid discount code", data: null }, { status: 404 });
    }

    if (discount.usageCount >= discount.usageLimit) {
      return NextResponse.json({ error: "Discount code has reached its usage limit", data: null }, { status: 400 });
    }

    if (discount.expiresAt < new Date()) {
      return NextResponse.json({ error: "Discount code has expired", data: null }, { status: 400 });
    }

    return NextResponse.json({
      data: { type: discount.type, value: Number(discount.value), code: discount.code },
      error: null,
    });
  } catch (error) {
    console.error("Discount validation error:", error);
    return NextResponse.json({ error: "Internal server error", data: null }, { status: 500 });
  }
}
