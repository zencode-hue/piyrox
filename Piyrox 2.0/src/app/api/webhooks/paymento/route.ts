import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { deliverOrder } from "@/lib/delivery";

export const dynamic = "force-dynamic";

const PAYMENTO_SECRET = process.env.PAYMENTO_SECRET!;

/**
 * Verify Paymento.io HMAC-SHA256 signature.
 * The signature is computed over the JSON body using the Paymento secret.
 */
function verifyPaymentoSignature(rawBody: string, signature: string): boolean {
  try {
    const parsed = JSON.parse(rawBody);
    // Sort keys alphabetically and re-serialize
    const sorted = sortObjectKeys(parsed);
    const sortedJson = JSON.stringify(sorted);
    const expected = crypto
      .createHmac("sha256", PAYMENTO_SECRET)
      .update(sortedJson)
      .digest("hex");
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sortObjectKeys(obj: any): any {
  if (typeof obj !== "object" || obj === null || Array.isArray(obj)) return obj;
  return Object.keys(obj)
    .sort()
    .reduce((acc: Record<string, unknown>, key) => {
      acc[key] = sortObjectKeys(obj[key]);
      return acc;
    }, {});
}

export async function POST(req: NextRequest) {
  let rawBody: string;
  try {
    rawBody = await req.text();
  } catch {
    return NextResponse.json({ received: false }, { status: 400 });
  }

  const signature = req.headers.get("x-paymento-signature");
  if (!signature) {
    return NextResponse.json({ received: false }, { status: 400 });
  }

  if (!verifyPaymentoSignature(rawBody, signature)) {
    console.error("[Paymento Webhook] Invalid signature");
    return NextResponse.json({ received: false }, { status: 400 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ received: false }, { status: 400 });
  }

  const paymentStatus = payload.status as string | undefined;
  const paymentId = payload.payment_id as string | undefined;
  const orderId = payload.order_id as string | undefined;

  console.log(`[Paymento Webhook] Received ${paymentStatus} for Order ${orderId} (Payment ID: ${paymentId})`);

  let logStatus = "processed";

  try {
    await processPaymentoEvent(paymentStatus, orderId, paymentId);
  } catch (err) {
    console.error("[Paymento Webhook] Processing error:", err);
    logStatus = "failed";
  }

  try {
    await db.webhookLog.create({
      data: {
        provider: "paymento",
        eventType: paymentStatus ?? "unknown",
        payload: payload as import("@prisma/client").Prisma.InputJsonValue,
        status: logStatus,
      },
    });
  } catch (err) {
    console.error("[Paymento Webhook] Failed to write WebhookLog:", err);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}

async function processPaymentoEvent(
  paymentStatus: string | undefined,
  orderId: string | undefined,
  paymentId: string | undefined
) {
  if (!orderId) {
    console.warn("[Paymento Webhook] Missing order reference");
    return;
  }

  // Handle balance top-up payments (order_id starts with "TOPUP-")
  if (orderId.startsWith("TOPUP-")) {
    if (paymentStatus === "success") {
      await processTopupPayment(orderId, paymentId);
    }
    return;
  }

  // Handle cart checkout (order_id starts with "cart_")
  if (orderId.startsWith("cart_")) {
    if (paymentStatus === "success") {
      await processCartPayment(orderId, paymentId);
    } else if (paymentStatus === "failed") {
      await db.order.updateMany({
        where: { adminNote: orderId, paymentProvider: "paymento" },
        data: { status: "FAILED" },
      });
    }
    return;
  }

  // Find order by paymentRef or id
  const order = await db.order.findFirst({
    where: {
      OR: [
        { id: orderId },
        { paymentRef: paymentId ?? orderId },
      ],
      paymentProvider: "paymento",
    },
  });

  if (!order) {
    console.warn(`[Paymento Webhook] Order not found for ref: ${orderId}`);
    return;
  }

  const isSuccess = paymentStatus === "success" || paymentStatus === "completed";

  if (isSuccess) {
    await db.order.update({ where: { id: order.id }, data: { status: "PAID" } });
    await deliverOrder(order.id);
  } else if (paymentStatus === "failed") {
    await db.order.update({ where: { id: order.id }, data: { status: "FAILED" } });
  }
}

/**
 * Delivers all orders in a cart group when crypto payment confirms.
 */
async function processCartPayment(cartGroupId: string, paymentId: string | undefined): Promise<void> {
  const orders = await db.order.findMany({
    where: { adminNote: cartGroupId, paymentProvider: "paymento", status: "PENDING" },
    select: { id: true },
  });

  if (orders.length === 0) {
    console.warn(`[Paymento Webhook] No pending orders for cart group: ${cartGroupId}`);
    return;
  }

  for (const order of orders) {
    await db.order.update({ where: { id: order.id }, data: { status: "PAID" } });
    try {
      await deliverOrder(order.id);
    } catch (err) {
      console.error(`[Paymento Webhook] Cart delivery failed for order ${order.id}:`, err);
    }
  }
}

/**
 * Credits a user's balance after a successful Paymento top-up.
 * topupRef format: TOPUP-{userId}-{timestamp}
 */
async function processTopupPayment(topupRef: string, paymentId: string | undefined): Promise<void> {
  // Parse userId and amount from the ref — ref is TOPUP-{userId}-{timestamp}
  // Amount is stored in the Paymento payload as amount, but we need to
  // look it up from the webhook log or re-derive it. Instead we store a pending
  // topup record. Since we don't have a TopupRequest table, we use the
  // WebhookLog to detect duplicates and fetch the amount from Paymento API.
  const parts = topupRef.split("-");
  // TOPUP-{cuid}-{timestamp} — cuid can contain hyphens, so userId is everything between first and last segment
  const userId = parts.slice(1, -1).join("-");
  if (!userId) {
    console.warn(`[Paymento Webhook] Could not parse userId from topupRef: ${topupRef}`);
    return;
  }

  // Idempotency: check if this topupRef was already processed
  const alreadyProcessed = await db.webhookLog.findFirst({
    where: { provider: "paymento", eventType: "topup_credited", payload: { path: ["ref"], equals: topupRef } },
  });
  if (alreadyProcessed) {
    console.log(`[Paymento Webhook] Topup already processed: ${topupRef}`);
    return;
  }

  // Fetch payment details from Paymento to get the actual amount
  const apiKey = process.env.PAYMENTO_API_KEY;
  let amount = 0;

  if (apiKey && paymentId) {
    try {
      const res = await fetch(`https://app.paymento.io/api/v1/payments/${paymentId}`, {
        headers: { "Authorization": `Bearer ${apiKey}` },
      });
      if (res.ok) {
        const data = await res.json() as { amount?: number };
        amount = Number(data.amount ?? 0);
      }
    } catch (err) {
      console.error("[Paymento Webhook] Failed to fetch payment details:", err);
    }
  }

  if (amount <= 0) {
    console.warn(`[Paymento Webhook] Could not determine topup amount for ref: ${topupRef}`);
    return;
  }

  const user = await db.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!user) {
    console.warn(`[Paymento Webhook] User not found for topup: ${userId}`);
    return;
  }

  await db.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { balance: { increment: amount } },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (tx as any).balanceTransaction.create({
      data: {
        userId,
        type: "TOPUP",
        amount,
        description: `Balance top-up via Paymento (ref: ${topupRef})`,
      },
    });
  });

  // Log as processed for idempotency
  await db.webhookLog.create({
    data: {
      provider: "paymento",
      eventType: "topup_credited",
      payload: { ref: topupRef, userId, amount } as import("@prisma/client").Prisma.InputJsonValue,
      status: "processed",
    },
  });

  console.log(`[Paymento Webhook] Topup credited: ${amount} USD to user ${userId}`);
}