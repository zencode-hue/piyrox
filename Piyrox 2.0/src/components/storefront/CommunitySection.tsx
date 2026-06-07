"use client";

import { MessageCircle, Send, ArrowRight } from "lucide-react";

interface Props {
  discordUrl: string;
  telegramUrl: string;
  discordMembers: string;
  telegramMembers: string;
}

export default function CommunitySection({ discordUrl, telegramUrl, discordMembers, telegramMembers }: Props) {
  return (
    <section className="border-t border-white/5" style={{ backgroundColor: "#09090b" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 mb-3">Community</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Join Our Community</h2>
          <p className="text-zinc-500 mt-3 max-w-lg mx-auto">
            Connect with thousands of members. Get support, updates, and exclusive deals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Discord */}
          <div
            className="rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <MessageCircle size={22} className="text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Discord</h3>
            <p className="text-sm text-zinc-500 mb-4">{discordMembers} members · 24/7 support</p>
            <a
              href={discordUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-white text-black hover:bg-zinc-200 transition-colors"
            >
              Join Server <ArrowRight size={14} />
            </a>
          </div>

          {/* Telegram */}
          {telegramUrl && (
            <div
              className="rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <Send size={22} className="text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Telegram</h3>
              <p className="text-sm text-zinc-500 mb-4">{telegramMembers || "Growing"} members · Announcements</p>
              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-white text-black hover:bg-zinc-200 transition-colors"
              >
                Join Channel <ArrowRight size={14} />
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
