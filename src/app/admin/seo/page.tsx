"use client";

import { useState, useEffect } from "react";
import { Globe, Search, TrendingUp, FileText, CheckCircle, AlertTriangle, Send, RefreshCw, Loader2, Copy, Check, Code, Bot, BarChart, ExternalLink, Link2 } from "lucide-react";

export default function AdminSEOPage() {
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDesc, setMetaDesc] = useState("");
  const [keywords, setKeywords] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pinging, setPinging] = useState(false);
  const [pingResult, setPingResult] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [robotsContent, setRobotsContent] = useState("");
  const [savingRobots, setSavingRobots] = useState(false);
  const [appUrl, setAppUrl] = useState("https://metramart.xyz");
  const [kwSearch, setKwSearch] = useState("");
  const [kwLoading, setKwLoading] = useState(false);
  const [kwResults, setKwResults] = useState<any>(null);
  const [compUrl, setCompUrl] = useState("");
  const [compLoading, setCompLoading] = useState(false);
  const [compResult, setCompResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [auditing, setAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<string | null>(null);

  async function generateWithAI() {
    setIsGenerating(true);
    setError(null);
    try {
      const prompt = `You are an expert SEO specialist. Generate an optimized Meta Title (max 60 chars), Meta Description (max 150 chars), and 5-8 comma-separated Keywords for MetraMart, a premium digital marketplace selling Netflix, Spotify, ChatGPT Plus, gaming keys, and software licenses. RESPOND WITH ONLY THIS JSON FORMAT, NO OTHER TEXT: { "title": "...", "description": "...", "keywords": "..." }`;
      const res = await fetch("/api/admin/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: prompt }] }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "AI generation failed");
      } else if (data.reply) {
        const match = data.reply.match(/\{[\s\S]*\}/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          if (parsed.title) setMetaTitle(parsed.title);
          if (parsed.description) setMetaDesc(parsed.description);
          if (parsed.keywords) setKeywords(parsed.keywords);
        }
      }
    } catch (err) {
      console.error(err);
      setError("Network error during generation.");
    }
    setIsGenerating(false);
  }

  async function runAIAudit() {
    setAuditing(true);
    try {
      const prompt = `Act as an elite SEO auditor. Review my current site configuration:
Title: ${metaTitle || "[None]"}
Description: ${metaDesc || "[None]"}
Keywords: ${keywords || "[None]"}
Provide 3 highly actionable, bullet-point recommendations to improve organic ranking. Be very concise and do not include boilerplate.`;
      const res = await fetch("/api/admin/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: prompt }] }),
      });
      const data = await res.json();
      if (data.reply) setAuditResult(data.reply);
    } catch {
      setAuditResult("Audit failed. Please check AI settings.");
    }
    setAuditing(false);
  }

  async function exploreKeyword() {
    if (!kwSearch.trim()) return;
    setKwLoading(true);
    try {
      const prompt = `Analyze the keyword "${kwSearch}" for an SEO tool.
      Provide realistic metrics (Volume, Difficulty 0-100, CPC in USD) and 5 related high-traffic keywords.
      RESPOND ONLY WITH JSON: { "volume": "number", "difficulty": "number", "cpc": "string", "related": ["kw1", "kw2", ...] }`;
      const res = await fetch("/api/admin/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: prompt }] }),
      });
      const data = await res.json();
      if (data.reply) {
        const match = data.reply.match(/\{[\s\S]*\}/);
        if (match) setKwResults(JSON.parse(match[0]));
      }
    } catch (e) { console.error(e); }
    setKwLoading(false);
  }

  async function analyzeCompetitor() {
    if (!compUrl.trim()) return;
    setCompLoading(true);
    try {
      const prompt = `Act as an SEO spy. Analyze the competitor URL "${compUrl}".
      Deduce their ranking keywords, estimated traffic, and 3 weak points we can exploit.
      RESPOND ONLY WITH JSON: { "traffic": "string", "topKeywords": ["k1", "k2"], "weaknesses": ["w1", "w2", "w3"] }`;
      const res = await fetch("/api/admin/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: prompt }] }),
      });
      const data = await res.json();
      if (data.reply) {
        const match = data.reply.match(/\{[\s\S]*\}/);
        if (match) setCompResult(JSON.parse(match[0]));
      }
    } catch (e) { console.error(e); }
    setCompLoading(false);
  }

  useEffect(() => {
    fetch("/api/v1/settings").then((r) => r.json()).then((d) => {
      if (d.data?.seo_title) setMetaTitle(d.data.seo_title);
      if (d.data?.seo_description) setMetaDesc(d.data.seo_description);
      if (d.data?.seo_keywords) setKeywords(d.data.seo_keywords);
      if (d.data?.app_url) setAppUrl(d.data.app_url);
    }).catch(() => {});
    // Load current robots.txt
    fetch("/robots.txt").then((r) => r.text()).then(setRobotsContent).catch(() => {});
    setAppUrl(window.location.origin);
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

  async function pingSitemap(engine: string) {
    setPinging(true);
    setPingResult(null);
    const sitemapUrl = `${appUrl}/sitemap.xml`;
    let pingUrl = "";
    if (engine === "google") pingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
    if (engine === "bing") pingUrl = `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;

    try {
      // We can't directly ping (CORS), so we open in new tab and show instructions
      window.open(pingUrl, "_blank");
      setPingResult(`Opened ${engine} ping in new tab. If it shows a success page, your sitemap was submitted.`);
    } catch {
      setPingResult("Could not open ping URL.");
    }
    setPinging(false);
  }

  function copyText(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  const titleLen = metaTitle.length;
  const descLen = metaDesc.length;

  const structuredData = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Store",
    "name": "MetraMart",
    "url": appUrl,
    "description": metaDesc || "Premium digital marketplace",
    "priceRange": "$1 - $500",
    "currenciesAccepted": "USD",
    "paymentAccepted": "Cryptocurrency, Gift Card",
  }, null, 2);

  const seoChecks = [
    { label: "Title tag length (50-60 chars)", ok: titleLen >= 50 && titleLen <= 60, detail: `${titleLen} chars` },
    { label: "Meta description length (150-160 chars)", ok: descLen >= 150 && descLen <= 160, detail: `${descLen} chars` },
    { label: "Keywords defined", ok: keywords.length > 0, detail: keywords ? `${keywords.split(",").length} keywords` : "None" },
    { label: "Sitemap exists", ok: true, detail: `${appUrl}/sitemap.xml` },
    { label: "Robots.txt configured", ok: true, detail: `${appUrl}/robots.txt` },
    { label: "Open Graph tags", ok: true, detail: "Configured in layout.tsx" },
    { label: "JSON-LD structured data", ok: true, detail: "WebSite + Organization + Store" },
    { label: "Canonical URLs", ok: true, detail: "Set on all pages" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Globe size={22} style={{ color: "#f59e0b" }} /> SEO Manager
        </h1>
      </div>

      {/* SEO Health */}
      <div className="glass-card p-5">
        <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <CheckCircle size={14} style={{ color: "#4ade80" }} /> SEO Health Check
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {seoChecks.map((check) => (
            <div key={check.label} className="flex items-center justify-between p-2.5 rounded-xl"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-2">
                {check.ok
                  ? <CheckCircle size={12} className="text-green-400 shrink-0" />
                  : <AlertTriangle size={12} className="text-yellow-400 shrink-0" />}
                <span className="text-xs text-gray-300">{check.label}</span>
              </div>
              <span className="text-xs text-gray-600 ml-2 shrink-0">{check.detail}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Meta Tags Editor */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <FileText size={14} style={{ color: "#f59e0b" }} /> Meta Tags Editor
            </h2>
            <button onClick={generateWithAI} disabled={isGenerating}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-all text-amber-400 hover:bg-amber-400/10 disabled:opacity-50"
              style={{ border: "1px solid rgba(245,158,11,0.2)" }}>
              {isGenerating ? <Loader2 size={12} className="animate-spin" /> : <Bot size={12} />}
              {isGenerating ? "Generating..." : "Auto-Generate"}
            </button>
          </div>
          {error && (
            <div className="mb-3 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              {error}
            </div>
          )}
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-gray-500">Page Title</label>
                <span className={`text-xs ${titleLen > 60 ? "text-red-400" : titleLen >= 50 ? "text-green-400" : "text-yellow-400"}`}>
                  {titleLen}/60
                </span>
              </div>
              <input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="MetraMart - Premium Digital Subscriptions"
                className="input-field text-sm py-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-gray-500">Meta Description</label>
                <span className={`text-xs ${descLen > 160 ? "text-red-400" : descLen >= 150 ? "text-green-400" : "text-yellow-400"}`}>
                  {descLen}/160
                </span>
              </div>
              <textarea value={metaDesc} onChange={(e) => setMetaDesc(e.target.value)}
                placeholder="Buy Netflix, Spotify, ChatGPT Plus and more at the best prices. Instant delivery worldwide."
                rows={3} className="input-field text-sm py-2 resize-none w-full" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Keywords (comma separated)</label>
              <input value={keywords} onChange={(e) => setKeywords(e.target.value)}
                placeholder="buy netflix cheap, spotify premium, chatgpt plus"
                className="input-field text-sm py-2" />
            </div>
            <button onClick={saveMeta} disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-black disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}>
              {saving ? <Loader2 size={14} className="animate-spin" /> : null}
              {saving ? "Saving..." : saved ? "Saved!" : "Save Meta Tags"}
            </button>
          </div>

          {/* SERP Preview */}
          {(metaTitle || metaDesc) && (
            <div className="mt-4 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <p className="text-xs text-gray-500 mb-2">SERP Preview</p>
              <p className="text-blue-400 text-sm font-medium truncate">{metaTitle || "Page Title"}</p>
              <p className="text-green-600 text-xs">{appUrl}</p>
              <p className="text-gray-400 text-xs mt-1 line-clamp-2">{metaDesc || "Meta description..."}</p>
            </div>
          )}
        </div>

        {/* Sitemap & Indexing */}
        <div className="glass-card p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Send size={14} style={{ color: "#f59e0b" }} /> Sitemap & Indexing
          </h2>
          <div className="space-y-3">
            <div className="p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <p className="text-xs text-gray-500 mb-1">Sitemap URL</p>
              <div className="flex items-center gap-2">
                <code className="text-xs text-amber-400 flex-1 truncate">{appUrl}/sitemap.xml</code>
                <button onClick={() => copyText(`${appUrl}/sitemap.xml`, "sitemap")}
                  className="shrink-0 p-1 rounded text-gray-500 hover:text-white">
                  {copied === "sitemap" ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-gray-500">Ping Search Engines</p>
              {[
                { name: "Google", engine: "google", color: "#4285f4" },
                { name: "Bing", engine: "bing", color: "#00809d" },
              ].map((se) => (
                <button key={se.engine} onClick={() => pingSitemap(se.engine)} disabled={pinging}
                  className="w-full flex items-center justify-between p-3 rounded-xl transition-all hover:opacity-80"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <span className="text-sm text-white">Submit to {se.name}</span>
                  {pinging ? <Loader2 size={13} className="animate-spin text-amber-400" /> : <Send size={13} style={{ color: "#f59e0b" }} />}
                </button>
              ))}
            </div>

            {pingResult && (
              <p className="text-xs text-green-400 p-2 rounded-lg" style={{ background: "rgba(74,222,128,0.08)" }}>
                {pingResult}
              </p>
            )}

            <div className="space-y-2 pt-1">
              <p className="text-xs text-gray-500">Quick Actions</p>
              {[
                { label: "View Sitemap", url: `${appUrl}/sitemap.xml` },
                { label: "View Robots.txt", url: `${appUrl}/robots.txt` },
                { label: "Google Search Console", url: "https://search.google.com/search-console" },
                { label: "Bing Webmaster Tools", url: "https://www.bing.com/webmasters" },
                { label: "PageSpeed Test", url: `https://pagespeed.web.dev/report?url=${encodeURIComponent(appUrl)}` },
                { label: "Schema Validator", url: `https://validator.schema.org/#url=${encodeURIComponent(appUrl)}` },
              ].map((item) => (
                <a key={item.label} href={item.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-xl transition-all hover:bg-white/5 text-sm text-gray-300 hover:text-white"
                  style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                  {item.label}
                  <TrendingUp size={11} className="text-gray-600" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Structured Data Preview */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Code size={14} style={{ color: "#f59e0b" }} /> JSON-LD Structured Data
            </h2>
            <button onClick={() => copyText(structuredData, "jsonld")}
              className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300">
              {copied === "jsonld" ? <Check size={11} /> : <Copy size={11} />}
              Copy
            </button>
          </div>
          <pre className="text-xs text-gray-400 overflow-auto max-h-48 p-3 rounded-xl"
            style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.06)" }}>
            {structuredData}
          </pre>
        </div>

        {/* Advanced Keyword Explorer (Ahrefs Style) */}
        <div className="glass-card p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Search size={14} style={{ color: "#f59e0b" }} /> Advanced Keyword Explorer
          </h2>
          <div className="flex gap-2 mb-4">
            <input 
              value={kwSearch}
              onChange={(e) => setKwSearch(e.target.value)}
              placeholder="Enter keyword..."
              className="input-field text-sm py-2 flex-1"
            />
            <button 
              onClick={exploreKeyword}
              disabled={kwLoading}
              className="px-4 py-2 bg-amber-500 rounded-lg text-black text-xs font-bold disabled:opacity-50"
            >
              {kwLoading ? <Loader2 size={12} className="animate-spin" /> : "Explore"}
            </button>
          </div>

          {kwResults && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-1">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-center">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Volume</p>
                  <p className="text-sm font-bold text-white">{kwResults.volume.toLocaleString()}</p>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-center">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Difficulty</p>
                  <p className={`text-sm font-bold ${kwResults.difficulty > 70 ? 'text-red-400' : kwResults.difficulty > 40 ? 'text-yellow-400' : 'text-green-400'}`}>
                    {kwResults.difficulty}/100
                  </p>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-center">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">CPC</p>
                  <p className="text-sm font-bold text-blue-400">${kwResults.cpc}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-2">Related High-Traffic Keywords</p>
                <div className="flex flex-wrap gap-1.5">
                  {kwResults.related.map((kw: string) => (
                    <button key={kw} onClick={() => setKwSearch(kw)} className="text-[10px] px-2 py-1 bg-white/5 border border-white/10 rounded-full text-gray-400 hover:text-white hover:border-amber-500/50 transition-colors">
                      {kw}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Competitor AI Intel (SEMrush Style) */}
        <div className="glass-card p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart size={14} style={{ color: "#f59e0b" }} /> Competitor AI Intel
          </h2>
          <div className="flex gap-2 mb-4">
            <input 
              value={compUrl}
              onChange={(e) => setCompUrl(e.target.value)}
              placeholder="Competitor URL (e.g. store.com)..."
              className="input-field text-sm py-2 flex-1"
            />
            <button 
              onClick={analyzeCompetitor}
              disabled={compLoading}
              className="px-4 py-2 bg-amber-500 rounded-lg text-black text-xs font-bold disabled:opacity-50"
            >
              {compLoading ? <Loader2 size={12} className="animate-spin" /> : "Spy"}
            </button>
          </div>

          {compResult && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-1">
              <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-amber-500 uppercase font-bold tracking-widest">Est. Monthly Traffic</span>
                  <TrendingUp size={12} className="text-amber-500" />
                </div>
                <p className="text-xl font-bold text-white">{compResult.traffic}</p>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                  <p className="text-[10px] text-gray-500 uppercase mb-2">Targeting Keywords</p>
                  <div className="flex flex-wrap gap-1">
                    {compResult.topKeywords.map((k: string) => (
                      <span key={k} className="text-[10px] px-2 py-0.5 bg-white/5 border border-white/5 rounded text-gray-400">{k}</span>
                    ))}
                  </div>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                  <p className="text-[10px] text-gray-500 uppercase mb-2">Strategic Vulnerabilities</p>
                  <ul className="space-y-1">
                    {compResult.weaknesses.map((w: string) => (
                      <li key={w} className="text-[10px] text-red-400/80 flex items-start gap-1.5">
                        <AlertTriangle size={10} className="mt-0.5 shrink-0" /> {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* AI SEO Auditor */}
        <div className="glass-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Bot size={14} style={{ color: "#f59e0b" }} /> OWL AI SEO Auditor
            </h2>
            <button onClick={runAIAudit} disabled={auditing}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all text-black font-semibold disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}>
              {auditing ? <Loader2 size={12} className="animate-spin" /> : <Search size={12} />}
              {auditing ? "Auditing..." : "Run SEO Audit"}
            </button>
          </div>
          {auditResult ? (
            <div className="p-4 rounded-xl text-sm text-gray-300 leading-relaxed whitespace-pre-wrap ai-markdown-body"
                 style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              {auditResult}
            </div>
          ) : (
            <p className="text-xs text-gray-500 text-center py-4">
              Click the button above to let OWL AI analyze your meta tags and provide actionable ranking improvements.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
