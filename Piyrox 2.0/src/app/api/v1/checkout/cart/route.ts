import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getServerSession } from "@/lib/auth";
import { sanitizeString } from "@/lib/sanitize";
import { sendInvoiceCreatedEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  items: z.array(z.object({
    productId: z.string().min(1),
    variantId: z.string().optional(),
  })).min(1).max(20),
  paymentProvider: z.enum(["paymento", "balance", "binance_gift_card"]),
  discountCode: z.string().optional(),
  guestEmail: z.string().email().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    const userId = session?.user?.id ?? null;

    let rawBody: unknown;
    try { rawBody = await req.json(); } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = bodySchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { items, paymentProvider, discountCode, guestEmail } = parsed.data;

    const deliveryEmail = userId ? session!.user.email! : guestEmail ?? null;
    if (!userId && !guestEmail) {
      return NextResponse.json({ error: "Please provide your email to continue as guest" }, { status: 401 });
    }
    if (paymentProvider === "balance" && !userId) {
      return NextResponse.json({ error: "Sign in to pay with balance" }, { status: 401 });
    }
    // Validate all products and compute total
    let totalAmount = 0;
    const resolvedItems: Array<{ productId: string; variantId?: string; title: string; price: number }> = [];

    for (const item of items) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const product = await (db.product.findFirst as any)({
        where: { id: sanitizeString(item.productId), isActive: true },
      }) as { id: string; title: string; price: { toString(): string }; unlimitedStock: boolean; stockCount: number } | null;

      if (!product) {
        return NextResponse.json({ error: `Product not found: ${item.productId}` }, { status: 400 });
      }

      let price = Number(product.price);
      let variantId: string | undefined;

      if (item.variantId) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const variant = await (db as any).productVariant.findFirst({
          where: { id: item.variantId, productId: product.id, isActive: true },
        }) as { id: string; price: { toString(): string }; unlimitedStock: boolean; stockCount: number } | null;
        if (!variant) {
          return NextResponse.json({ error: `Variant not found: ${item.variantId}` }, { status: 400 });
        }
        price = Number(variant.price);
        variantId = variant.id;
      }

      resolvedItems.push({ productId: product.id, variantId, title: product.title, price });
      totalAmount += price;
    }

    // Apply discount code if provided
    let discountAmount = 0;
    let discountCodeRecord: { id: string; type: string; value: { toString(): string } } | null = null;

    if (discountCode) {
      const code = await db.discountCode.findUnique({
        where: { code: sanitizeString(discountCode).toUpperCase() },
      });
      if (code && code.expiresAt > new Date() && code.usageCount < code.usageLimit) {
        discountCodeRecord = code;
        discountAmount = code.type === "PERCENTAGE"
          ? (totalAmount * Number(code.value)) / 100
          : Math.min(Number(code.value), totalAmount);
      }
    }

    const finalAmount = Math.max(0, totalAmount - discountAmount);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://piyrox.xyz";

    // ── Balance payment — deduct and deliver all items immediately ────────────
    if (paymentProvider === "balance") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const user = await (db.user.findUnique as any)({ where: { id: userId }, select: { balance: true } }) as { balance: { toString(): string } } | null;
      if (!user || Number(user.balance) < finalAmount) {
        return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
      }

      // Create one order per item, all PAID, deduct balance once
      const orderIds: string[] = [];

      await db.$transaction(async (tx) => {
        // Deduct balance once for the total
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (tx.user.update as any)({
          where: { id: userId },
          data: { balance: { decrement: finalAmount } },
        });

        for (const item of resolvedItems) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const order = await (tx.order.create as any)({
            data: {
              userId,
              productId: item.productId,
              variantId: item.variantId ?? null,
              variantName: null,
              amount: item.price,
              discountAmount: 0,
              status: "PAID",
              paymentProvider: "balance",
              adminNote: "cart_checkout",
            },
          });
          orderIds.push(order.id);
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (tx as any).balanceTransaction.create({
          data: {
            userId,
            type: "PURCHASE",
            amount: -finalAmount,
            description: `Cart purchase: ${resolvedItems.map((i) => i.title).join(", ")}`,
          },
        });
      });

      // Deliver all orders
      const { deliverOrder } = await import("@/lib/delivery");
      for (const orderId of orderIds) {
        try { await deliverOrder(orderId); } catch (e) {
          console.error(`[cart-checkout] delivery failed for ${orderId}:`, e);
        }
      }

      return NextResponse.json({
        data: {
          redirectUrl: `${appUrl}/checkout/success?orderId=${orderIds[0]}&cart=1`,
          orderIds,
        },
        error: null,
      });
    }

    // ── Crypto (Paymento.io) — one invoice for the total ──────────────────────
    if (paymentProvider === "paymento") {
      const apiKey = process.env.PAYMENTO_API_KEY;
      if (!apiKey) {
        return NextResponse.json({ error: "Crypto payments not configured" }, { status: 503 });
      }

      // Create one order per item as PENDING, store cart group ID in adminNote
      const cartGroupId = `cart_${Date.now()}`;
      const orderIds: string[] = [];

      for (const item of resolvedItems) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const order = await (db.order.create as any)({
          data: {
            userId: userId ?? undefined,
            guestEmail: userId ? null : (guestEmail ?? null),
            productId: item.productId,
            variantId: item.variantId ?? null,
            variantName: null,
            amount: item.price,
            discountAmount: 0,
            status: "PENDING",
            paymentProvider: "paymento",
            adminNote: cartGroupId,
          },
        });
        orderIds.push(order.id);
      }

      // Create ONE Paymento.io invoice for the total
      // Use the cartGroupId as the order_id so the webhook can find all orders
      const productTitles = resolvedItems.map((i) => i.title).join(", ");
      const npRes = await fetch("https://api.paymento.io/v1/payment/request", {
        method: "POST",
        headers: { "Api-key": apiKey, "Content-Type": "application/json", "Accept": "text/plain" },
        body: JSON.stringify({
          fiatAmount: String(finalAmount),
          fiatCurrency: "USD",
          orderId: cartGroupId,
          returnUrl: `${appUrl}/checkout/success?cart=1&orderIds=${orderIds.join(",")}`,
        }),
      });

      if (!npRes.ok) {
        console.error("[cart-checkout] Paymento error:", await npRes.text());
        // Clean up pending orders
        for (const id of orderIds) {
          await db.order.delete({ where: { id } }).catch(() => {});
        }
        return NextResponse.json({ error: "Failed to create crypto payment" }, { status: 502 });
      }

      const npJson = await npRes.json() as { body?: string; success?: boolean };
      if (!npJson.success || !npJson.body) {
        console.error("[cart-checkout] Paymento returned failure:", npJson);
        for (const id of orderIds) {
          await db.order.delete({ where: { id } }).catch(() => {});
        }
        return NextResponse.json({ error: "Failed to create crypto payment" }, { status: 502 });
      }
      const paymentRef = npJson.body;
      const gatewayUrl = `https://app.paymento.io/gateway?token=${paymentRef}`;

      // Store paymentRef on all orders
      for (const orderId of orderIds) {
        await db.order.update({ where: { id: orderId }, data: { paymentRef } });
      }

      // Send invoice email
      if (deliveryEmail) {
        sendInvoiceCreatedEmail(
          deliveryEmail,
          orderIds[0],
          productTitles.slice(0, 80),
          finalAmount,
          "paymento"
        ).catch(() => {});
      }

      return NextResponse.json({
        data: { redirectUrl: gatewayUrl, orderIds, cartGroupId },
        error: null,
      });
    }

    // ── Binance Gift Card — create one order for the total, customer submits code ──
    if (paymentProvider === "binance_gift_card") {
      // Find the nearest Eneba denomination >= finalAmount
      const denominations = [
        0.5, 1, 2, 3, 4, 5, 6, 7, 7.5, 8, 9, 10, 10.5, 11, 12, 13, 14, 15,
        17, 18, 20, 20.5, 22, 25, 27, 28, 29, 30, 33, 33.5, 35, 40, 43, 43.5,
        44, 44.5, 45, 45.5, 46, 50, 50.5, 55, 60, 65, 66, 70, 100, 150, 200,
        250, 300, 400, 500, 750,
      ];
      const denomination = denominations.find((d) => d >= finalAmount) ?? finalAmount;

      // Create one order for the cart total
      const cartGroupId = `cart_gc_${Date.now()}`;
      const orderIds: string[] = [];

      for (const item of resolvedItems) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const order = await (db.order.create as any)({
          data: {
            userId: userId ?? undefined,
            guestEmail: userId ? null : (guestEmail ?? null),
            productId: item.productId,
            variantId: item.variantId ?? null,
            variantName: null,
            amount: item.price,
            discountAmount: 0,
            status: "PENDING",
            paymentProvider: "binance_gift_card",
            adminNote: cartGroupId,
          },
        });
        orderIds.push(order.id);
      }

      return NextResponse.json({
        data: {
          orderId: orderIds[0],   // primary order ID for the gift card modal
          orderIds,
          cartGroupId,
          denomination,
          totalAmount: finalAmount,
        },
        error: null,
      });
    }

    return NextResponse.json({ error: "Invalid payment provider" }, { status: 400 });
  } catch (err) {
    console.error("[POST /api/v1/checkout/cart]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
