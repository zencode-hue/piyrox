"use client";

import { useState } from "react";
import { saveBotSettings, deployTicketPanel, sendAnnouncement } from "./actions";

interface BotStats {
  status: string;
  latency: number;
  guilds: number;
  tickets: number;
  uptime: number;
  lastHeartbeat: string;
}

interface BotDashboardClientProps {
  initialSettings: {
    token: string;
    clientId: string;
    staffRoleId: string;
    logChannelId: string;
    transcriptChannelId: string;
    categoryId: string;
  };
  stats: BotStats | null;
}

export default function BotDashboardClient({ initialSettings, stats }: BotDashboardClientProps) {
  // Settings Form State
  const [settings, setSettings] = useState(initialSettings);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Deploy Panel State
  const [deployChannelId, setDeployChannelId] = useState("");
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployMessage, setDeployMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Announcement State
  const [announceChannelId, setAnnounceChannelId] = useState("");
  const [announceTitle, setAnnounceTitle] = useState("");
  const [announceMessageContent, setAnnounceMessageContent] = useState("");
  const [announcePing, setAnnouncePing] = useState(false);
  const [isAnnouncing, setIsAnnouncing] = useState(false);
  const [announceStatus, setAnnounceStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Handle settings update
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setSettingsMessage(null);
    try {
      await saveBotSettings(settings);
      setSettingsMessage({ type: "success", text: "Settings saved successfully! Heartbeat reporting active." });
    } catch (err: any) {
      setSettingsMessage({ type: "error", text: err.message || "Failed to save settings." });
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Handle Panel Deploy
  const handleDeployPanel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deployChannelId) return;
    setIsDeploying(true);
    setDeployMessage(null);
    try {
      await deployTicketPanel(deployChannelId);
      setDeployMessage({ type: "success", text: "Ticket Selection Panel deployed successfully!" });
      setDeployChannelId("");
    } catch (err: any) {
      setDeployMessage({ type: "error", text: err.message || "Failed to deploy panel." });
    } finally {
      setIsDeploying(false);
    }
  };

  // Handle Announcement
  const handleSendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announceChannelId || !announceTitle || !announceMessageContent) return;
    setIsAnnouncing(true);
    setAnnounceStatus(null);
    try {
      await sendAnnouncement(announceChannelId, {
        title: announceTitle,
        message: announceMessageContent,
        ping: announcePing,
      });
      setAnnounceStatus({ type: "success", text: "Announcement broadcasted successfully!" });
      setAnnounceTitle("");
      setAnnounceMessageContent("");
    } catch (err: any) {
      setAnnounceStatus({ type: "error", text: err.message || "Failed to send announcement." });
    } finally {
      setIsAnnouncing(false);
    }
  };

  // Format Uptime (ms to readable)
  const formatUptime = (ms: number) => {
    if (!ms) return "0m";
    const totalSecs = Math.floor(ms / 1000);
    const days = Math.floor(totalSecs / 86400);
    const hours = Math.floor((totalSecs % 86400) / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const isOnline = stats ? (Date.now() - new Date(stats.lastHeartbeat).getTime() < 180000) : false;

  return (
    <div className="space-y-10">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-zinc-800 pb-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 bg-clip-text text-transparent">
            PIYROX Discord Dashboard
          </h1>
          <p className="mt-2 text-zinc-400 font-medium">
            Manage your Discord storefront ticketing bot, announcements, and configurations in real-time.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-3 bg-zinc-950/60 border border-zinc-800/80 px-4 py-2.5 rounded-full w-fit">
          <span className={`relative flex h-3.5 w-3.5`}>
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isOnline ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-3.5 w-3.5 ${isOnline ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
          </span>
          <span className="font-bold text-sm tracking-wide uppercase text-zinc-200">
            Bot Status: <span className={isOnline ? 'text-emerald-400' : 'text-rose-400'}>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
          </span>
        </div>
      </div>

      {/* METRICS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#0a0a0a]/80 border border-amber-500/10 rounded-2xl p-6 transition duration-300 hover:border-amber-500/20 hover:bg-[#0c0c0c]">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Client Latency</p>
          <p className="text-3xl font-extrabold mt-2 text-amber-500">{stats?.latency ?? "—"} <span className="text-sm font-medium text-zinc-400">ms</span></p>
        </div>
        <div className="bg-[#0a0a0a]/80 border border-amber-500/10 rounded-2xl p-6 transition duration-300 hover:border-amber-500/20 hover:bg-[#0c0c0c]">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Guilds Covered</p>
          <p className="text-3xl font-extrabold mt-2 text-zinc-100">{stats?.guilds ?? "—"}</p>
        </div>
        <div className="bg-[#0a0a0a]/80 border border-amber-500/10 rounded-2xl p-6 transition duration-300 hover:border-amber-500/20 hover:bg-[#0c0c0c]">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Active Tickets</p>
          <p className="text-3xl font-extrabold mt-2 text-zinc-100">{stats?.tickets ?? "—"}</p>
        </div>
        <div className="bg-[#0a0a0a]/80 border border-amber-500/10 rounded-2xl p-6 transition duration-300 hover:border-amber-500/20 hover:bg-[#0c0c0c]">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Uptime Duration</p>
          <p className="text-3xl font-extrabold mt-2 text-zinc-100">{stats ? formatUptime(stats.uptime) : "—"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* SETTINGS CARD */}
        <div className="lg:col-span-2 bg-[#090909] border border-zinc-800 rounded-3xl p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-3">
              ⚙️ Bot Site Configuration
            </h2>
            <p className="text-zinc-500 text-sm mt-1">
              Synchronize channel and group bindings mapped to the Discord instance.
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Discord Token</label>
                <input
                  type="password"
                  value={settings.token}
                  onChange={e => setSettings({ ...settings, token: e.target.value })}
                  placeholder="MTQ4ODYy..."
                  className="bg-zinc-950 border border-zinc-800 focus:border-amber-500/40 rounded-xl px-4 py-3 text-sm text-zinc-100 focus:outline-none transition"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Client Application ID</label>
                <input
                  type="text"
                  value={settings.clientId}
                  onChange={e => setSettings({ ...settings, clientId: e.target.value })}
                  placeholder="1488621542593138748"
                  className="bg-zinc-950 border border-zinc-800 focus:border-amber-500/40 rounded-xl px-4 py-3 text-sm text-zinc-100 focus:outline-none transition"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Staff Role ID</label>
                <input
                  type="text"
                  value={settings.staffRoleId}
                  onChange={e => setSettings({ ...settings, staffRoleId: e.target.value })}
                  placeholder="1387773245943713903"
                  className="bg-zinc-950 border border-zinc-800 focus:border-amber-500/40 rounded-xl px-4 py-3 text-sm text-zinc-100 focus:outline-none transition"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Log Channel ID</label>
                <input
                  type="text"
                  value={settings.logChannelId}
                  onChange={e => setSettings({ ...settings, logChannelId: e.target.value })}
                  placeholder="1387773401178964039"
                  className="bg-zinc-950 border border-zinc-800 focus:border-amber-500/40 rounded-xl px-4 py-3 text-sm text-zinc-100 focus:outline-none transition"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Transcript Channel ID</label>
                <input
                  type="text"
                  value={settings.transcriptChannelId}
                  onChange={e => setSettings({ ...settings, transcriptChannelId: e.target.value })}
                  placeholder="1387773397223608380"
                  className="bg-zinc-950 border border-zinc-800 focus:border-amber-500/40 rounded-xl px-4 py-3 text-sm text-zinc-100 focus:outline-none transition"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Ticket Category ID</label>
                <input
                  type="text"
                  value={settings.categoryId}
                  onChange={e => setSettings({ ...settings, categoryId: e.target.value })}
                  placeholder="1387773366605447192"
                  className="bg-zinc-950 border border-zinc-800 focus:border-amber-500/40 rounded-xl px-4 py-3 text-sm text-zinc-100 focus:outline-none transition"
                />
              </div>
            </div>

            {settingsMessage && (
              <div className={`p-4 rounded-xl text-sm font-semibold border ${settingsMessage.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-rose-500/10 border-rose-500/20 text-rose-400"}`}>
                {settingsMessage.text}
              </div>
            )}

            <button
              type="submit"
              disabled={isSavingSettings}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 text-black font-extrabold px-6 py-3.5 rounded-xl transition duration-300 shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 text-sm tracking-wide uppercase flex items-center justify-center gap-2"
            >
              {isSavingSettings ? "Saving Settings..." : "Save Bot Configuration"}
            </button>
          </form>
        </div>

        {/* QUICK ACTIONS CARD */}
        <div className="space-y-8">
          {/* DEPLOY TICKET PANEL CARD */}
          <div className="bg-[#090909] border border-zinc-800 rounded-3xl p-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-3">
                🎫 Deploy Support Panel
              </h2>
              <p className="text-zinc-500 text-xs mt-1">
                Post the interactive ticket dropdown panel into a specific text channel.
              </p>
            </div>

            <form onSubmit={handleDeployPanel} className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Target Channel ID</label>
                <input
                  type="text"
                  required
                  value={deployChannelId}
                  onChange={e => setDeployChannelId(e.target.value)}
                  placeholder="e.g. 1387773397223608380"
                  className="bg-zinc-950 border border-zinc-800 focus:border-amber-500/40 rounded-xl px-4 py-3 text-sm text-zinc-100 focus:outline-none transition w-full"
                />
              </div>

              {deployMessage && (
                <div className={`p-4 rounded-xl text-xs font-semibold border ${deployMessage.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-rose-500/10 border-rose-500/20 text-rose-400"}`}>
                  {deployMessage.text}
                </div>
              )}

              <button
                type="submit"
                disabled={isDeploying}
                className="w-full bg-zinc-900 border border-amber-500/20 hover:border-amber-500 text-amber-500 hover:text-black hover:bg-amber-500 font-extrabold py-3.5 rounded-xl transition duration-300 text-xs tracking-wide uppercase flex items-center justify-center gap-2"
              >
                {isDeploying ? "Deploying Panel..." : "Deploy Support Panel"}
              </button>
            </form>
          </div>

          {/* BROADCAST ANNOUNCEMENT CARD */}
          <div className="bg-[#090909] border border-zinc-800 rounded-3xl p-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-3">
                📢 Live Broadcast
              </h2>
              <p className="text-zinc-500 text-xs mt-1">
                Broadcast an official HTML/JSON styled embed announcement via the bot.
              </p>
            </div>

            <form onSubmit={handleSendAnnouncement} className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Target Channel ID</label>
                <input
                  type="text"
                  required
                  value={announceChannelId}
                  onChange={e => setAnnounceChannelId(e.target.value)}
                  placeholder="e.g. 1387773397223608380"
                  className="bg-zinc-950 border border-zinc-800 focus:border-amber-500/40 rounded-xl px-4 py-3 text-sm text-zinc-100 focus:outline-none transition w-full"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Announcement Title</label>
                <input
                  type="text"
                  required
                  value={announceTitle}
                  onChange={e => setAnnounceTitle(e.target.value)}
                  placeholder="🚀 Big Netflix Restock!"
                  className="bg-zinc-950 border border-zinc-800 focus:border-amber-500/40 rounded-xl px-4 py-3 text-sm text-zinc-100 focus:outline-none transition w-full"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Description Message</label>
                <textarea
                  required
                  rows={3}
                  value={announceMessageContent}
                  onChange={e => setAnnounceMessageContent(e.target.value)}
                  placeholder="Netflix Premium Ultra-HD accounts have been fully restocked! Visit piyrox.xyz to secure yours."
                  className="bg-zinc-950 border border-zinc-800 focus:border-amber-500/40 rounded-xl px-4 py-3 text-sm text-zinc-100 focus:outline-none transition w-full resize-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="pingEveryone"
                  checked={announcePing}
                  onChange={e => setAnnouncePing(e.target.checked)}
                  className="accent-amber-500 h-4 w-4 bg-zinc-950 border-zinc-800 rounded focus:ring-0 focus:outline-none"
                />
                <label htmlFor="pingEveryone" className="text-xs font-semibold text-zinc-400 cursor-pointer select-none">
                  Ping Everyone (@everyone)
                </label>
              </div>

              {announceStatus && (
                <div className={`p-4 rounded-xl text-xs font-semibold border ${announceStatus.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-rose-500/10 border-rose-500/20 text-rose-400"}`}>
                  {announceStatus.text}
                </div>
              )}

              <button
                type="submit"
                disabled={isAnnouncing}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 text-black font-extrabold py-3.5 rounded-xl transition duration-300 text-xs tracking-wide uppercase flex items-center justify-center gap-2"
              >
                {isAnnouncing ? "Broadcasting..." : "Broadcast Announcement"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
