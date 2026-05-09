"use client";

import { useState, useEffect } from "react";
import { 
  Send, Calendar, Clock, History, Zap, 
  Settings, Loader2, Check, AlertCircle,
  TrendingUp, MessageSquare, Globe, ArrowRight,
  RefreshCw, MousePointer2, ExternalLink,
  Twitter, Facebook, Instagram, Hash, Info
} from "lucide-react";
import { format } from "date-fns";

export default function SocialMarketingPage() {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [automationEnabled, setAutomationEnabled] = useState(false);
  const [lastBlast, setLastBlast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const res = await fetch("/api/admin/settings/data");
      const data = await res.json();
      const logsRaw = data.settings["social_blast_logs"];
      setLogs(logsRaw ? JSON.parse(logsRaw) : []);
      setAutomationEnabled(data.settings["marketing_automation_enabled"] === "true");
      setLastBlast(data.settings["last_auto_blast_at"]);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleManualBlast() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/social-blast", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Globe size={22} className="text-orange-500" /> Multi-Channel Automation
          </h1>
          <p className="text-xs text-gray-500 mt-1">Autonomous ad generation for Twitter, Instagram, Facebook & Discord</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowGuide(!showGuide)} className="btn-secondary py-2.5 px-4 text-xs gap-2">
            <Info size={14} /> Zapier Guide
          </button>
          <button
            onClick={handleManualBlast}
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-black font-bold px-6 py-2.5 rounded-xl text-sm flex items-center gap-2 transition-all shadow-lg shadow-orange-500/20"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            Manual Multi-Blast
          </button>
        </div>
      </div>

      {showGuide && (
        <div className="glass-card p-6 border-amber-500/30 bg-amber-500/5 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
                <img src="https://upload.wikimedia.org/wikipedia/commons/e/e0/Zapier_logo.png" alt="Zapier" className="w-6 h-6 object-contain" />
              </div>
              <h3 className="text-lg font-bold text-white">How to connect ALL Social Media</h3>
            </div>
            <button onClick={() => setShowGuide(false)} className="text-gray-500 hover:text-white">
              <AlertCircle size={20} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div className="space-y-2">
              <p className="font-bold text-amber-500">1. Setup Webhook</p>
              <p className="text-gray-400 text-xs leading-relaxed">
                Go to Zapier, create a new Zap with <strong>"Webhooks by Zapier"</strong> as the Trigger (Event: Catch Hook). Copy the URL.
              </p>
            </div>
            <div className="space-y-2">
              <p className="font-bold text-amber-500">2. Paste in Settings</p>
              <p className="text-gray-400 text-xs leading-relaxed">
                Go to Admin Settings → Marketing Automation and paste the URL into <strong>"Zapier Outbound Webhook"</strong>.
              </p>
            </div>
            <div className="space-y-2">
              <p className="font-bold text-amber-500">3. Map Socials</p>
              <p className="text-gray-400 text-xs leading-relaxed">
                Add actions in Zapier for Twitter, Facebook Page, or Instagram. Metra AI will automatically send tailored copy for each.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Zap size={14} className="text-amber-500" /> Channels
          </h3>
          <div className="space-y-2">
            {[
              { icon: MessageSquare, label: "Discord", status: "Connected", color: "text-[#5865F2]" },
              { icon: Twitter, label: "Twitter / X", status: "via Zapier", color: "text-[#1DA1F2]" },
              { icon: Facebook, label: "Facebook", status: "via Zapier", color: "text-[#1877F2]" },
              { icon: Instagram, label: "Instagram", status: "via Zapier", color: "text-[#E4405F]" },
            ].map((channel) => (
              <div key={channel.label} className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-2">
                  <channel.icon size={14} className={channel.color} />
                  <span className="text-xs text-gray-300">{channel.label}</span>
                </div>
                <span className="text-[9px] font-bold opacity-60">{channel.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="md:col-span-2 glass-card p-5">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp size={14} className="text-orange-500" /> Growth & Insights
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Total Blasts", value: logs.length, icon: History },
              { label: "Success Rate", value: "100%", icon: Check },
              { label: "AI Vibe", value: "Hype", icon: Zap },
              { label: "Automated", value: automationEnabled ? "ON" : "OFF", icon: Clock },
            ].map((stat) => (
              <div key={stat.label} className="p-3 rounded-2xl bg-white/5 border border-white/5 text-center">
                <stat.icon size={16} className="mx-auto mb-2 text-gray-500" />
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">{stat.label}</p>
                <p className="text-lg font-bold text-white">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <History size={14} className="text-gray-400" /> Multi-Blast History
          </h3>
          <button onClick={fetchData} className="text-xs text-orange-500 hover:underline flex items-center gap-1">
            <RefreshCw size={10} /> Sync
          </button>
        </div>
        
        <div className="space-y-4">
          {logs.length === 0 && (
            <div className="p-12 text-center bg-white/5 rounded-3xl border border-white/5 border-dashed">
              <p className="text-sm text-gray-600">Your marketing department is idle. Click "Manual Multi-Blast" to start.</p>
            </div>
          )}
          {logs.map((log) => (
            <div key={log.id} className="glass-card p-5 hover:border-orange-500/30 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <div className="flex items-center gap-1 text-[10px] text-gray-600">
                  <Clock size={10} /> {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${log.source === "AUTO" ? "bg-purple-500/10 text-purple-400" : "bg-blue-500/10 text-blue-400"}`}>
                  {log.source} BLAST
                </div>
                <h4 className="text-lg font-bold text-white">{log.product}</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                  <div className="flex items-center gap-2 text-[#1DA1F2]">
                    <Twitter size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">X / Twitter</span>
                  </div>
                  <p className="text-xs text-gray-400 italic">"{log.ads?.twitter || log.ad}"</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                  <div className="flex items-center gap-2 text-[#E4405F]">
                    <Instagram size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Meta Channels</span>
                  </div>
                  <p className="text-xs text-gray-400 italic">"{log.ads?.instagram || log.ad}"</p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-4 text-[10px]">
                <div className="flex items-center gap-1.5 text-green-400 font-bold">
                  <Check size={12} /> BLASTED TO:
                </div>
                <div className="flex items-center gap-2">
                  {log.destinations?.map((d: string) => (
                    <span key={d} className="bg-white/5 px-2 py-0.5 rounded border border-white/5 text-gray-500">{d}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
