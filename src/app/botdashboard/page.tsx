import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import BotDashboardClient from "./BotDashboardClient";

export const dynamic = "force-dynamic";

export default async function BotDashboardPage() {
  // Ensure only authenticated MetraMart ADMINS can access this page
  await requireAdmin();

  // Load current site settings for pre-filling input forms
  const settingsKeys = [
    "bot_discord_token",
    "bot_client_id",
    "bot_staff_role_id",
    "bot_log_channel_id",
    "bot_transcript_channel_id",
    "bot_ticket_category_id",
  ];

  const siteSettings = await db.siteSetting.findMany({
    where: { key: { in: settingsKeys } },
  });

  // Extract settings or fall back to environment variables/defaults
  const config = {
    token: siteSettings.find(s => s.key === "bot_discord_token")?.value || process.env.DISCORD_TOKEN || "",
    clientId: siteSettings.find(s => s.key === "bot_client_id")?.value || process.env.CLIENT_ID || "",
    staffRoleId: siteSettings.find(s => s.key === "bot_staff_role_id")?.value || process.env.STAFF_ROLE_ID || "",
    logChannelId: siteSettings.find(s => s.key === "bot_log_channel_id")?.value || process.env.LOG_CHANNEL_ID || "",
    transcriptChannelId: siteSettings.find(s => s.key === "bot_transcript_channel_id")?.value || process.env.TRANSCRIPT_CHANNEL_ID || "",
    categoryId: siteSettings.find(s => s.key === "bot_ticket_category_id")?.value || process.env.TICKET_CATEGORY_ID || "",
  };

  // Load cached heartbeat statistics of the Discord bot
  const statusCache = await db.siteSetting.findUnique({
    where: { key: "bot_status_cache" },
  });

  let stats = null;
  if (statusCache?.value) {
    try {
      stats = JSON.parse(statusCache.value);
    } catch (e) {
      console.error("[Dashboard] Error parsing bot status cache:", e);
    }
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Navigation back to main Admin center */}
        <div className="mb-8">
          <a
            href="/admin"
            className="text-xs font-bold text-zinc-500 hover:text-amber-500 uppercase tracking-widest flex items-center gap-2 transition duration-300 w-fit"
          >
            ← Back to Admin Console
          </a>
        </div>

        <BotDashboardClient initialSettings={config} stats={stats} />
      </div>
    </div>
  );
}
