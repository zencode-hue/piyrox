/**
 * PIYROX Market — Delivery System
 *
 * Handles fulfillment of digital orders:
 * 1. Find available inventory for the ordered product/variant
 * 2. Decrypt the credential data
 * 3. Mark inventory as DELIVERED
 * 4. Create a DeliveryLog entry
 * 5. Update the order status
 */

import db from "@/lib/db";
import { decrypt } from "@/lib/crypto";
import { InventoryStatus, OrderStatus } from "@prisma/client";

export interface DeliveryResult {
  success: boolean;
  deliveredItems: string[];
  error?: string;
}

/**
 * Deliver digital items for a given order.
 */
export async function deliverOrder(orderId: string): Promise<DeliveryResult> {
  try {
    // Fetch the order
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { product: true },
    });

    if (!order) {
      return { success: false, deliveredItems: [], error: "Order not found" };
    }

    if (order.status === OrderStatus.DELIVERED) {
      return { success: false, deliveredItems: [], error: "Order already delivered" };
    }

    // Find available inventory items for this product/variant
    const whereClause: Record<string, unknown> = {
      productId: order.productId,
      status: InventoryStatus.AVAILABLE,
    };

    if (order.variantId) {
      whereClause.variantId = order.variantId;
    }

    const availableItems = await db.inventoryItem.findMany({
      where: whereClause,
      take: order.quantity,
      orderBy: { createdAt: "asc" }, // FIFO — oldest first
    });

    if (availableItems.length < order.quantity) {
      // Partial delivery or no stock
      if (availableItems.length === 0) {
        return {
          success: false,
          deliveredItems: [],
          error: `No inventory available for "${order.product.title}"`,
        };
      }
      // We still deliver what we can, but mark as partially delivered
    }

    const deliveredItems: string[] = [];

    // Process each inventory item in a transaction
    await db.$transaction(async (tx) => {
      for (const item of availableItems) {
        // Decrypt the credential data
        const decryptedData = decrypt(item.encryptedData);
        deliveredItems.push(decryptedData);

        // Mark inventory item as delivered
        await tx.inventoryItem.update({
          where: { id: item.id },
          data: {
            status: InventoryStatus.DELIVERED,
            deliveredTo: orderId,
            deliveredAt: new Date(),
          },
        });
      }

      // Create delivery log
      await tx.deliveryLog.create({
        data: {
          orderId,
          content: deliveredItems.join("\n---\n"),
          deliveredAt: new Date(),
        },
      });

      // Determine order status
      const newStatus =
        availableItems.length >= order.quantity
          ? OrderStatus.DELIVERED
          : OrderStatus.PARTIALLY_DELIVERED;

      // Update order status
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: newStatus,
          paidAt: newStatus === OrderStatus.DELIVERED ? new Date() : order.paidAt,
        },
      });

      // Update product stock count
      await tx.product.update({
        where: { id: order.productId },
        data: {
          stockCount: { decrement: availableItems.length },
        },
      });
    });

    return {
      success: true,
      deliveredItems,
    };
  } catch (error) {
    console.error("[Delivery Error]", error);
    return {
      success: false,
      deliveredItems: [],
      error: error instanceof Error ? error.message : "Delivery failed",
    };
  }
}

/**
 * Retrieve delivered items for an order (re-delivery / viewing).
 */
export async function getDeliveryContent(
  orderId: string
): Promise<string | null> {
  const log = await db.deliveryLog.findFirst({
    where: { orderId },
    orderBy: { deliveredAt: "desc" },
  });

  return log?.content ?? null;
}

/**
 * Check if a product has available stock.
 */
export async function checkStock(
  productId: string,
  variantId?: string,
  quantity: number = 1
): Promise<{ available: boolean; count: number }> {
  const whereClause: Record<string, unknown> = {
    productId,
    status: InventoryStatus.AVAILABLE,
  };

  if (variantId) {
    whereClause.variantId = variantId;
  }

  const count = await db.inventoryItem.count({ where: whereClause });

  return {
    available: count >= quantity,
    count,
  };
}
