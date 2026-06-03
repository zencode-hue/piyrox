"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

/**
 * Saves bot configuration settings in the database.
 */
export async function saveBotSettings(data: {
  token: string;
  clientId: string;
  staffRoleId: string;
  logChannelId: string;
  transcriptChannelId: string;
  categoryId: string;
}) {
  await requireAdmin();

  const updates = [
    { key: "bot_discord_token", value: data.token },
    { key: "bot_client_id", value: data.clientId },
    { key: "bot_staff_role_id", value: data.staffRoleId },
    { key: "bot_log_channel_id", value: data.logChannelId },
    { key: "bot_transcript_channel_id", value: data.transcriptChannelId },
    { key: "bot_ticket_category_id", value: data.categoryId },
  ];

  await Promise.all(
    updates.map(item =>
      db.siteSetting.upsert({
        where: { key: item.key },
        update: { value: item.value },
        create: { key: item.key, value: item.value },
      })
    )
  );

  revalidatePath("/botdashboard");
  return { success: true };
}

/**
 * Helper to fetch Bot Token from Site Settings
 */
async function getBotToken() {
  const setting = await db.siteSetting.findUnique({
    where: { key: "bot_discord_token" },
  });
  return setting?.value || process.env.DISCORD_TOKEN;
}

/**
 * Sends a ticket panel embed directly to a Discord channel.
 */
export async function deployTicketPanel(channelId: string) {
  await requireAdmin();

  const token = await getBotToken();
  if (!token) {
    throw new Error("Discord Bot Token is missing. Save settings first.");
  }

  const payload = {
    embeds: [
      {
        title: "🎫  PIYROX Support Center",
        description:
          "Welcome to **PIYROX** support.\n" +
          "Select a category from the dropdown below to open a ticket.\n" +
          "Our team will assist you as soon as possible.\n\n" +
          "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
          "🎫  **Support** — Issues, questions, problems\n" +
          "📦  **Claim Order** — Claim a purchased product\n" +
          "📋  **Application** — Join the PIYROX staff team\n" +
          "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        color: 0xF59E0B, // PIYROX Gold
        fields: [
          { name: "⏱️  Response Time", value: "> Our team typically responds within **15–30 minutes**.", inline: false },
          {
            name: "📌  Before Opening a Ticket",
            value: "> • Check our [FAQ at piyrox.xyz](https://piyrox.xyz/support)\n> • Have your Order ID ready if applicable\n> • One ticket per issue please",
            inline: false,
          },
        ],
        footer: { text: "PIYROX • piyrox.xyz | Replacing Velxo Shop", icon_url: "https://piyrox.xyz/favicon.ico" },
      },
    ],
    components: [
      {
        type: 1, // ActionRow
        components: [
          {
            type: 3, // Select Menu
            custom_id: "ticket_dropdown",
            placeholder: "🎫  Open a ticket — select a category...",
            options: [
              { label: "Support", value: "support", emoji: { name: "🎫" }, description: "Get help with an issue or question" },
              { label: "Claim Order", value: "order", emoji: { name: "📦" }, description: "Claim a product you've purchased" },
              { label: "Staff Application", value: "application", emoji: { name: "📋" }, description: "Apply to join the PIYROX team" },
            ],
          },
        ],
      },
      {
        type: 1, // ActionRow
        components: [
          { type: 2, style: 5, label: "PIYROX", url: "https://piyrox.xyz", emoji: { name: "🛒" } },
          { type: 2, style: 5, label: "Browse Deals", url: "https://piyrox.xyz/deals", emoji: { name: "🔥" } },
          { type: 2, style: 5, label: "Support", url: "https://piyrox.xyz/support", emoji: { name: "🎫" } },
        ],
      },
    ],
  };

  const res = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bot ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Discord API error: ${errorText}`);
  }

  return { success: true };
}

/**
 * Dispatches an announcement embed directly to a Discord channel.
 */
export async function sendAnnouncement(channelId: string, data: {
  title: string;
  message: string;
  ping: boolean;
}) {
  await requireAdmin();

  const token = await getBotToken();
  if (!token) {
    throw new Error("Discord Bot Token is missing.");
  }

  const payload = {
    content: data.ping ? "@everyone" : undefined,
    embeds: [
      {
        title: data.title,
        description: data.message,
        color: 0xF59E0B, // PIYROX Gold
        fields: [
          {
            name: "\u200b",
            value: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n🚀  Instant Delivery  •  🔐  AES-256 Encrypted  •  🔄  Replacement Guarantee",
            inline: false,
          },
        ],
        footer: { text: "PIYROX • piyrox.xyz", icon_url: "https://piyrox.xyz/favicon.ico" },
        timestamp: new Date().toISOString(),
      },
    ],
  };

  const res = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bot ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Discord API error: ${errorText}`);
  }

  return { success: true };
}
