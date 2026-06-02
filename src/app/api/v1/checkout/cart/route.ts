import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "@/lib/auth";
import { z } from "zod";

const cartCheckoutSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    variantId: z.string().optional(),
    quantity: z.number().int().min(1).default(1),
  })).min(1),
  paymentProvider: z.enum(["stripe", "cryptomus", "nowpayments", "flutterwave", "balance"]),
  discountCode: z.string().optional(),
  guestEmail: z.string().email().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    const body = await req.json();
    const parsed = cartCheckoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message, data: null }, { status: 400 });
    }

    const { items, paymentProvider, guestEmail } = parsed.data;

    if (!session?.user?.id && !guestEmail) {
      return NextResponse.json({ error: "Please login or provide guest email", data: null }, { status: 401 });
    }

    const orders = [];
    let totalAmount = 0;

    for (const item of items) {
      const product = await db.product.findUnique({ where: { id: item.productId } });
      if (!product || !product.isActive) continue;

      let price = Number(product.price);
      let variantName: string | null = null;

      if (item.variantId) {
        const variant = await db.productVariant.findUnique({ where: { id: item.variantId } });
        if (variant) { price = Number(variant.price); variantName = variant.name; }
      }

      for (let i = 0; i < item.quantity; i++) {
        const order = await db.order.create({
          data: {
            userId: session?.user?.id || null,
            guestEmail: guestEmail || null,
            productId: item.productId,
            variantId: item.variantId || null,
            variantName,
            amount: price,
            paymentProvider,
            status: "PENDING",
          },
        });
        orders.push(order);
        totalAmount += price;
      }
    }

    return NextResponse.json({
      data: { orderIds: orders.map(o => o.id), totalAmount, count: orders.length },
      error: null,
    }, { status: 201 });
  } catch (error) {
    console.error("Cart checkout error:", error);
    return NextResponse.json({ error: "Internal server error", data: null }, { status: 500 });
  }
}
