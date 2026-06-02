import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "@/lib/auth";
import { z } from "zod";

const checkoutSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().optional(),
  paymentProvider: z.enum(["stripe", "cryptomus", "nowpayments", "flutterwave", "balance"]),
  discountCode: z.string().optional(),
  guestEmail: z.string().email().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message, data: null }, { status: 400 });
    }

    const { productId, variantId, paymentProvider, discountCode, guestEmail } = parsed.data;

    if (!session?.user?.id && !guestEmail) {
      return NextResponse.json({ error: "Please login or provide an email for guest checkout", data: null }, { status: 401 });
    }

    // Get product & variant
    const product = await db.product.findUnique({ where: { id: productId } });
    if (!product || !product.isActive) {
      return NextResponse.json({ error: "Product not found or inactive", data: null }, { status: 404 });
    }

    let price = Number(product.price);
    let variantName: string | null = null;

    if (variantId) {
      const variant = await db.productVariant.findUnique({ where: { id: variantId } });
      if (!variant || !variant.isActive) {
        return NextResponse.json({ error: "Variant not found", data: null }, { status: 404 });
      }
      price = Number(variant.price);
      variantName = variant.name;

      // Check stock
      if (!variant.unlimitedStock) {
        const available = await db.inventoryItem.count({
          where: { productId, variantId, status: "AVAILABLE" },
        });
        if (available === 0) {
          return NextResponse.json({ error: "Product is out of stock", data: null }, { status: 400 });
        }
      }
    } else if (!product.unlimitedStock) {
      const available = await db.inventoryItem.count({
        where: { productId, status: "AVAILABLE", variantId: null },
      });
      if (available === 0) {
        return NextResponse.json({ error: "Product is out of stock", data: null }, { status: 400 });
      }
    }

    // Apply discount
    let discountAmount = 0;
    let discountCodeId: string | null = null;

    if (discountCode) {
      const discount = await db.discountCode.findUnique({ where: { code: discountCode } });
      if (!discount || discount.usageCount >= discount.usageLimit || discount.expiresAt < new Date()) {
        return NextResponse.json({ error: "Invalid or expired discount code", data: null }, { status: 400 });
      }

      if (session?.user?.id) {
        const alreadyUsed = await db.discountUsage.findUnique({
          where: { discountCodeId_userId: { discountCodeId: discount.id, userId: session.user.id } },
        });
        if (alreadyUsed) {
          return NextResponse.json({ error: "You have already used this discount code", data: null }, { status: 400 });
        }
      }

      discountAmount = discount.type === "PERCENTAGE"
        ? price * (Number(discount.value) / 100)
        : Number(discount.value);
      discountCodeId = discount.id;
    }

    const finalAmount = Math.max(0, price - discountAmount);

    // Handle balance payment
    if (paymentProvider === "balance") {
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Login required for balance payment", data: null }, { status: 401 });
      }

      const user = await db.user.findUnique({ where: { id: session.user.id } });
      if (!user || Number(user.balance) < finalAmount) {
        return NextResponse.json({ error: "Insufficient balance", data: null }, { status: 400 });
      }

      // Create order and deduct balance atomically
      const order = await db.$transaction(async (tx) => {
        const newOrder = await tx.order.create({
          data: {
            userId: session.user.id,
            productId,
            variantId: variantId || null,
            variantName,
            amount: finalAmount,
            discountAmount,
            discountCodeId,
            paymentProvider: "balance",
            status: "PAID",
          },
        });

        await tx.user.update({
          where: { id: session.user.id },
          data: { balance: { decrement: finalAmount } },
        });

        await tx.balanceTransaction.create({
          data: {
            userId: session.user.id,
            type: "PURCHASE",
            amount: -finalAmount,
            description: `Purchase: ${product.title}${variantName ? ` (${variantName})` : ""}`,
            orderId: newOrder.id,
          },
        });

        if (discountCodeId) {
          await tx.discountCode.update({
            where: { id: discountCodeId },
            data: { usageCount: { increment: 1 } },
          });
          await tx.discountUsage.create({
            data: { discountCodeId, userId: session.user.id },
          });
        }

        return newOrder;
      });

      // Auto-deliver
      // In production: await deliverOrder(order.id);

      return NextResponse.json({
        data: { orderId: order.id, status: "PAID", amount: finalAmount },
        error: null,
        meta: { message: "Order placed and paid successfully." },
      }, { status: 201 });
    }

    // Create pending order for external payment
    const order = await db.order.create({
      data: {
        userId: session?.user?.id || null,
        guestEmail: guestEmail || null,
        productId,
        variantId: variantId || null,
        variantName,
        amount: finalAmount,
        discountAmount,
        discountCodeId,
        paymentProvider,
        status: "PENDING",
      },
    });

    if (discountCodeId && session?.user?.id) {
      await db.discountCode.update({
        where: { id: discountCodeId },
        data: { usageCount: { increment: 1 } },
      });
      await db.discountUsage.create({
        data: { discountCodeId, userId: session.user.id },
      });
    }

    // In production: generate payment URL for the chosen provider
    return NextResponse.json({
      data: {
        orderId: order.id,
        status: "PENDING",
        amount: finalAmount,
        paymentProvider,
        // paymentUrl: generated from provider SDK
      },
      error: null,
      meta: { message: "Order created. Proceed to payment." },
    }, { status: 201 });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Internal server error", data: null }, { status: 500 });
  }
}
