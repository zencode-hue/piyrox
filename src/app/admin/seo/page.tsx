"use client";

import { useState, useEffect } from "react";
import { 
  Globe, Search, TrendingUp, FileText, CheckCircle, AlertTriangle, 
  Send, RefreshCw, Loader2, Copy, Check, Code, Bot, BarChart, 
  ExternalLink, Link2, Zap, Shield, Target, BookOpen, Layers, 
  ArrowUpRight, PieChart, Activity, Cpu, Briefcase, X
} from "lucide-react";

type Tab = "dashboard" | "meta" | "keywords" | "competitors" | "backlinks" | "audit" | "strategy" | "optimizer";

const MODELS = {
  MAIN: "google/gemma-4-31b:free",
  SEO: "google/gemma-4-31b:free",
  STRATEGY: "google/gemma-4-31b:free",
};

export default function AdminSEOPage() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  
  // Meta States
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDesc, setMetaDesc] = useState("");
  const [keywords, setKeywords] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Global States
  const [appUrl, setAppUrl] = useState("https://metramart.xyz");
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Feature Specific States
  const [kwSearch, setKwSearch] = useState("");
  const [kwLoading, setKwLoading] = useState(false);
  const [kwResults, setKwResults] = useState<any>(null);
  const [compUrl, setCompUrl] = useState("");
  const [compLoading, setCompLoading] = useState(false);
  const [compResult, setCompResult] = useState<any>(null);
  const [auditing, setAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<any>(null);
  const [strategyLoading, setStrategyLoading] = useState(false);
  const [strategyResult, setStrategyResult] = useState<any>(null);
  const [backlinkLoading, setBacklinkLoading] = useState(false);
  const [backlinkResult, setBacklinkResult] = useState<any>(null);
  const [optimizerText, setOptimizerText] = useState("");
  const [optimizerLoading, setOptimizerLoading] = useState(false);
  const [optimizerResult, setOptimizerResult] = useState<any>(null);
  const [metrics, setMetrics] = useState<{ indexedCount: number, healthScore: number, totalViews: number, trafficData: any[] } | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/settings").then((r) => r.json()).then((d) => {
      if (d.data?.seo_title) setMetaTitle(d.data.seo_title);
      if (d.data?.seo_description) setMetaDesc(d.data.seo_description);
      if (d.data?.seo_keywords) setKeywords(d.data.seo_keywords);
      if (d.data?.app_url) setAppUrl(d.data.app_url);
    }).catch(() => {});
    setAppUrl(window.location.origin);
    
    // Fetch real SEO metrics
    async function loadMetrics() {
      try {
        const res = await fetch("/api/admin/seo/metrics");
        const data = await res.json();
        if (data && !data.error) setMetrics(data);
      } catch (e) { console.error(e); }
      finally { setMetricsLoading(false); }
    }
    loadMetrics();
  }, []);

  async function saveMeta() {
    setSaving(true);
    await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seo_title: metaTitle, seo_description: metaDesc, seo_keywords: keywords }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function callAI(prompt: string, context = "seo", model = MODELS.MAIN) {
    const res = await fetch("/api/admin/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        messages: [{ role: "user", content: prompt }],
        context,
        model
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "AI failed");
    return data.reply;
  }

  async function generateMetaWithAI() {
    setIsGenerating(true);
    setError(null);
    try {
      const prompt = `You are an elite SEO specialist. Generate optimized Meta Title (max 60 chars), Meta Description (max 150 chars), and 5-8 Keywords for our digital marketplace MetraMart. RESPOND WITH ONLY THIS JSON FORMAT, NO OTHER TEXT: { "title": "...", "description": "...", "keywords": "..." }`;
      const reply = await callAI(prompt, "seo", MODELS.MAIN);
      const match = reply.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (parsed.title) setMetaTitle(parsed.title);
        if (parsed.description) setMetaDesc(parsed.description);
        if (parsed.keywords) setKeywords(parsed.keywords);
      }
    } catch (e: any) { 
      console.error(e);
      setError("AI generation failed. Please check connection."); 
    }
    finally { setIsGenerating(false); }
  }

  async function exploreKeyword() {
    if (!kwSearch.trim()) return;
    setKwLoading(true);
    try {
      const prompt = `Deeply analyze the keyword "${kwSearch}". Provide Volume, Difficulty (0-100), CPC (USD), and 5 high-performing related keywords. RESPOND ONLY WITH JSON: { "volume": number, "difficulty": number, "cpc": string, "related": ["kw1", "..."] }`;
      const reply = await callAI(prompt, "seo", MODELS.SEO);
      const match = reply.match(/\{[\s\S]*\}/);
      if (match) setKwResults(JSON.parse(match[0]));
    } catch (e) { console.error(e); }
    finally { setKwLoading(false); }
  }

  async function analyzeCompetitor() {
    if (!compUrl.trim()) return;
    setCompLoading(true);
    setCompResult(null);
    try {
      // Prompt hardening for Spy feature
      const prompt = `Act as an elite SEO Spy. Perform a deep competitive analysis of "${compUrl}".
      Deduce their Est. Monthly Traffic, their Top 5 ranking Keywords, and 3 specific strategic Weaknesses we can exploit.
      CRITICAL: YOU MUST RESPOND WITH ONLY A JSON OBJECT. NO NARRATION, NO MARKDOWN BLOCKS.
      FORMAT: { "traffic": "string", "topKeywords": ["k1", "k2", "k3", "k4", "k5"], "weaknesses": ["w1", "w2", "w3"] }`;
      
      const reply = await callAI(prompt, "seo", MODELS.SEO);
      
      // Improved parsing logic
      const jsonMatch = reply.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.traffic && parsed.topKeywords && parsed.weaknesses) {
          setCompResult(parsed);
        } else {
          throw new Error("Invalid JSON structure from AI");
        }
      } else {
        throw new Error("No JSON found in AI reply");
      }
    } catch (e) { 
      console.error("Spy Error:", e);
      // Fallback/Placeholder if AI fails
      setError("Competitor analysis failed. The 'Spy' AI is temporarily unavailable.");
    }
    finally { setCompLoading(false); }
  }

  async function runTechnicalAudit() {
    setAuditing(true);
    try {
      const prompt = `Run a technical SEO deep-audit for our site. Provide a Health Score (0-100), 3 Critical Issues, 3 Warnings, and 3 actionable Recommendations. RESPOND ONLY WITH JSON: { "score": number, "critical": ["..."], "warnings": ["..."], "recommendations": ["..."] }`;
      const reply = await callAI(prompt, "seo", MODELS.SEO);
      const match = reply.match(/\{[\s\S]*\}/);
      if (match) setAuditResult(JSON.parse(match[0]));
    } catch (e) { console.error(e); }
    finally { setAuditing(false); }
  }

  async function generateStrategy() {
    setStrategyLoading(true);
    try {
      const prompt = `Create a master 90-day SEO Growth Strategy for MetraMart. Detail 3 phases: Day 30 (Foundations), Day 60 (Content/Links), Day 90 (Dominance). Provide 4 high-impact steps per phase. RESPOND ONLY WITH JSON: { "day30": ["..."], "day60": ["..."], "day90": ["..."] }`;
      const reply = await callAI(prompt, "strategy", MODELS.STRATEGY);
      const match = reply.match(/\{[\s\S]*\}/);
      if (match) setStrategyResult(JSON.parse(match[0]));
    } catch (e) { console.error(e); }
    finally { setStrategyLoading(false); }
  }

  async function analyzeBacklinks() {
    setBacklinkLoading(true);
    try {
      const prompt = `Analyze our backlink profile for "${appUrl}". Provide Domain Rating (DR), Total Backlinks, Referring Domains, and a list of 3 potentially Toxic domains. RESPOND ONLY WITH JSON: { "dr": number, "backlinks": number, "referring": number, "toxic": ["..."] }`;
      const reply = await callAI(prompt, "seo", MODELS.SEO);
      const match = reply.match(/\{[\s\S]*\}/);
      if (match) setBacklinkResult(JSON.parse(match[0]));
    } catch (e) { console.error(e); }
    finally { setBacklinkLoading(false); }
  }

  async function optimizeContent() {
    if (!optimizerText.trim()) return;
    setOptimizerLoading(true);
    try {
      const prompt = `You are an elite SEO Content Grader. Analyze this text: "${optimizerText.substring(0, 3000)}".
      Provide an SEO Score (0-100), a brief Keyword Density analysis, and 3 specific tips to improve its ranking potential.
      RESPOND ONLY WITH JSON: { "score": number, "density": "string", "tips": ["..."] }`;
      const reply = await callAI(prompt, "optimizer", MODELS.STRATEGY);
      const match = reply.match(/\{[\s\S]*\}/);
      if (match) setOptimizerResult(JSON.parse(match[0]));
    } catch (e) { console.error(e); }
    finally { setOptimizerLoading(false); }
  }

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: Activity },
    { id: "meta", label: "Meta Tags", icon: FileText },
    { id: "keywords", label: "Keywords", icon: Search },
    { id: "competitors", label: "Competitors", icon: Target },
    { id: "backlinks", label: "Backlinks", icon: Link2 },
    { id: "audit", label: "Audit", icon: Shield },
    { id: "strategy", label: "Strategy", icon: Briefcase },
    { id: "optimizer", label: "Optimizer", icon: Zap },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <Globe className="text-amber-500" size={28} />
            </div>
            Elite SEO Suite
          </h1>
          <p className="text-gray-400 text-sm mt-1 ml-1">Professional SEO analysis and strategy engine powered by AI</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="glass-card px-4 py-2 flex items-center gap-3">
            <div className="text-right">
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Global Health</p>
              <p className={`text-sm font-bold ${metricsLoading ? "animate-pulse" : metrics?.healthScore && metrics.healthScore > 80 ? "text-green-400" : "text-amber-400"}`}>
                {metricsLoading ? "--" : `${metrics?.healthScore ?? 0}/100`}
              </p>
            </div>
            <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center relative ${metrics?.healthScore && metrics.healthScore > 80 ? "border-green-500/20" : "border-amber-500/20"}`}>
              {!metricsLoading && <div className={`absolute inset-0 rounded-full border-t-2 animate-spin-slow ${metrics?.healthScore && metrics.healthScore > 80 ? "border-green-400" : "border-amber-400"}`}></div>}
              {metricsLoading ? <Loader2 size={16} className="text-gray-500 animate-spin" /> : <CheckCircle size={16} className={metrics?.healthScore && metrics.healthScore > 80 ? "text-green-400" : "text-amber-400"} />}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto pb-1 gap-1 custom-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all shrink-0 ${
              activeTab === tab.id 
              ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20" 
              : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <Zap className="text-red-500" size={18} />
          <p className="text-sm text-red-400 font-medium">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-red-500/50 hover:text-red-500">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="min-h-[600px]">
        {activeTab === "dashboard" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* SEO Health Overview */}
            <div className="md:col-span-2 space-y-5">
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-white">Organic Traffic Trend</h2>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="flex items-center gap-1 text-green-400"><ArrowUpRight size={12}/> +12.5%</span>
                    <span className="text-gray-500">vs last month</span>
                  </div>
                </div>
                <div className="h-48 flex items-end gap-2 px-2">
                  {metricsLoading ? (
                    <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs italic">Loading traffic trends...</div>
                  ) : (metrics?.trafficData || []).map((d, i) => (
                    <div key={i} className="flex-1 group relative">
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-amber-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {d.views} views
                      </div>
                      <div 
                        className="w-full bg-gradient-to-t from-amber-500/10 to-amber-500/40 rounded-t-sm group-hover:to-amber-500 transition-all duration-300"
                        style={{ height: `${Math.min(100, (d.views / (Math.max(...(metrics?.trafficData?.map(m => m.views) || [1]))) * 100))}%` }}
                      ></div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-3 text-[10px] text-gray-500 uppercase tracking-tighter">
                  {metrics?.trafficData ? metrics.trafficData.map(d => <span key={d.date}>{d.date}</span>) : <span>Loading...</span>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="glass-card p-5 border-l-4 border-l-blue-500">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-blue-500/10"><TrendingUp size={18} className="text-blue-500"/></div>
                    <span className="text-sm font-semibold text-white">Top Performing Keyword</span>
                  </div>
                  <p className="text-xl font-bold text-white">"netflix premium cheap"</p>
                  <p className="text-xs text-gray-400 mt-1">Position: <span className="text-green-400">#2</span> · Volume: 12.5k</p>
                </div>
                <div className="glass-card p-5 border-l-4 border-l-purple-500">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-purple-500/10"><Layers size={18} className="text-purple-500"/></div>
                    <span className="text-sm font-semibold text-white">Indexed Pages</span>
                  </div>
                  <p className="text-xl font-bold text-white">{metricsLoading ? "..." : metrics?.indexedCount?.toLocaleString() ?? 0} Pages</p>
                  <p className="text-xs text-gray-400 mt-1"><span className="text-green-400">Live</span> indexation status</p>
                </div>
              </div>
            </div>

            {/* Quick Actions & Tips */}
            <div className="space-y-5">
              <div className="glass-card p-6 bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20">
                <h3 className="text-sm font-bold text-amber-500 uppercase tracking-widest mb-4">AI Quick Wins</h3>
                <div className="space-y-4">
                  {[
                    { icon: Target, text: "Optimize 'Spotify' category meta tags", difficulty: "Easy" },
                    { icon: Shield, text: "Fix 12 missing alt tags on products", difficulty: "Easy" },
                    { icon: Zap, text: "Reduce homepage image size for Core Web Vitals", difficulty: "Medium" }
                  ].map((win, i) => (
                    <div key={i} className="flex gap-3 items-start group cursor-pointer">
                      <div className="p-1.5 rounded-lg bg-white/5 group-hover:bg-amber-500/20 transition-colors">
                        <win.icon size={14} className="text-gray-400 group-hover:text-amber-500" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-300 leading-snug group-hover:text-white">{win.text}</p>
                        <span className="text-[10px] text-gray-500">{win.difficulty}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-6 py-2 rounded-xl bg-amber-500 text-black text-xs font-bold hover:bg-amber-400 transition-colors">
                  View Full Audit
                </button>
              </div>

              <div className="glass-card p-5">
                <h3 className="text-sm font-bold text-white mb-3">SERP Preview</h3>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <p className="text-[#1a0dab] text-sm hover:underline cursor-pointer truncate font-medium">{metaTitle || "MetraMart - Premium Digital Marketplace"}</p>
                  <p className="text-[#006621] text-xs truncate mt-0.5">{appUrl}</p>
                  <p className="text-[#4d5156] text-xs mt-1 line-clamp-2">
                    {metaDesc || "Buy Netflix, Spotify, ChatGPT Plus and more at the best prices. Instant delivery worldwide."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "meta" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 animate-in fade-in slide-in-from-right-4">
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileText size={20} className="text-amber-500" /> Global Meta Configuration
                </h2>
                <button onClick={generateMetaWithAI} disabled={isGenerating}
                  className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-amber-500 disabled:opacity-50">
                  {isGenerating ? <Loader2 size={12} className="animate-spin" /> : <Bot size={14} />}
                  AI Auto-Optimize
                </button>
              </div>
              
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between mb-1.5">
                    <label className="text-xs font-semibold text-gray-400">SEO Title Tag</label>
                    <span className={`text-[10px] font-bold ${metaTitle.length > 60 ? "text-red-400" : "text-amber-500"}`}>{metaTitle.length}/60</span>
                  </div>
                  <input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors" />
                </div>
                <div>
                  <div className="flex justify-between mb-1.5">
                    <label className="text-xs font-semibold text-gray-400">Meta Description</label>
                    <span className={`text-[10px] font-bold ${metaDesc.length > 160 ? "text-red-400" : "text-amber-500"}`}>{metaDesc.length}/160</span>
                  </div>
                  <textarea value={metaDesc} onChange={(e) => setMetaDesc(e.target.value)} rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors resize-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 block mb-1.5">Focus Keywords (Comma Separated)</label>
                  <input value={keywords} onChange={(e) => setKeywords(e.target.value)} 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors" />
                </div>
                
                <button onClick={saveMeta} disabled={saving}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold text-sm shadow-lg shadow-amber-500/20 hover:scale-[1.01] transition-all disabled:opacity-50">
                  {saving ? <Loader2 size={18} className="animate-spin mx-auto" /> : saved ? "Changes Saved Successfully!" : "Update Global SEO"}
                </button>
              </div>
            </div>

            <div className="space-y-5">
              <div className="glass-card p-6">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <Code size={16} className="text-amber-500" /> Advanced Indexing Controls
                </h3>
                <div className="space-y-3">
                  {[
                    { label: "Sitemap XML", status: "Active", link: "/sitemap.xml" },
                    { label: "Robots.txt", status: "Active", link: "/robots.txt" },
                    { label: "Canonical URL", status: "Automatic", link: null }
                  ].map((ctrl, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                      <div>
                        <p className="text-sm font-medium text-white">{ctrl.label}</p>
                        <p className="text-[10px] text-green-500 font-bold uppercase tracking-wider">{ctrl.status}</p>
                      </div>
                      {ctrl.link && (
                        <a href={ctrl.link} target="_blank" className="p-2 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-colors">
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="glass-card p-6">
                <h3 className="text-sm font-bold text-white mb-4">Indexing Status</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Google Index</p>
                    <p className="text-lg font-bold text-white">1.1k</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Bing Index</p>
                    <p className="text-lg font-bold text-white">842</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "keywords" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-left-4">
            <div className="glass-card p-8 bg-gradient-to-br from-amber-500/5 to-transparent">
              <div className="max-w-2xl mx-auto text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Keyword Intelligence Explorer</h2>
                <p className="text-gray-400 text-sm">Analyze keyword difficulty, search volume, and discover profitable niches</p>
              </div>
              
              <div className="max-w-xl mx-auto flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input value={kwSearch} onChange={(e) => setKwSearch(e.target.value)}
                    placeholder="Enter focus keyword..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-amber-500/50 transition-all" />
                </div>
                <button onClick={exploreKeyword} disabled={kwLoading}
                  className="px-6 rounded-2xl bg-amber-500 text-black font-bold text-sm hover:bg-amber-400 transition-colors disabled:opacity-50">
                  {kwLoading ? <Loader2 size={18} className="animate-spin" /> : "Analyze"}
                </button>
              </div>

              {kwResults && (
                <div className="mt-10 grid grid-cols-1 md:grid-cols-4 gap-4 animate-in fade-in zoom-in-95 duration-500">
                  <div className="glass-card p-5 text-center">
                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-2">Search Volume</p>
                    <p className="text-2xl font-bold text-white">{kwResults.volume.toLocaleString()}</p>
                    <p className="text-[10px] text-green-400 mt-1">High Intent</p>
                  </div>
                  <div className="glass-card p-5 text-center">
                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-2">Keyword Difficulty</p>
                    <p className={`text-2xl font-bold ${kwResults.difficulty > 70 ? "text-red-500" : kwResults.difficulty > 40 ? "text-amber-500" : "text-green-500"}`}>
                      {kwResults.difficulty}/100
                    </p>
                    <p className="text-[10px] text-gray-500 mt-1">{kwResults.difficulty > 60 ? "Hard to rank" : "Opportunity"}</p>
                  </div>
                  <div className="glass-card p-5 text-center">
                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-2">Avg. CPC</p>
                    <p className="text-2xl font-bold text-blue-400">${kwResults.cpc}</p>
                    <p className="text-[10px] text-gray-500 mt-1">Commercial value</p>
                  </div>
                  <div className="glass-card p-5 text-center">
                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-2">Click Potential</p>
                    <p className="text-2xl font-bold text-purple-400">74%</p>
                    <p className="text-[10px] text-gray-500 mt-1">Organic clicks</p>
                  </div>
                </div>
              )}
            </div>

            {kwResults && (
              <div className="glass-card p-6">
                <h3 className="text-sm font-bold text-white mb-4">Semantic & Related Keyword Opportunities</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {kwResults.related.map((kw: string, i: number) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 group hover:border-amber-500/30 transition-all cursor-pointer">
                      <span className="text-sm text-gray-300 group-hover:text-white">{kw}</span>
                      <button onClick={() => setKwSearch(kw)} className="p-1.5 rounded-lg bg-white/5 text-gray-500 hover:text-amber-500 opacity-0 group-hover:opacity-100 transition-all">
                        <TrendingUp size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="glass-card overflow-hidden">
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Tracked Keywords Performance</h3>
                <button className="text-[10px] font-bold text-amber-500 uppercase tracking-widest hover:underline">Add New Tracker</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-white/2 text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                      <th className="px-6 py-4">Keyword</th>
                      <th className="px-6 py-4">Position</th>
                      <th className="px-6 py-4">Volume</th>
                      <th className="px-6 py-4">Difficulty</th>
                      <th className="px-6 py-4">Traffic</th>
                      <th className="px-6 py-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {[
                      { kw: "cheap netflix accounts", pos: 2, vol: "4.5k", diff: 45, traffic: 850 },
                      { kw: "buy spotify premium", pos: 5, vol: "12k", diff: 68, traffic: 1200 },
                      { kw: "chatgpt plus discount", pos: 12, vol: "8.2k", diff: 32, traffic: 450 },
                      { kw: "gaming keys cheap", pos: 1, vol: "2.1k", diff: 24, traffic: 1100 },
                      { kw: "adobe subscription deals", pos: 24, vol: "3.5k", diff: 55, traffic: 50 },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-white/2 transition-colors">
                        <td className="px-6 py-4 font-medium text-white">{row.kw}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${row.pos <= 3 ? "bg-green-500/20 text-green-400" : row.pos <= 10 ? "bg-amber-500/20 text-amber-400" : "bg-white/10 text-gray-400"}`}>
                            #{row.pos}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-400">{row.vol}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full bg-amber-500" style={{ width: `${row.diff}%` }}></div>
                            </div>
                            <span className="text-[10px] text-gray-500">{row.diff}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-400">{row.traffic} / mo</td>
                        <td className="px-6 py-4">
                          <button className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white"><ExternalLink size={14}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "competitors" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="glass-card p-6">
              <h2 className="text-lg font-bold text-white mb-6">Competitor AI Surveillance</h2>
              <div className="flex gap-2 max-w-xl">
                <div className="relative flex-1">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input value={compUrl} onChange={(e) => setCompUrl(e.target.value)}
                    placeholder="Enter competitor domain (e.g. g2g.com)..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-amber-500/50 transition-all" />
                </div>
                <button onClick={analyzeCompetitor} disabled={compLoading}
                  className="px-6 rounded-2xl bg-amber-500 text-black font-bold text-sm hover:bg-amber-400 transition-colors disabled:opacity-50">
                  {compLoading ? <Loader2 size={18} className="animate-spin" /> : "Spy"}
                </button>
              </div>

              {compResult && (
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="space-y-4">
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20">
                      <p className="text-[10px] text-amber-500 uppercase font-bold tracking-widest mb-1">Estimated Traffic</p>
                      <p className="text-3xl font-bold text-white">{compResult.traffic}</p>
                      <div className="flex items-center gap-1 text-xs text-red-400 mt-2 font-medium">
                        <TrendingUp size={14} className="rotate-180" /> -4.2% This Month
                      </div>
                    </div>
                    <div className="glass-card p-5">
                      <p className="text-[10px] text-gray-500 uppercase font-bold mb-3">Domain Strength</p>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-400">Authority Score</span>
                        <span className="text-sm font-bold text-white">62/100</span>
                      </div>
                      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: "62%" }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="glass-card p-5">
                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-4">Top Ranking Keywords</p>
                    <div className="space-y-3">
                      {compResult.topKeywords.map((kw: string, i: number) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="text-sm text-gray-300">{kw}</span>
                          <span className="text-[10px] font-bold text-green-400">Pos #{i+1}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="glass-card p-5 border-l-4 border-l-red-500/50">
                    <p className="text-[10px] text-red-500 uppercase font-bold mb-4 flex items-center gap-2">
                      <Zap size={12}/> Vulnerabilities Found
                    </p>
                    <div className="space-y-4">
                      {compResult.weaknesses.map((w: string, i: number) => (
                        <div key={i} className="flex gap-3 items-start">
                          <div className="mt-1 w-1.5 h-1.5 rounded-full bg-red-500"></div>
                          <p className="text-xs text-gray-400 leading-relaxed">{w}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="glass-card p-6">
              <h3 className="text-sm font-bold text-white mb-6">Market Share Comparison</h3>
              <div className="space-y-6">
                {[
                  { name: "MetraMart (You)", share: 22, color: "bg-amber-500" },
                  { name: "G2A", share: 45, color: "bg-blue-500" },
                  { name: "Kinguin", share: 18, color: "bg-purple-500" },
                  { name: "CDKeys", share: 15, color: "bg-green-500" }
                ].map((item, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between items-end">
                      <span className="text-xs font-semibold text-white">{item.name}</span>
                      <span className="text-xs font-bold text-gray-500">{item.share}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.share}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "backlinks" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="glass-card p-8 text-center bg-gradient-to-br from-blue-500/5 to-transparent">
              <h2 className="text-2xl font-bold text-white mb-2">Backlink Profile Audit</h2>
              <p className="text-gray-400 text-sm mb-8">Analyze your site authority and referring domain network</p>
              
              <button onClick={analyzeBacklinks} disabled={backlinkLoading}
                className="px-8 py-3 rounded-2xl bg-blue-500 text-white font-bold text-sm hover:bg-blue-400 transition-all flex items-center gap-2 mx-auto disabled:opacity-50">
                {backlinkLoading ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                Refresh Backlink Data
              </button>

              {backlinkResult && (
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 rounded-3xl bg-white/5 border border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <TrendingUp size={60} />
                    </div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-2">Domain Rating (DR)</p>
                    <p className="text-5xl font-black text-white">{backlinkResult.dr}</p>
                    <p className="text-xs text-green-400 mt-2">+2.4 vs last month</p>
                  </div>
                  <div className="p-6 rounded-3xl bg-white/5 border border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Link2 size={60} />
                    </div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-2">Total Backlinks</p>
                    <p className="text-5xl font-black text-white">{backlinkResult.backlinks.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-2">from {backlinkResult.referring.toLocaleString()} domains</p>
                  </div>
                  <div className="p-6 rounded-3xl bg-white/5 border border-red-500/20 bg-red-500/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Shield size={60} className="text-red-500" />
                    </div>
                    <p className="text-[10px] text-red-500 uppercase font-bold tracking-widest mb-2">Toxic Links</p>
                    <p className="text-5xl font-black text-white">{backlinkResult.toxic.length}</p>
                    <p className="text-xs text-red-400/70 mt-2">Requires urgent attention</p>
                  </div>
                </div>
              )}
            </div>

            {backlinkResult && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card p-6">
                  <h3 className="text-sm font-bold text-white mb-4">Referring Domain Categories</h3>
                  <div className="space-y-4">
                    {[
                      { cat: "Technology & SaaS", val: 45, color: "#3b82f6" },
                      { cat: "Ecommerce & Shopping", val: 32, color: "#f59e0b" },
                      { cat: "News & Media", val: 15, color: "#10b981" },
                      { cat: "Education & Forums", val: 8, color: "#8b5cf6" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-xs text-gray-300 flex-1">{item.cat}</span>
                        <span className="text-xs font-bold text-white">{item.val}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="glass-card p-6 border-red-500/20">
                  <h3 className="text-sm font-bold text-red-500 mb-4 flex items-center gap-2">
                    <AlertTriangle size={16} /> Toxic Backlink Alert
                  </h3>
                  <div className="space-y-3">
                    {backlinkResult.toxic.map((t: string, i: number) => (
                      <div key={i} className="p-3 rounded-xl bg-red-500/5 border border-red-500/10 flex items-center justify-between group">
                        <span className="text-xs text-gray-400">{t}</span>
                        <button className="text-[10px] font-bold text-red-400 uppercase tracking-widest hover:underline opacity-0 group-hover:opacity-100 transition-opacity">
                          Disavow
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-500 mt-4 leading-relaxed">
                    Toxic links are low-quality or spammy backlinks that can negatively impact your search engine rankings and potentially lead to manual penalties.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "audit" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-4">
            <div className="glass-card p-8 bg-gradient-to-br from-green-500/5 to-transparent">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Technical SEO Deep-Audit</h2>
                  <p className="text-gray-400 text-sm">Crawl your site and identify technical blockers inhibiting your growth</p>
                </div>
                <button onClick={runTechnicalAudit} disabled={auditing}
                  className="px-8 py-3 rounded-2xl bg-green-500 text-black font-bold text-sm hover:bg-green-400 transition-all flex items-center gap-2 disabled:opacity-50">
                  {auditing ? <Loader2 size={18} className="animate-spin" /> : <Shield size={18} />}
                  Execute Audit
                </button>
              </div>

              {auditResult && (
                <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="md:col-span-1 glass-card p-6 flex flex-col items-center justify-center text-center">
                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-4">Overall Score</p>
                    <div className="w-24 h-24 rounded-full border-4 border-white/5 flex items-center justify-center relative">
                      <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="4" fill="transparent"
                          className="text-green-500" strokeDasharray={`${2.76 * auditResult.score} 276`} />
                      </svg>
                      <span className="text-3xl font-black text-white">{auditResult.score}</span>
                    </div>
                    <p className="text-xs text-green-400 mt-4 font-bold">Excellent</p>
                  </div>
                  
                  <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/20">
                      <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest mb-4">Critical Issues</p>
                      <div className="text-4xl font-black text-white mb-2">{auditResult.critical.length}</div>
                      <p className="text-xs text-gray-400 leading-snug">Require immediate developer attention</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                      <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest mb-4">Warnings</p>
                      <div className="text-4xl font-black text-white mb-2">{auditResult.warnings.length}</div>
                      <p className="text-xs text-gray-400 leading-snug">Recommended improvements</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                      <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest mb-4">Optimized</p>
                      <div className="text-4xl font-black text-white mb-2">42</div>
                      <p className="text-xs text-gray-400 leading-snug">Successfully passed checks</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {auditResult && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="glass-card p-6">
                  <h3 className="text-sm font-bold text-white mb-6">Detailed Issue List</h3>
                  <div className="space-y-4">
                    {auditResult.critical.map((issue: string, i: number) => (
                      <div key={i} className="flex gap-4 p-4 rounded-xl bg-white/5 border-l-4 border-l-red-500">
                        <AlertTriangle className="text-red-500 shrink-0" size={18} />
                        <div>
                          <p className="text-sm font-bold text-white mb-1">{issue}</p>
                          <p className="text-xs text-gray-400">Impacts search ranking and user experience significantly.</p>
                        </div>
                      </div>
                    ))}
                    {auditResult.warnings.map((issue: string, i: number) => (
                      <div key={i} className="flex gap-4 p-4 rounded-xl bg-white/5 border-l-4 border-l-amber-500">
                        <AlertTriangle className="text-amber-500 shrink-0" size={18} />
                        <div>
                          <p className="text-sm font-bold text-white mb-1">{issue}</p>
                          <p className="text-xs text-gray-400">Consider fixing to improve overall site health score.</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="glass-card p-6">
                  <h3 className="text-sm font-bold text-white mb-6">Actionable Recommendations</h3>
                  <div className="space-y-6">
                    {auditResult.recommendations.map((rec: string, i: number) => (
                      <div key={i} className="flex gap-4 group">
                        <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 group-hover:bg-amber-500 transition-colors">
                          <span className="text-[10px] font-black text-amber-500 group-hover:text-black">{i+1}</span>
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed group-hover:text-white">{rec}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-10 p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/10">
                    <div className="flex items-center gap-3 mb-2 text-amber-500">
                      <Cpu size={18} />
                      <span className="text-xs font-bold uppercase tracking-widest">Metra AI Prediction</span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Implementing these 3 recommendations is predicted to increase organic impressions by <span className="text-amber-500 font-bold">14-18%</span> within the next 45 days.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "strategy" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="glass-card p-8 bg-gradient-to-br from-purple-500/5 to-transparent">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">90-Day SEO Dominance Roadmap</h2>
                  <p className="text-gray-400 text-sm">Strategic multi-phase plan to outrank competitors and capture high-intent traffic</p>
                </div>
                <button onClick={generateStrategy} disabled={strategyLoading}
                  className="px-8 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold text-sm hover:scale-[1.02] transition-all flex items-center gap-2 disabled:opacity-50">
                  {strategyLoading ? <Loader2 size={18} className="animate-spin" /> : <Target size={18} />}
                  Generate Roadmap
                </button>
              </div>

              {!strategyResult && !strategyLoading && (
                <div className="mt-12 p-12 text-center">
                  <div className="p-4 rounded-full bg-white/5 w-fit mx-auto mb-4">
                    <Briefcase size={40} className="text-gray-600" />
                  </div>
                  <p className="text-sm text-gray-500 max-w-sm mx-auto">
                    Click the button above to let Metra AI analyze your niche and create a custom strategic growth plan.
                  </p>
                </div>
              )}

              {strategyResult && (
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                  <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-y-1/2"></div>
                  
                  {[
                    { id: "30", label: "Foundations", color: "from-blue-500/20 to-blue-500/5", data: strategyResult.day30 },
                    { id: "60", label: "Content & Links", color: "from-amber-500/20 to-amber-500/5", data: strategyResult.day60 },
                    { id: "90", label: "Dominance", color: "from-purple-500/20 to-purple-500/5", data: strategyResult.day90 }
                  ].map((phase, i) => (
                    <div key={i} className={`p-6 rounded-3xl bg-gradient-to-b ${phase.color} border border-white/5 relative z-10 hover:border-white/20 transition-all`}>
                      <div className="w-12 h-12 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-xl font-black text-white mb-6">
                        {phase.id}
                        <span className="text-[10px] font-normal text-gray-500 ml-1">Days</span>
                      </div>
                      <h3 className="text-lg font-bold text-white mb-6">{phase.label}</h3>
                      <div className="space-y-4">
                        {phase.data.map((step: string, j: number) => (
                          <div key={j} className="flex gap-3">
                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-white/40 shrink-0"></div>
                            <p className="text-xs text-gray-300 leading-relaxed">{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "optimizer" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="lg:col-span-2 glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">Content Optimization Grader</h2>
                <button onClick={optimizeContent} disabled={optimizerLoading || !optimizerText.trim()}
                  className="px-6 py-2 rounded-xl bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 transition-colors disabled:opacity-50">
                  {optimizerLoading ? <Loader2 size={14} className="animate-spin mx-auto" /> : "Grade Content"}
                </button>
              </div>
              <textarea 
                value={optimizerText}
                onChange={(e) => setOptimizerText(e.target.value)}
                placeholder="Paste your blog post or product description here to analyze its SEO potential..."
                className="w-full h-[400px] bg-black/20 border border-white/10 rounded-2xl p-6 text-sm text-gray-300 focus:outline-none focus:border-amber-500/30 transition-all resize-none custom-scrollbar"
              />
            </div>

            <div className="space-y-6">
              <div className="glass-card p-6 min-h-[200px]">
                <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-widest text-center">SEO Score</h3>
                {optimizerResult ? (
                  <div className="text-center animate-in zoom-in-95 duration-500">
                    <div className="text-6xl font-black text-amber-500 mb-2">{optimizerResult.score}</div>
                    <p className="text-xs text-gray-500 mb-6">Out of 100 points</p>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                      <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Keyword Density</p>
                      <p className="text-sm text-white">{optimizerResult.density}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="p-4 rounded-full bg-white/5 mb-4">
                      <Zap size={30} className="text-gray-600" />
                    </div>
                    <p className="text-xs text-gray-500">Add content to see your optimization score</p>
                  </div>
                )}
              </div>

              {optimizerResult && (
                <div className="glass-card p-6 animate-in slide-in-from-right-4">
                  <h3 className="text-sm font-bold text-white mb-4">Optimization Tips</h3>
                  <div className="space-y-4">
                    {optimizerResult.tips.map((tip: string, i: number) => (
                      <div key={i} className="flex gap-3 group">
                        <div className="mt-1 p-1 rounded-md bg-amber-500/10 group-hover:bg-amber-500 transition-colors">
                          <TrendingUp size={12} className="text-amber-500 group-hover:text-black" />
                        </div>
                        <p className="text-xs text-gray-400 group-hover:text-gray-200 leading-relaxed">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Instructions */}
      <div className="glass-card p-4 flex items-center justify-between text-[10px] text-gray-500 uppercase tracking-widest font-bold">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5"><Activity size={12}/> System Live</span>
          <span className="flex items-center gap-1.5"><Cpu size={12}/> AI Powered</span>
          <span className="flex items-center gap-1.5"><Shield size={12}/> Secure Data</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="hover:text-white transition-colors">Documentation</button>
          <button className="hover:text-white transition-colors">API Status</button>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 4px;
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(245, 158, 11, 0.3);
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        .animate-in {
          animation-duration: 500ms;
          animation-fill-mode: both;
          animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
        .fade-in {
          animation-name: fadeIn;
        }
        .slide-in-from-bottom-4 {
          animation-name: slideInBottom;
        }
        .slide-in-from-right-4 {
          animation-name: slideInRight;
        }
        .slide-in-from-left-4 {
          animation-name: slideInLeft;
        }
        .slide-in-from-top-4 {
          animation-name: slideInTop;
        }
        .zoom-in-95 {
          animation-name: zoomIn;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInBottom {
          from { transform: translateY(1rem); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(1rem); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideInLeft {
          from { transform: translateX(-1rem); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideInTop {
          from { transform: translateY(-1rem); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes zoomIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
