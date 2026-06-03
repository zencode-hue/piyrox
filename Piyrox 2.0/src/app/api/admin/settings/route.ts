import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = await requireAdminApi();
  if (error) return error;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const settings = await (db as any).siteSetting.findMany();
  const map: Record<string, string> = {};
  for (const s of settings) map[s.key] = s.value;
  return NextResponse.json({ data: map, error: null });
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const body = await req.json() as Record<string, string>;
  for (const [key, value] of Object.entries(body)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db as any).siteSetting.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) },
    });
  }
  return NextResponse.json({ data: { saved: true }, error: null });
}
