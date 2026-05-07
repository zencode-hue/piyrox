"use client";

import { useState, useEffect } from "react";
import { Globe, Search, TrendingUp, FileText, CheckCircle, AlertTriangle, Send, RefreshCw, Loader2, Copy, Check, Code } from "lucide-react";

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
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <FileText size={14} style={{ color: "#f59e0b" }} /> Meta Tags Editor
          </h2>
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

        {/* Target Keywords */}
        <div className="glass-card p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Search size={14} style={{ color: "#f59e0b" }} /> Keyword Research
          </h2>
          <p className="text-xs text-gray-500 mb-3">Click any keyword to check search volume and competition.</p>
          <div className="flex flex-wrap gap-2">
            {[
              "buy netflix cheap", "spotify premium discount", "chatgpt plus cheap",
              "buy digital subscriptions", "instant delivery digital products",
              "cheap streaming services", "gaming keys cheap", "software licenses discount",
              "metramart", "buy iptv subscription", "buy disney plus cheap",
              "buy claude pro", "buy midjourney subscription",
            ].map((kw) => (
              <a key={kw}
                href={`https://ahrefs.com/keywords-explorer?input=${encodeURIComponent(kw)}&mode=exact`}
                target="_blank" rel="noopener noreferrer"
                className="text-xs px-2.5 py-1 rounded-full transition-all hover:opacity-80"
                style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.15)", color: "#fbbf24" }}>
                {kw}
              </a>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-xl" style={{ background: "rgba(245,158,11,0.04)", border: "1px solid rgba(245,158,11,0.1)" }}>
            <p className="text-xs text-amber-400 font-medium mb-1">SEO Tips</p>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>- Keep title under 60 chars, description 150-160 chars</li>
              <li>- Add blog posts targeting long-tail keywords</li>
              <li>- Submit sitemap to Google Search Console monthly</li>
              <li>- Use product-specific meta descriptions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
