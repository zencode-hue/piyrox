import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (from || to) {
    where.createdAt = {};
    if (from) (where.createdAt as Record<string, unknown>).gte = new Date(from);
    if (to) (where.createdAt as Record<string, unknown>).lte = new Date(to);
  }

  const orders = await db.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { email: true, name: true } },
      product: { select: { title: true, category: true } },
    },
    take: 10000,
  });

  const rows = [
    ["Order ID", "Date", "Customer Email", "Product", "Category", "Amount", "Status", "Payment Method", "Variant"],
    ...orders.map((o) => [
      `MMT-${o.id.slice(-6).toUpperCase()}`,
      new Date(o.createdAt).toISOString().slice(0, 10),
      o.user?.email ?? o.guestEmail ?? "Guest",
      o.product.title,
      o.product.category,
      Number(o.amount).toFixed(2),
      o.status,
      o.paymentProvider,
      o.variantName ?? "",
    ]),
  ];

  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="piyrox-orders-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
