import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; platform: string } }
) {
  try {
    const { id, platform } = params;

    // 1. Find the blast
    const blast = await db.socialBlast.findUnique({
      where: { id },
      select: { productId: true, platformStats: true }
    });

    if (!blast || !blast.productId) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // 2. Increment clicks and platform specific stats
    const stats = (blast.platformStats as Record<string, number>) || {};
    stats[platform] = (stats[platform] || 0) + 1;

    await db.socialBlast.update({
      where: { id },
      data: {
        clicks: { increment: 1 },
        platformStats: stats
      }
    });

    // 3. Redirect to the product page
    return NextResponse.redirect(new URL(`/checkout/confirm?productId=${blast.productId}`, req.url));

  } catch (error) {
    console.error("[Social Click Track Error]:", error);
    return NextResponse.redirect(new URL("/", req.url));
  }
}
