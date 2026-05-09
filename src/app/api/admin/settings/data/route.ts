import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { error: authError } = await requireAdminApi();
    if (authError) return authError;

    const settings = await db.siteSetting.findMany();
    const map: Record<string, string> = {};
    for (const s of settings) map[s.key] = s.value;

    return NextResponse.json({ settings: map });
  } catch (error) {
    console.error("[Settings Data Error]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
