"use client";

import { useState } from "react";
import { Send, Loader2, CheckCircle, AlertTriangle, Settings, Package, FileText, Star, Trash2, MessageSquare, Terminal, BarChart3 } from "lucide-react";

export default function SetupPage() {
  return <SetupClient />;
}

function SetupClient() {
  const [results, setResults] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [discordMsg, setDiscordMsg] = useState("");
  const [discordSending, setDiscordSending] = useState(false);
  const [discordResult, setDiscordResult] = useState<string | null>(null);

  async function run(name: string, url: string) {
    setLoading((l) => ({ ...l, [name]: true }));
    try {
      const token = prompt("Enter ADMIN_SETUP_TOKEN:");
      if (!token) return;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      setResults((r) => ({ ...r, [name]: data.message ?? data.error ?? JSON.stringify(data) }));
    } catch (e) {
      setResults((r) => ({ ...r, [name]: "Error: " + String(e) }));
    } finally {
      setLoading((l) => ({ ...l, [name]: false }));
    }
  }

  async function runGet(name: string, url: string) {
    setLoading((l) => ({ ...l, [name]: true }));
    try {
      const res = await fetch(url);
      const data = await res.json();
      setResults((r) => ({ ...r, [name]: data.ok ? `Done! Created: ${data.created ?? ""}, Skipped: ${data.skipped ?? ""}` : (data.error ?? JSON.stringify(data)) }));
    } catch (e) {
      setResults((r) => ({ ...r, [name]: "Error: " + String(e) }));
    } finally {
      setLoading((l) => ({ ...l, [name]: false }));
    }
  }

  async function pushDealsNotification() {
    setDiscordSending(true);
    setDiscordResult(null);
    try {
      const res = await fetch("/api/admin/discord-push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "deals" }),
      });
      const data = await res.json();
      setDiscordResult(data.ok ? `Sent! ${data.dealsNotified ?? ""} deals notified.` : `Error: ${data.error ?? data.message}`);
    } catch (e) {
      setDiscordResult("Error: " + String(e));
    } finally {
      setDiscordSending(false);
    }
  }

  async function pushCustomMessage() {
    if (!discordMsg.trim()) return;
    setDiscordSending(true);
    setDiscordResult(null);
    try {
      const res = await fetch("/api/admin/discord-push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: discordMsg }),
      });
      const data = await res.json();
      setDiscordResult(data.ok ? "Message sent to Discord!" : `Error: ${data.error}`);
      if (data.ok) setDiscordMsg("");
    } catch (e) {
      setDiscordResult("Error: " + String(e));
    } finally {
      setDiscordSending(false);
    }
  }

  const tasks: Array<{ name: string; url: string; desc: string; method?: "GET" | "POST"; icon: React.ElementType; color: string; bg: string }> = [
    { name: "Seed Products", url: "/api/auth/seed-products", desc: "Add 37 products to the database", icon: Package, color: "text-orange-400", bg: "bg-orange-500/10" },
    { name: "Fix Products (Unlimited Stock)", url: "/api/auth/fix-products", desc: "Set all products to unlimited stock + 100-999 count", icon: BarChart3, color: "text-blue-400", bg: "bg-blue-500/10" },
    { name: "Seed Blog Posts", url: "/api/auth/seed-blog", desc: "Add 6 blog posts to the database", icon: FileText, color: "text-purple-400", bg: "bg-purple-500/10" },
    { name: "Seed SEO Blog Posts", url: "/api/auth/seed-seo-blogs", desc: "Add 5 SEO-optimised blog posts (Netflix, Spotify, IPTV...)", method: "GET", icon: FileText, color: "text-green-400", bg: "bg-green-500/10" },
    { name: "Seed Product Reviews", url: "/api/auth/seed-reviews", desc: "Add realistic customer reviews to all products", method: "GET", icon: Star, color: "text-yellow-400", bg: "bg-yellow-500/10" },
    { name: "Cleanup Seed Users", url: "/api/auth/cleanup-seed-users", desc: "Remove fake seed users/orders but keep reviews on site", method: "GET", icon: Trash2, color: "text-red-400", bg: "bg-red-500/10" },
    { name: "Set Product Ratings", url: "/api/auth/seed-ratings", desc: "Give all products 4.2-5.0 star ratings", icon: Star, color: "text-amber-400", bg: "bg-amber-500/10" },
    { name: "Setup Admin", url: "/api/auth/setup-admin", desc: "Create the admin account", icon: Settings, color: "text-zinc-400", bg: "bg-white/5" },
  ];

  return (
    <div className="max-w-3xl space-y-10 pb-10">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20 shrink-0">
          <Terminal size={28} className="text-black" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">One-Time Setup</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Run these tasks once to initialize your store data</p>
        </div>
      </div>

      {/* Setup Tasks */}
      <div>
        <h2 className="text-[11px] font-black uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
          <Settings size={14} /> Initialization Tasks
        </h2>
        <div className="space-y-3">
          {tasks.map((task) => {
            const isDone = results[task.name] && !results[task.name].includes("Error");
            const isErr = results[task.name]?.includes("Error");
            return (
              <div key={task.name} className="admin-card p-5 flex items-center justify-between gap-4 hover:border-white/10 transition-colors group">
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${task.bg}`}>
                    <task.icon size={18} className={task.color} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors">{task.name}</p>
                    <p className="text-xs text-zinc-600 mt-0.5">{task.desc}</p>
                    {results[task.name] && (
                      <p className={`text-xs mt-1.5 font-bold flex items-center gap-1.5 ${isErr ? "text-red-400" : "text-green-400"}`}>
                        {isErr ? <AlertTriangle size={12} /> : <CheckCircle size={12} />}
                        {results[task.name]}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => task.method === "GET" ? runGet(task.name, task.url) : run(task.name, task.url)}
                  disabled={loading[task.name]}
                  className={`text-[11px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all shrink-0 disabled:opacity-50 flex items-center gap-2 ${
                    isDone 
                      ? "bg-green-500/10 text-green-400 border border-green-500/20" 
                      : "bg-orange-500 hover:bg-orange-600 text-black"
                  }`}
                >
                  {loading[task.name] ? <Loader2 size={14} className="animate-spin" /> : isDone ? <CheckCircle size={14} /> : null}
                  {loading[task.name] ? "Running..." : isDone ? "Done" : "Run"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Discord Notifications */}
      <div>
        <h2 className="text-[11px] font-black uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
          <MessageSquare size={14} /> Discord Notifications
        </h2>
        <p className="text-sm font-medium text-zinc-600 mb-4">Push messages to your Discord server manually.</p>

        <div className="space-y-4">
          {/* Push Deals */}
          <div className="admin-card p-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-white">Push Today&apos;s Hot Deals</p>
              <p className="text-xs text-zinc-500 mt-0.5">Send the current daily deals embed to Discord right now</p>
            </div>
            <button onClick={pushDealsNotification} disabled={discordSending}
              className="bg-orange-500 hover:bg-orange-600 text-black font-black text-sm px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shrink-0 disabled:opacity-50">
              {discordSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              Push Deals
            </button>
          </div>

          {/* Custom Message */}
          <div className="admin-card p-5 space-y-4">
            <div>
              <p className="text-sm font-bold text-white">Custom Discord Message</p>
              <p className="text-xs text-zinc-500 mt-0.5">Send any custom announcement to your Discord webhook</p>
            </div>
            <textarea
              value={discordMsg}
              onChange={(e) => setDiscordMsg(e.target.value)}
              placeholder="Type your announcement here..."
              rows={4}
              className="input-field text-sm resize-none w-full leading-relaxed"
            />
            <button onClick={pushCustomMessage} disabled={discordSending || !discordMsg.trim()}
              className="bg-orange-500 hover:bg-orange-600 text-black font-black text-sm px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all disabled:opacity-50">
              {discordSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              Send to Discord
            </button>
          </div>

          {discordResult && (
            <div className={`flex items-center gap-3 p-4 rounded-xl text-sm font-bold border ${
              discordResult.includes("Error") 
                ? "bg-red-500/10 border-red-500/20 text-red-400" 
                : "bg-green-500/10 border-green-500/20 text-green-400"
            }`}>
              {discordResult.includes("Error") ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
              {discordResult}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
