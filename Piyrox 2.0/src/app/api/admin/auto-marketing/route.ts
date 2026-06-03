import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * AUTOMATED MARKETING ENGINE (CRON)
 * This route is designed to be called by Vercel Cron or an external ping service.
 * It autonomously picks a trending product and launches a Social Blast.
 */
export async function GET(req: NextRequest) {
  try {
    // 1. Security Check (Basic API Key or Cron Secret)
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Unauthorized Cron Access" }, { status: 401 });
    }

    // 2. Check if Automation is Enabled
    const enabledSetting = await db.siteSetting.findUnique({ where: { key: "marketing_automation_enabled" } });
    if (enabledSetting?.value !== "true") {
      return NextResponse.json({ message: "Marketing automation is disabled in settings." });
    }

    // 3. Prevent Double Posting (Once every 6 hours max)
    const lastBlastSetting = await db.siteSetting.findUnique({ where: { key: "last_auto_blast_at" } });
    const lastBlast = lastBlastSetting ? new Date(lastBlastSetting.value) : new Date(0);
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);

    if (lastBlast > sixHoursAgo) {
      return NextResponse.json({ message: "Skipping: Last blast was too recent." });
    }

    // 3. Trigger Social Blast
    const origin = new URL(req.url).origin;
    const bypassHeaders = { "X-Internal-AI-Bypass": process.env.INTERNAL_BYPASS_KEY || "piyrox-ai-secret-2024" };

    const blastRes = await fetch(`${origin}/api/admin/social-blast`, {
      method: "POST",
      headers: { ...bypassHeaders, "Content-Type": "application/json" },
    });

    const blastData = await blastRes.json();
    if (!blastRes.ok) throw new Error(blastData.error || "Blast trigger failed");

    // 4. Update Last Blast Timestamp
    await db.siteSetting.upsert({
      where: { key: "last_auto_blast_at" },
      update: { value: new Date().toISOString() },
      create: { key: "last_auto_blast_at", value: new Date().toISOString() }
    });

    return NextResponse.json({ 
      ok: true, 
      message: "Automated Marketing Blast Executed!",
      product: blastData.product,
      ad: blastData.ad
    });

  } catch (error) {
    console.error("[Auto Marketing Error]:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
