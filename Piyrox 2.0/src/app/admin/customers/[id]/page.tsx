import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Globe, DollarSign, ShoppingCart, Mail, ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

const STATUS_BADGE: Record<string, string> = {
  PAID: "badge-green", PENDING: "badge-yellow", FAILED: "badge-red",
  PENDING_STOCK: "badge-yellow", REFUNDED: "badge-purple",
};

const PAYMENT_SHORT: Record<string, string> = {
  nowpayments: "Crypto", balance: "Wallet",
  binance_gift_card: "Gift Card", discord: "Discord",
};

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
  await requireAdmin();

  const rawId = decodeURIComponent(params.id);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://piyrox.xyz";

  // Try user ID or email
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = await (db.user.findFirst as any)({
    where: { OR: [{ id: rawId }, { email: rawId }] },
    select: {
      id: true, email: true, name: true, role: true, createdAt: true,
      balance: true, isBanned: true, banReason: true,
      affiliate: {
        select: {
          referralCode: true, totalEarned: true, pendingPayout: true, commissionPct: true,
          _count: { select: { referrals: true } },
        },
      },
    },
  }) as {
    id: string; email: string; name: string | null; role: string; createdAt: Date;
    balance: { toString(): string }; isBanned: boolean; banReason: string | null;
    affiliate: { referralCode: string; totalEarned: { toString(): string }; pendingPayout: { toString(): string }; commissionPct: { toString(): string }; _count: { referrals: number } } | null;
  } | null;

  const lookupEmail = user?.email ?? (rawId.includes("@") ? rawId : null);
  if (!user && !lookupEmail) notFound();

  const email = user?.email ?? lookupEmail ?? "Unknown";

  // Get all orders for this customer
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allOrders = await (db.order.findMany as any)({
    where: user
      ? { userId: user.id }
      : { guestEmail: lookupEmail },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, amount: true, discountAmount: true, status: true,
      paymentProvider: true, createdAt: true,
      product: { select: { title: true, category: true } },
    },
  }) as Array<{
    id: string; amount: { toString(): string }; discountAmount: { toString(): string };
    status: string; paymentProvider: string; createdAt: Date;
    product: { title: string; category: string };
  }>;

  // Get last known device info — for registered users match by userId, for guests match by sessionId correlation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pv = (db as any).pageView;

  let lastView = null;
  let recentPaths: { path: string; createdAt: Date }[] = [];

  if (user) {
    // Registered user — look up by userId
    lastView = await pv.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: { ip: true, country: true, browser: true, os: true, device: true, userAgent: true, referrer: true, createdAt: true, path: true },
    });
    recentPaths = await pv.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { path: true, createdAt: true },
    });
  } else if (lookupEmail) {
    // Guest — we can't directly link page views to a guest email
    // Show a note that tracking requires login
    lastView = null;
  }

  const paidOrders = allOrders.filter((o) => o.status === "PAID");
  const totalSpent = paidOrders.reduce((s, o) => s + Number(o.amount), 0);
  const avgOrderValue = paidOrders.length > 0 ? totalSpent / paidOrders.length : 0;

  return (
    <CustomerClientPage 
      user={user}
      email={email}
      allOrders={allOrders}
      lastView={lastView}
      recentPaths={recentPaths}
      appUrl={appUrl}
    />
  );
}

import CustomerClientPage from "./CustomerClientPage";

