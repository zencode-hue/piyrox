import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin-auth";
import { z } from "zod";

const updateSchema = z.object({
  balance: z.number().optional(),
  isBanned: z.boolean().optional(),
  banReason: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error: authError } = await requireAdminApi();
    if (authError) return authError;

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const userId = params.id;
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { balance, isBanned, banReason, name } = parsed.data;

    // If balance changed, log a transaction
    if (balance !== undefined && balance !== Number(user.balance)) {
      const diff = balance - Number(user.balance);
      await db.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: userId },
          data: { balance },
        });
        await tx.balanceTransaction.create({
          data: {
            userId,
            amount: diff,
            type: diff > 0 ? "ADMIN_CREDIT" : "ADMIN_DEBIT",
            description: `Manual adjustment by admin.`,
          },
        });
      });
    } else {
      await db.user.update({
        where: { id: userId },
        data: {
          isBanned: isBanned ?? undefined,
          banReason: banReason ?? undefined,
          name: name ?? undefined,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[PATCH /api/admin/customers/[id]]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
