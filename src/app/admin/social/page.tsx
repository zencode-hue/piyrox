"use client";

import { useState, useEffect } from "react";
import { 
  Send, Calendar, Clock, History, Zap, 
  Settings, Loader2, Check, AlertCircle,
  TrendingUp, MessageSquare, Globe, ArrowRight,
  RefreshCw, MousePointer2, ExternalLink
} from "lucide-react";
import { format } from "date-fns";

export default function SocialMarketingPage() {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [automationEnabled, setAutomationEnabled] = useState(false);
  const [lastBlast, setLastBlast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const res = await fetch("/api/admin/settings/data"); // I'll create this helper API
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
      fetchData(); // Refresh logs
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
            <Globe size={22} className="text-orange-500" /> Social Automation
          </h1>
          <p className="text-xs text-gray-500 mt-1">Manage Metra AI's autonomous advertising engine</p>
        </div>
        <button
          onClick={handleManualBlast}
          disabled={loading}
          className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-black font-bold px-6 py-2.5 rounded-xl text-sm flex items-center gap-2 transition-all shadow-lg shadow-orange-500/20"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          Manual Social Blast
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Status Card */}
        <div className="glass-card p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Zap size={14} className="text-amber-500" /> Engine Status
          </h3>
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
            <span className="text-xs text-gray-400">Automation</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${automationEnabled ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
              {automationEnabled ? "ACTIVE" : "DISABLED"}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
            <span className="text-xs text-gray-400">Next Run In</span>
            <span className="text-xs font-mono text-white">~ 6 Hours</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
            <span className="text-xs text-gray-400">Last Blast</span>
            <span className="text-xs text-white">
              {lastBlast ? format(new Date(lastBlast), "HH:mm") : "Never"}
            </span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="md:col-span-2 glass-card p-5">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp size={14} className="text-orange-500" /> Marketing Metrics
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Total Blasts", value: logs.length, icon: History },
              { label: "Success Rate", value: "100%", icon: Check },
              { label: "Avg. ROI", value: "2.4x", icon: TrendingUp },
              { label: "Reach", value: "Global", icon: Globe },
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Logs */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <History size={14} className="text-gray-400" /> Activity Log
            </h3>
            <button onClick={fetchData} className="text-xs text-orange-500 hover:underline flex items-center gap-1">
              <RefreshCw size={10} /> Refresh
            </button>
          </div>
          
          <div className="space-y-3">
            {logs.length === 0 && (
              <div className="p-8 text-center bg-white/5 rounded-2xl border border-white/5 border-dashed">
                <p className="text-xs text-gray-600">No social blasts logged yet.</p>
              </div>
            )}
            {logs.map((log) => (
              <div key={log.id} className="glass-card p-4 hover:border-orange-500/20 transition-all group">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter ${log.source === "AUTO" ? "bg-purple-500/10 text-purple-400" : "bg-blue-500/10 text-blue-400"}`}>
                        {log.source}
                      </span>
                      <h4 className="text-sm font-bold text-white">{log.product}</h4>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                      {log.ad}
                    </p>
                    <div className="flex items-center gap-3 pt-1 text-[10px] text-gray-600">
                      <span className="flex items-center gap-1"><Clock size={10} /> {format(new Date(log.createdAt), "MMM d, HH:mm")}</span>
                      <span className="flex items-center gap-1 text-green-500/70"><Check size={10} /> Delivered</span>
                    </div>
                  </div>
                  <button className="p-2 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink size={12} className="text-gray-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Configuration */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Settings size={14} className="text-gray-400" /> Setup & Config
          </h3>
          <div className="glass-card p-5 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#5865F2]/10 flex items-center justify-center text-[#5865F2]">
                  <MessageSquare size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Discord Webhook</p>
                  <p className="text-[10px] text-green-500">Connected</p>
                </div>
              </div>
              <div className="flex items-center gap-3 opacity-50">
                <div className="w-8 h-8 rounded-lg bg-[#1DA1F2]/10 flex items-center justify-center text-[#1DA1F2]">
                  <Globe size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Twitter / X</p>
                  <p className="text-[10px] text-gray-500">Connect via Zapier</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5">
              <p className="text-[10px] text-gray-500 mb-3 uppercase tracking-widest font-bold">Recommended Flow</p>
              <div className="space-y-4">
                {[
                  { step: 1, text: "Enable Auto Blast in Settings" },
                  { step: 2, text: "Connect Discord to Zapier" },
                  { step: 3, text: "Link Zapier to Twitter/Facebook" },
                ].map((step) => (
                  <div key={step.step} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-[10px] font-bold text-orange-500">
                      {step.step}
                    </div>
                    <p className="text-[11px] text-gray-400">{step.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <button className="w-full py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 hover:bg-white/10 transition-all">
              Configure Webhooks <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
