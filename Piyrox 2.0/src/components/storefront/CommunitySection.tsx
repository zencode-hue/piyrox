"use client";

import Link from "next/link";
import { MessageCircle, Send, Users } from "lucide-react";

interface Props {
  discordUrl: string;
  telegramUrl: string;
  discordMembers: string;
  telegramMembers: string;
}

const platforms = [
  {
    key: "discord" as const,
    icon: MessageCircle,
    label: "Discord",
    desc: "Get instant support, exclusive deals, and connect with the community.",
    cta: "Join Discord",
  },
  {
    key: "telegram" as const,
    icon: Send,
    label: "Telegram",
    desc: "Get deal alerts, restock notifications, and updates straight to your phone.",
    cta: "Join Telegram",
  },
];

export default function CommunitySection({
  discordUrl,
  telegramUrl,
  discordMembers,
  telegramMembers,
}: Props) {
  const urls = { discord: discordUrl, telegram: telegramUrl };
  const members = { discord: discordMembers, telegram: telegramMembers };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="text-2xl font-bold text-white text-center mb-8">
        Join Our Community
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {platforms.map((p) => {
          const Icon = p.icon;
          const url = urls[p.key];
          const count = members[p.key];

          if (!url) return null;

          return (
            <div
              key={p.key}
              className="rounded-2xl p-6 sm:p-8 flex flex-col gap-4"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <Icon size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">
                    {p.label}
                  </h3>
                  {count && (
                    <span className="flex items-center gap-1 text-xs text-zinc-400">
                      <Users size={10} />
                      {count} members
                    </span>
                  )}
                </div>
              </div>

              <p className="text-sm text-zinc-400 leading-relaxed">{p.desc}</p>

              <Link
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black text-sm font-semibold hover:bg-zinc-200 transition-colors"
              >
                <Icon size={15} />
                {p.cta}
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
