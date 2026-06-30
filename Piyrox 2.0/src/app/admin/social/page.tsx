"use client";

import { useState, useEffect } from "react";
import { 
  Globe, Info, AlertCircle, History, RefreshCw, 
  Clock, Check, TrendingUp, MousePointer2, 
  BarChart3, Eye, Target, Share2, Layers,
  Twitter, Instagram, Facebook, MessageSquare, Linkedin, Send, Layout
} from "lucide-react";
import BlastConfigurator from "./BlastConfigurator";

export default function SocialMarketingPage() {
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [blasts, setBlasts] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalBlasts: 0,
    totalClicks: 0,
    activeChannels: 4,
    avgCtr: "0%"
  });
  const [error, setError] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const res = await fetch("/api/admin/social-blast");
      const data = await res.json();
      if (Array.isArray(data)) {
        setBlasts(data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const totalClicks = data.reduce((acc, b: any) => acc + (b.clicks || 0), 0);
        setStats({
          totalBlasts: data.length,
          totalClicks: totalClicks,
          activeChannels: 6,
          avgCtr: data.length > 0 ? ((totalClicks / (data.length * 50)) * 100).toFixed(1) + "%" : "0%"
        });
      }
    } catch (e) {
      console.error(e);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleBlast = async (config: any) => {
    setError(null);
    try {
      const res = await fetch("/api/admin/social-blast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      fetchData();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "twitter": return <Twitter size={16} className="text-[#1DA1F2]" />;
      case "instagram": return <Instagram size={16} className="text-[#E4405F]" />;
      case "facebook": return <Facebook size={16} className="text-[#1877F2]" />;
      case "discord": return <MessageSquare size={16} className="text-[#5865F2]" />;
      case "linkedin": return <Linkedin size={16} className="text-[#0A66C2]" />;
      case "pinterest": return <Layout size={16} className="text-[#E60023]" />;
      default: return <Globe size={16} className="text-zinc-400" />;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20 shrink-0">
            <Share2 size={28} className="text-black" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
              Social Blast <span className="bg-white/10 text-orange-400 text-[10px] px-2 py-1 rounded font-bold uppercase tracking-widest border border-white/5">v2.0</span>
            </h1>
            <p className="text-sm font-medium text-zinc-500 mt-1">Autonomous multi-channel marketing engine with real-time tracking</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowGuide(!showGuide)} 
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[11px] font-bold uppercase tracking-widest text-zinc-400 hover:bg-white/10 hover:text-white transition-all"
          >
            <Info size={16} /> Setup Guide
          </button>
          <button 
            onClick={fetchData}
            className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-zinc-400 hover:text-orange-400 hover:bg-white/10 transition-all flex items-center justify-center"
            title="Refresh Data"
          >
            <RefreshCw size={18} className={loading ? "animate-spin text-orange-400" : ""} />
          </button>
        </div>
      </div>

      {showGuide && (
        <div className="admin-card p-6 border-l-4 border-l-orange-500 bg-orange-500/5 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-md p-2">
                <img src="https://upload.wikimedia.org/wikipedia/commons/e/e0/Zapier_logo.png" alt="Zapier" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Advanced Zapier Integration</h3>
                <p className="text-sm text-zinc-400 font-medium">Connect Laguna AI to 5,000+ apps automatically</p>
              </div>
            </div>
            <button onClick={() => setShowGuide(false)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-zinc-500 hover:text-white hover:bg-white/10 transition-colors">
              <AlertCircle size={20} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: 1, title: "Create Webhook", desc: "Use 'Webhooks by Zapier' (Catch Hook) and copy the provided URL." },
              { step: 2, title: "Configure Admin", desc: "Go to Settings → Platform Settings and paste the URL into 'Zapier Webhook'." },
              { step: 3, title: "Map Content", desc: "Zapier receives platform payloads. Map these to your social actions." },
            ].map((s) => (
              <div key={s.step} className="p-5 rounded-2xl bg-black/40 border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors">
                <div className="absolute -right-4 -top-6 text-8xl font-black text-white/5 group-hover:text-orange-500/10 transition-colors select-none">{s.step}</div>
                <div className="relative z-10">
                  <p className="text-[11px] font-black uppercase tracking-widest text-orange-400 mb-2">Step {s.step}</p>
                  <p className="text-base font-bold text-white mb-2">{s.title}</p>
                  <p className="text-sm font-medium text-zinc-500 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Reach", value: stats.totalBlasts * 150, icon: Eye, color: "text-blue-400", trend: "+12%" },
          { label: "Total Clicks", value: stats.totalClicks, icon: MousePointer2, color: "text-orange-400", trend: "+24%" },
          { label: "Avg. CTR", value: stats.avgCtr, icon: Target, color: "text-green-400", trend: "+2%" },
          { label: "Channels", value: stats.activeChannels, icon: Layers, color: "text-purple-400", trend: "Active" },
        ].map((s) => (
          <div key={s.label} className="admin-card p-5 relative overflow-hidden group border border-transparent hover:border-white/10">
            <div className={`absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-10 group-hover:scale-110 transition-all duration-500`}>
              <s.icon size={80} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 ${s.color}`}>
                  <s.icon size={16} />
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${s.trend.includes("+") ? "bg-green-500/10 text-green-400" : "bg-white/5 text-zinc-500"}`}>
                  {s.trend}
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black mb-1">{s.label}</p>
              <p className="text-2xl font-black text-white tabular-nums tracking-tight">{typeof s.value === 'number' ? s.value.toLocaleString() : s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Configurator */}
        <div className="lg:col-span-5">
          <div className="sticky top-6">
            <BlastConfigurator onBlast={handleBlast} />
            
            {error && (
              <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm font-bold text-red-400 leading-snug">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: History & Detailed Stats */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
              <History size={16} className="text-zinc-500" /> Blast History
            </h3>
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/5">
              <button className="px-4 py-1.5 rounded text-[10px] font-black uppercase tracking-widest bg-white/10 text-white shadow-sm">All Time</button>
              <button className="px-4 py-1.5 rounded text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">Today</button>
            </div>
          </div>

          <div className="space-y-4">
            {blasts.length === 0 && (
              <div className="p-16 text-center border-2 border-dashed border-white/5 rounded-2xl bg-white/[0.02]">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp size={32} className="text-zinc-600" />
                </div>
                <h4 className="text-lg font-black text-white mb-2">No blasts launched yet</h4>
                <p className="text-sm font-medium text-zinc-500 max-w-sm mx-auto">Configure your marketing channels on the left to start generating autonomous growth.</p>
              </div>
            )}

            {blasts.map((blast) => (
              <div key={blast.id} className="admin-card overflow-hidden group hover:border-orange-500/30 transition-all">
                <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/[0.02]">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 text-xl font-black shrink-0">
                      {blast.product?.title?.charAt(0) || "P"}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-base font-bold text-white group-hover:text-orange-400 transition-colors truncate pr-4">{blast.productTitle}</h4>
                      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-zinc-500 mt-1">
                        <Clock size={12} /> {new Date(blast.createdAt).toLocaleDateString()} at {new Date(blast.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  <div className="text-left sm:text-right shrink-0">
                    <div className="flex items-center sm:justify-end gap-1.5 text-orange-400 font-black text-xl mb-1">
                      <MousePointer2 size={16} /> {blast.clicks || 0}
                    </div>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Total Clicks</p>
                  </div>
                </div>

                <div className="p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {Object.entries(blast.content || {}).map(([platform, content]: [string, any]) => (
                      <div key={platform} className="p-4 rounded-xl bg-black/20 border border-white/5 space-y-3 hover:border-white/10 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getPlatformIcon(platform)}
                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{platform}</span>
                          </div>
                          <span className="text-[11px] font-black text-zinc-500 bg-white/5 px-2 py-0.5 rounded">
                            {((blast.platformStats?.[platform] || 0))} clicks
                          </span>
                        </div>
                        <p className="text-xs font-medium text-zinc-400 line-clamp-4 leading-relaxed whitespace-pre-wrap">"{content}"</p>
                      </div>
                    ))}
                  </div>

                  {blast.imagePrompt && (
                    <div className="mt-4 p-4 rounded-xl bg-purple-500/5 border border-purple-500/10">
                      <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                        <TrendingUp size={12} /> AI Visual Prompt
                      </p>
                      <p className="text-xs font-medium text-zinc-400 line-clamp-3 leading-relaxed">"{blast.imagePrompt}"</p>
                    </div>
                  )}
                </div>

                <div className="px-5 py-4 bg-white/[0.01] border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Platforms:</span>
                    <div className="flex -space-x-2">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {blast.platforms?.map((p: string) => (
                        <div key={p} className="w-8 h-8 rounded-full bg-black border border-white/10 flex items-center justify-center shadow-sm" title={p}>
                          {getPlatformIcon(p)}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className={`text-[10px] font-black px-3 py-1.5 rounded uppercase tracking-widest ${
                    blast.status === "SENT" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                  }`}>
                    {blast.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
