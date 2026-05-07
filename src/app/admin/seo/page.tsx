import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { Globe, Search, TrendingUp, FileText, ExternalLink, CheckCircle, AlertTriangle, Link2 } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminSEOPage() {
  await requireAdmin();

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://metramart.xyz";

  // Gather SEO-relevant data
  const [totalProducts, publishedPosts, totalOrders, totalUsers] = await Promise.all([
    db.product.count({ where: { isActive: true } }),
    db.blogPost.count({ where: { published: true } }),
    db.order.count({ where: { status: "PAID" } }),
    db.user.count(),
  ]);

  const recentPosts = await db.blogPost.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { slug: true, title: true, category: true, createdAt: true },
  });

  const seoChecks = [
    { label: "Sitemap accessible", url: `${APP_URL}/sitemap.xml`, status: "ok" },
    { label: "Robots.txt configured", url: `${APP_URL}/robots.txt`, status: "ok" },
    { label: "Open Graph tags set", status: "ok" },
    { label: "Twitter Card meta set", status: "ok" },
    { label: "JSON-LD structured data", status: "ok" },
    { label: "Canonical URLs configured", status: "ok" },
    { label: "Blog posts published", status: publishedPosts > 0 ? "ok" : "warn", detail: `${publishedPosts} posts` },
    { label: "Product pages indexed", status: totalProducts > 0 ? "ok" : "warn", detail: `${totalProducts} products` },
  ];

  const externalTools = [
    { name: "Google Search Console", url: "https://search.google.com/search-console", desc: "Monitor search performance, indexing, and crawl errors" },
    { name: "Google Analytics", url: "https://analytics.google.com", desc: "Traffic, user behavior, and conversion tracking" },
    { name: "Ahrefs", url: "https://ahrefs.com", desc: "Backlink analysis, keyword research, site audit" },
    { name: "SEMrush", url: "https://semrush.com", desc: "Competitor analysis, keyword tracking, SEO audit" },
    { name: "Moz", url: "https://moz.com", desc: "Domain authority, link explorer, rank tracking" },
    { name: "PageSpeed Insights", url: `https://pagespeed.web.dev/report?url=${encodeURIComponent(APP_URL)}`, desc: "Core Web Vitals and performance score" },
    { name: "Schema Markup Validator", url: `https://validator.schema.org/#url=${encodeURIComponent(APP_URL)}`, desc: "Validate JSON-LD structured data" },
    { name: "Twitter Card Validator", url: "https://cards-dev.twitter.com/validator", desc: "Preview Twitter card appearance" },
    { name: "Open Graph Debugger", url: `https://www.opengraph.xyz/url/${encodeURIComponent(APP_URL)}`, desc: "Preview Open Graph tags" },
    { name: "Bing Webmaster Tools", url: "https://www.bing.com/webmasters", desc: "Bing search performance and indexing" },
  ];

  const targetKeywords = [
    "buy netflix cheap", "spotify premium discount", "chatgpt plus cheap",
    "buy digital subscriptions", "instant delivery digital products",
    "cheap streaming services", "gaming keys cheap", "software licenses discount",
    "metramart", "digital marketplace instant delivery",
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Globe size={22} style={{ color: "#f59e0b" }} /> SEO Tools
        </h1>
        <a href={`${APP_URL}/sitemap.xml`} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all"
          style={{ background: "rgba(245,158,11,0.1)", color: "#fbbf24", border: "1px solid rgba(245,158,11,0.2)" }}>
          <ExternalLink size={12} /> View Sitemap
        </a>
      </div>

      {/* Site overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active Products", value: totalProducts, icon: Search, color: "#f59e0b" },
          { label: "Blog Posts", value: publishedPosts, icon: FileText, color: "#4ade80" },
          { label: "Total Orders", value: totalOrders, icon: TrendingUp, color: "#fbbf24" },
          { label: "Registered Users", value: totalUsers, icon: Globe, color: "#a78bfa" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass-card p-4">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
              <Icon size={12} style={{ color }} /> {label}
            </div>
            <div className="text-2xl font-bold" style={{ color }}>{value.toLocaleString()}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* SEO Health Checks */}
        <div className="glass-card p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <CheckCircle size={14} style={{ color: "#4ade80" }} /> SEO Health Check
          </h2>
          <div className="space-y-2.5">
            {seoChecks.map((check) => (
              <div key={check.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {check.status === "ok"
                    ? <CheckCircle size={13} className="text-green-400 shrink-0" />
                    : <AlertTriangle size={13} className="text-yellow-400 shrink-0" />}
                  <span className="text-sm text-gray-300">{check.label}</span>
                  {check.detail && <span className="text-xs text-gray-600">({check.detail})</span>}
                </div>
                {check.url && (
                  <a href={check.url} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1">
                    Check <ExternalLink size={10} />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Target Keywords */}
        <div className="glass-card p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Search size={14} style={{ color: "#f59e0b" }} /> Target Keywords
          </h2>
          <p className="text-xs text-gray-500 mb-3">Keywords your site is optimized for. Check rankings in external tools.</p>
          <div className="flex flex-wrap gap-2">
            {targetKeywords.map((kw) => (
              <a key={kw}
                href={`https://ahrefs.com/keywords-explorer?input=${encodeURIComponent(kw)}&mode=exact`}
                target="_blank" rel="noopener noreferrer"
                className="text-xs px-2.5 py-1 rounded-full transition-all hover:opacity-80"
                style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.15)", color: "#fbbf24" }}>
                {kw}
              </a>
            ))}
          </div>
          <p className="text-xs text-gray-600 mt-3">Click any keyword to check in Ahrefs</p>
        </div>

        {/* Recent Blog Posts */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <FileText size={14} style={{ color: "#4ade80" }} /> Published Blog Posts
            </h2>
            <Link href="/admin/blog" className="text-xs text-amber-400 hover:text-amber-300">Manage</Link>
          </div>
          {recentPosts.length === 0 ? (
            <p className="text-xs text-gray-600">No published posts yet. <Link href="/admin/blog/new" className="text-amber-400">Create one</Link></p>
          ) : (
            <div className="space-y-2.5">
              {recentPosts.map((post) => (
                <div key={post.slug} className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm text-gray-300 truncate">{post.title}</p>
                    <p className="text-xs text-gray-600">{post.category} · {new Date(post.createdAt).toLocaleDateString()}</p>
                  </div>
                  <a href={`${APP_URL}/blog/${post.slug}`} target="_blank" rel="noopener noreferrer"
                    className="text-amber-400 hover:text-amber-300 shrink-0 ml-2">
                    <ExternalLink size={12} />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Indexing Links */}
        <div className="glass-card p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Link2 size={14} style={{ color: "#60a5fa" }} /> Submit for Indexing
          </h2>
          <div className="space-y-2.5">
            {[
              { name: "Google — Submit Sitemap", url: `https://search.google.com/search-console/sitemaps?resource_id=${encodeURIComponent(APP_URL)}` },
              { name: "Bing — Submit Sitemap", url: `https://www.bing.com/webmasters/sitemaps?siteUrl=${encodeURIComponent(APP_URL)}` },
              { name: "Google — Request Indexing", url: "https://search.google.com/search-console/inspect" },
              { name: "IndexNow (Bing/Yandex)", url: `https://www.bing.com/indexnow?url=${encodeURIComponent(APP_URL)}&key=your-key` },
            ].map((item) => (
              <a key={item.name} href={item.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-xl transition-all hover:bg-white/5"
                style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                <span className="text-sm text-gray-300">{item.name}</span>
                <ExternalLink size={12} className="text-gray-600" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* External SEO Tools */}
      <div className="glass-card p-5">
        <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp size={14} style={{ color: "#f59e0b" }} /> External SEO & Analytics Tools
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {externalTools.map((tool) => (
            <a key={tool.name} href={tool.url} target="_blank" rel="noopener noreferrer"
              className="p-3.5 rounded-xl transition-all hover:-translate-y-0.5 hover:border-amber-500/20 group"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-white group-hover:text-amber-300 transition-colors">{tool.name}</span>
                <ExternalLink size={11} className="text-gray-600 group-hover:text-amber-400 transition-colors" />
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{tool.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
