import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "@/lib/auth";
import { z } from "zod";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = {};
    if (productId) where.productId = productId;

    const [reviews, total] = await Promise.all([
      db.review.findMany({
        where,
        include: { user: { select: { id: true, name: true } }, product: { select: { id: true, title: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.review.count({ where }),
    ]);

    return NextResponse.json({
      data: reviews,
      error: null,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Reviews list error:", error);
    return NextResponse.json({ error: "Internal server error", data: null }, { status: 500 });
  }
}

const reviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required", data: null }, { status: 401 });
    }

    const body = await req.json();
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message, data: null }, { status: 400 });
    }

    const { productId, rating, comment } = parsed.data;

    // Check if user has purchased this product
    const hasPurchased = await db.order.findFirst({
      where: { userId: session.user.id, productId, status: "PAID" },
    });

    if (!hasPurchased) {
      return NextResponse.json({ error: "You must purchase this product before reviewing", data: null }, { status: 403 });
    }

    // Check for existing review
    const existingReview = await db.review.findUnique({
      where: { userId_productId: { userId: session.user.id, productId } },
    });

    if (existingReview) {
      return NextResponse.json({ error: "You have already reviewed this product", data: null }, { status: 409 });
    }

    const review = await db.review.create({
      data: { userId: session.user.id, productId, rating, comment },
    });

    // Update product average rating
    const avgResult = await db.review.aggregate({
      where: { productId },
      _avg: { rating: true },
    });

    await db.product.update({
      where: { id: productId },
      data: { avgRating: avgResult._avg.rating || 0 },
    });

    return NextResponse.json({ data: review, error: null }, { status: 201 });
  } catch (error) {
    console.error("Create review error:", error);
    return NextResponse.json({ error: "Internal server error", data: null }, { status: 500 });
  }
}
