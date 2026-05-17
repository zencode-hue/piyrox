import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { decrypt } from "@/lib/crypto";

export const dynamic = "force-dynamic";

/**
 * GET: Serves bot configuration to the Railway-hosted bot.
 */
export async function GET(req: NextRequest) {
  try {
    const bypassKey = process.env.INTERNAL_BYPASS_KEY || "metramart-ai-secret-2024";
    const headerKey = req.headers.get("X-Internal-AI-Bypass");
    
    if (headerKey !== bypassKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const configKeys = [
      "bot_discord_token",
      "bot_client_id",
      "bot_staff_role_id",
      "bot_log_channel_id",
      "bot_transcript_channel_id",
      "bot_ticket_category_id"
    ];

    const settings = await db.siteSetting.findMany({
      where: { key: { in: configKeys } },
    });

    const config: Record<string, string> = {};
    settings.forEach(s => {
      config[s.key] = s.value;
    });

    return NextResponse.json(config);
  } catch (err) {
    console.error("[Bot API] GET error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

/**
 * POST: Handles multi-action requests from the Discord Bot.
 * Action Types:
 * 1. heartbeat: Live uptime and ping stats reporting.
 * 2. ticket_sync: Saves/updates support ticket records in the site settings cache.
 * 3. claim_order: Automatically verifies a PAID order and delivers the product inventory.
 */
export async function POST(req: NextRequest) {
  try {
    const bypassKey = process.env.INTERNAL_BYPASS_KEY || "metramart-ai-secret-2024";
    const headerKey = req.headers.get("X-Internal-AI-Bypass");
    
    if (headerKey !== bypassKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const action = body.action || "heartbeat";

    // ─── 1. Heartbeat reporting ───
    if (action === "heartbeat") {
      const { status, latency, guilds, tickets, uptime } = body;
      const cacheValue = JSON.stringify({
        status: status || "ONLINE",
        latency: latency || 0,
        guilds: guilds || 0,
        tickets: tickets || 0,
        uptime: uptime || 0,
        lastHeartbeat: new Date().toISOString(),
      });

      await db.siteSetting.upsert({
        where: { key: "bot_status_cache" },
        update: { value: cacheValue },
        create: { key: "bot_status_cache", value: cacheValue },
      });

      return NextResponse.json({ success: true });
    }

    // ─── 2. Support Ticket sync ───
    if (action === "ticket_sync") {
      const { channelId, ticketNum, userId, userTag, category, priority, status, claimedBy, transcript } = body;
      const key = `bot_ticket:${channelId}`;
      const value = JSON.stringify({
        channelId,
        ticketNum,
        userId,
        userTag,
        category,
        priority,
        status,
        claimedBy,
        transcript: transcript || null,
        updatedAt: new Date().toISOString(),
      });

      await db.siteSetting.upsert({
        where: { key: key },
        update: { value: value },
        create: { key: key, value: value },
      });

      return NextResponse.json({ success: true });
    }

    // ─── 3. Automated Order Claiming ───
    if (action === "claim_order") {
      const { email, orderId } = body;

      // Find order in database
      const order = await db.order.findFirst({
        where: {
          id: orderId,
          status: "PAID",
          OR: [
            { guestEmail: { equals: email, mode: "insensitive" } },
            { user: { email: { equals: email, mode: "insensitive" } } }
          ]
        },
        include: {
          product: true
        }
      });

      if (!order) {
        return NextResponse.json(
          { error: "No matching PAID order found. Make sure the email and order ID match your checkout details." },
          { status: 404 }
        );
      }

      // Check if already delivered
      const delivery = await db.deliveryLog.findFirst({
        where: { orderId: order.id }
      });
      if (delivery) {
        return NextResponse.json({ error: "This order has already been successfully claimed." }, { status: 400 });
      }

      // Find available stock for the product
      const stockItem = await db.inventoryItem.findFirst({
        where: {
          productId: order.productId,
          variantId: order.variantId || undefined,
          status: "AVAILABLE"
        }
      });

      const fallbackItem = !stockItem ? await db.inventoryItem.findFirst({
        where: {
          productId: order.productId,
          status: "AVAILABLE"
        }
      }) : null;

      const selectedItem = stockItem || fallbackItem;

      if (!selectedItem) {
        return NextResponse.json(
          { error: "Out of stock! Our administrative team has been notified. Please contact support to manually claim your product." },
          { status: 400 }
        );
      }

      // Update inventory item status to DELIVERED
      await db.inventoryItem.update({
        where: { id: selectedItem.id },
        data: { status: "DELIVERED" }
      });

      // Create delivery log
      await db.deliveryLog.create({
        data: {
          orderId: order.id,
          productId: order.productId,
          inventoryItemId: selectedItem.id,
          userId: order.userId || undefined
        }
      });

      // Decrypt credentials in-memory securely
      let credentials = "";
      try {
        credentials = decrypt(selectedItem.encryptedData, selectedItem.iv, selectedItem.authTag);
      } catch (decErr) {
        console.error("[Bot API] Decryption failed for stock item:", selectedItem.id, decErr);
        // Fallback to presenting the encrypted state if key is missing/mismatched
        credentials = `Encrypted Item (Please claim via website dashboard)`;
      }

      return NextResponse.json({
        success: true,
        productTitle: order.product.title,
        variantName: order.variantName || "Standard License",
        credentials
      });
    }

    // ─── 4. Support Ticket Review Submission ───
    if (action === "submit_review") {
      const { userId, rating, comment } = body;

      // Find user in database by name/tag or matching name, or get first user
      let user = await db.user.findFirst({
        where: {
          OR: [
            { name: { equals: userId, mode: "insensitive" } },
            { email: { contains: userId, mode: "insensitive" } }
          ]
        }
      });

      if (!user) {
        user = await db.user.findFirst();
      }

      if (!user) {
        return NextResponse.json({ error: "No users exist in the database to bind review to." }, { status: 400 });
      }

      // Find latest product purchased or first product generally
      const lastOrder = await db.order.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" }
      });

      const firstProduct = await db.product.findFirst();
      const productId = lastOrder?.productId || firstProduct?.id;

      if (!productId) {
        return NextResponse.json({ error: "No products exist in database to attach review." }, { status: 400 });
      }

      // Create or update review
      await db.review.upsert({
        where: {
          userId_productId: {
            userId: user.id,
            productId: productId
          }
        },
        update: {
          rating: Number(rating),
          comment: comment || "Excellent support response!"
        },
        create: {
          userId: user.id,
          productId: productId,
          rating: Number(rating),
          comment: comment || "Excellent support response!"
        }
      });

      return NextResponse.json({ success: true });
    }

    // ─── 5. Order Warranty Check ───
    if (action === "check_warranty") {
      const { orderId } = body;

      const order = await db.order.findUnique({
        where: { id: orderId },
        include: { product: true }
      });

      if (!order) {
        return NextResponse.json({ error: "Order not found. Please verify your Order ID." }, { status: 404 });
      }

      const warrantyDurationDays = 30; // Standard MetraMart warranty
      const createdAt = new Date(order.createdAt);
      const expirationDate = new Date(createdAt.getTime() + warrantyDurationDays * 24 * 60 * 60 * 1000);
      const now = new Date();

      const isActive = now.getTime() < expirationDate.getTime();
      const remainingTimeMs = expirationDate.getTime() - now.getTime();
      const remainingDays = Math.ceil(remainingTimeMs / (1000 * 60 * 60 * 24));

      return NextResponse.json({
        success: true,
        orderId: order.id,
        productTitle: order.product.title,
        status: order.status,
        createdAt: order.createdAt,
        isActive,
        remainingDays: isActive ? remainingDays : 0,
        expirationDate: expirationDate.toISOString()
      });
    }

    // ─── 6. Staff Shift/Duty Tracker ───
    if (action === "duty_log") {
      const { userId, userTag, type } = body;
      const sessionKey = `bot_duty_session:${userId}`;

      if (type === "start") {
        await db.siteSetting.upsert({
          where: { key: sessionKey },
          update: { value: new Date().toISOString() },
          create: { key: sessionKey, value: new Date().toISOString() }
        });
        return NextResponse.json({ success: true });
      }

      if (type === "stop") {
        const session = await db.siteSetting.findUnique({
          where: { key: sessionKey }
        });

        if (!session) {
          return NextResponse.json({ error: "No active duty shift found. Run `/duty start` first." }, { status: 400 });
        }

        const startTime = new Date(session.value);
        const stopTime = new Date();
        const durationMs = stopTime.getTime() - startTime.getTime();

        // Clear active session
        await db.siteSetting.delete({
          where: { key: sessionKey }
        });

        // Save shift log entry to a collective history
        const logKey = `bot_duty_history:${userId}`;
        const historyRecord = await db.siteSetting.findUnique({
          where: { key: logKey }
        });

        const history = historyRecord ? JSON.parse(historyRecord.value) : [];
        history.push({
          userTag,
          durationMs,
          date: stopTime.toISOString()
        });

        await db.siteSetting.upsert({
          where: { key: logKey },
          update: { value: JSON.stringify(history) },
          create: { key: logKey, value: JSON.stringify(history) }
        });

        return NextResponse.json({
          success: true,
          durationMs,
          startTime: startTime.toISOString(),
          stopTime: stopTime.toISOString()
        });
      }
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (err) {
    console.error("[Bot API] POST error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
