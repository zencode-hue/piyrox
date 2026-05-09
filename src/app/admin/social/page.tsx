"use client";

import { useState, useEffect } from "react";
import { 
  Globe, Info, AlertCircle, History, RefreshCw, 
  Clock, Check, TrendingUp, MousePointer2, 
  BarChart3, Eye, Target, Share2, Layers,
  Twitter, Instagram, Facebook, MessageSquare, Linkedin, Send
} from "lucide-react";
import BlastConfigurator from "./BlastConfigurator";

export default function SocialMarketingPage() {
  const [loading, setLoading] = useState(false);
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
        const totalClicks = data.reduce((acc, b) => acc + (b.clicks || 0), 0);
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
      case "twitter": return <Twitter size={14} className="text-[#1DA1F2]" />;
      case "instagram": return <Instagram size={14} className="text-[#E4405F]" />;
      case "facebook": return <Facebook size={14} className="text-[#1877F2]" />;
      case "discord": return <MessageSquare size={14} className="text-[#5865F2]" />;
      case "linkedin": return <Linkedin size={14} className="text-[#0A66C2]" />;
      default: return <Globe size={14} className="text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Share2 size={24} className="text-black" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                Social Blast <span className="text-orange-500">v2.0</span>
              </h1>
              <p className="text-xs text-gray-500">Autonomous multi-channel marketing engine with real-time tracking</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowGuide(!showGuide)} 
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-gray-400 hover:bg-white/10 hover:text-white transition-all"
          >
            <Info size={14} /> Setup Guide
          </button>
          <button 
            onClick={fetchData}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-orange-500 transition-all"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {showGuide && (
        <div className="glass-card p-6 border-amber-500/30 bg-amber-500/5 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-md">
                <img src="https://upload.wikimedia.org/wikipedia/commons/e/e0/Zapier_logo.png" alt="Zapier" className="w-6 h-6 object-contain" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Advanced Zapier Integration</h3>
                <p className="text-xs text-gray-400">Connect Metra AI to 5,000+ apps</p>
              </div>
            </div>
            <button onClick={() => setShowGuide(false)} className="text-gray-500 hover:text-white transition-colors">
              <AlertCircle size={20} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: 1, title: "Create Webhook", desc: "Use 'Webhooks by Zapier' (Catch Hook) and copy the provided URL." },
              { step: 2, title: "Configure Admin", desc: "Go to Settings → Marketing and paste the URL into 'Zapier Webhook'." },
              { step: 3, title: "Map Content", desc: "Zapier receives 'twitter', 'instagram', etc. Map these to your social actions." },
            ].map((s) => (
              <div key={s.step} className="p-4 rounded-2xl bg-black/20 border border-white/5 relative overflow-hidden group">
                <div className="absolute -right-2 -top-2 text-6xl font-black text-white/5 group-hover:text-orange-500/5 transition-all">{s.step}</div>
                <p className="text-sm font-bold text-amber-500 mb-1">{s.title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
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
          <div key={s.label} className="glass-card p-4 relative overflow-hidden group">
            <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-all`}>
              <s.icon size={48} />
            </div>
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-lg bg-white/5 ${s.color}`}>
                <s.icon size={16} />
              </div>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${s.trend.includes("+") ? "bg-green-500/10 text-green-500" : "bg-white/5 text-gray-500"}`}>
                {s.trend}
              </span>
            </div>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{s.label}</p>
            <p className="text-2xl font-black text-white mt-1">{s.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Configurator */}
        <div className="lg:col-span-1">
          <BlastConfigurator onBlast={handleBlast} />
          
          {error && (
            <div className="mt-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
              <AlertCircle size={18} className="text-red-500 shrink-0" />
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}
        </div>

        {/* Right: History & Detailed Stats */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <History size={18} className="text-gray-500" /> Blast History
            </h3>
            <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg border border-white/10">
              <button className="px-3 py-1 rounded-md text-[10px] font-bold bg-white/10 text-white shadow-sm">All Time</button>
              <button className="px-3 py-1 rounded-md text-[10px] font-bold text-gray-500 hover:text-gray-300">Today</button>
            </div>
          </div>

          <div className="space-y-4">
            {blasts.length === 0 && (
              <div className="p-20 text-center border-2 border-dashed border-white/5 rounded-[2rem] bg-white/[0.02]">
                <TrendingUp size={48} className="mx-auto mb-4 text-gray-700" />
                <h4 className="text-white font-bold mb-1">No blasts launched yet</h4>
                <p className="text-xs text-gray-600 max-w-xs mx-auto">Configure your marketing channels on the left to start generating autonomous growth.</p>
              </div>
            )}

            {blasts.map((blast) => (
              <div key={blast.id} className="glass-card overflow-hidden group hover:border-orange-500/30 transition-all">
                <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 text-sm font-bold">
                      {blast.product?.title?.charAt(0) || "P"}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-orange-500 transition-colors">{blast.productTitle}</h4>
                      <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-0.5">
                        <Clock size={10} /> {new Date(blast.createdAt).toLocaleDateString()} at {new Date(blast.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end text-orange-500 font-black text-lg">
                      <MousePointer2 size={14} /> {blast.clicks || 0}
                    </div>
                    <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Total Clicks</p>
                  </div>
                </div>

                <div className="p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(blast.content || {}).map(([platform, content]: [string, any]) => (
                      <div key={platform} className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getPlatformIcon(platform)}
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{platform}</span>
                          </div>
                          <span className="text-[10px] font-bold text-gray-600">
                            {((blast.platformStats?.[platform] || 0))} clicks
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400 line-clamp-3 leading-relaxed italic">"{content}"</p>
                      </div>
                    ))}
                  </div>

                  {blast.imagePrompt && (
                    <div className="mt-4 p-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
                      <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
                        <TrendingUp size={10} /> AI Visual Prompt
                      </p>
                      <p className="text-[10px] text-gray-500 line-clamp-2 italic leading-relaxed">"{blast.imagePrompt}"</p>
                    </div>
                  )}
                </div>

                <div className="px-5 py-3 bg-white/[0.01] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Platforms:</span>
                    <div className="flex -space-x-1.5">
                      {blast.platforms?.map((p: string) => (
                        <div key={p} className="w-6 h-6 rounded-full bg-black border border-white/10 flex items-center justify-center" title={p}>
                          {getPlatformIcon(p)}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter ${
                    blast.status === "SENT" ? "bg-green-500/10 text-green-400" : "bg-orange-500/10 text-orange-400"
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
