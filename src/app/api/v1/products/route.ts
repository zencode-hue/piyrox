import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "newest";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const featured = searchParams.get("featured");

    const where: any = { isActive: true };

    if (category) where.category = category;
    if (featured === "true") where.isFeatured = true;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const orderBy: any = sort === "price_asc" ? { price: "asc" }
      : sort === "price_desc" ? { price: "desc" }
      : sort === "rating" ? { avgRating: "desc" }
      : sort === "popular" ? { stockCount: "desc" }
      : { createdAt: "desc" };

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          variants: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
          _count: { select: { reviews: true } },
        },
      }),
      db.product.count({ where }),
    ]);

    return NextResponse.json({
      data: products,
      error: null,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Products list error:", error);
    return NextResponse.json({ error: "Internal server error", data: null }, { status: 500 });
  }
}
