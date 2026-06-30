"use client";

import { useState } from "react";
import { 
  Megaphone, Sparkles, Send, Calendar, TrendingUp, 
  MessageSquare, Layout, Target, Zap, Loader2, 
  Check, Copy, Facebook, Instagram, Twitter, Mail
} from "lucide-react";

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState("campaign");
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  async function generateMarketing(type: string) {
    if (!prompt.trim()) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      let systemPrompt = "";
      if (type === "campaign") {
        systemPrompt = "Act as a CMO. Create a full multi-channel marketing campaign (Email, Social, Ad copy).";
      } else if (type === "social") {
        systemPrompt = "Act as a Social Media Manager. Generate 5 creative post ideas with captions and hashtags.";
      } else if (type === "promo") {
        systemPrompt = "Act as a Revenue Strategist. Suggest a high-converting discount strategy and promo codes.";
      }

      const res = await fetch("/api/admin/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt }
          ],
          context: type === "promo" ? "strategy" : "marketing",
          model: "poolside/laguna-m.1:free"
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "AI request failed");
      } else if (data.reply) {
        setResult(data.reply);
      }
    } catch (e) { 
      console.error(e); 
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSocialBlast() {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch("/api/admin/social-blast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Blast failed");
      } else {
        setResult(`🚀 **SOCIAL MEDIA BLAST SUCCESSFUL**\n\n**Product:** ${data.product}\n\n**Generated Ad Copy:**\n${data.ad}\n\n✅ This advertisement has been pushed to your social channels (Discord/Twitter/Meta).`);
      }
    } catch (e) {
      console.error(e);
      setError("Network error during blast.");
    } finally {
      setLoading(false);
    }
  }

  function copyText(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Megaphone size={24} className="text-orange-400" />
            Marketing Suite
          </h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            AI-powered campaign generation and social blasts
          </p>
        </div>
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 w-fit">
          {[
            { id: "campaign", label: "Campaigns", icon: Zap },
            { id: "social", label: "Social", icon: MessageSquare },
            { id: "blast", label: "Blast", icon: Send },
            { id: "promo", label: "Strategy", icon: Target },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all ${
                activeTab === tab.id ? "bg-orange-500 text-black shadow-lg" : "text-zinc-500 hover:text-white"
              }`}
            >
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="admin-card p-6">
            <h2 className="text-sm font-bold text-white mb-4 uppercase tracking-widest flex items-center gap-2">
              <Sparkles size={16} className="text-orange-400" /> AI Generator
            </h2>
            <div className="space-y-4">
              <p className="text-xs font-medium text-zinc-500 leading-relaxed">
                {activeTab === "campaign" && "Describe your new product or sale to generate a full launch plan."}
                {activeTab === "social" && "What is the vibe or topic for your next social media blast?"}
                {activeTab === "blast" && "Piyrox AI will pick a hot product and blast a generated ad to your social channels."}
                {activeTab === "promo" && "What are your goals? (e.g. clear old stock, increase average order value)"}
              </p>
              
              {activeTab === "blast" ? (
                <button
                  onClick={() => handleSocialBlast()}
                  disabled={loading}
                  className="w-full py-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl text-white font-black text-lg flex flex-col items-center justify-center gap-3 shadow-xl hover:scale-[1.02] active:scale-95 transition-all group overflow-hidden relative"
                >
                  <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                  <div className="relative z-10 flex items-center gap-2">
                    {loading ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                    ACTIVATE SOCIAL BLAST
                  </div>
                  <span className="relative z-10 text-[10px] opacity-70 font-bold uppercase tracking-widest bg-black/20 px-3 py-1 rounded-full">Powered by Laguna AI</span>
                </button>
              ) : (
                <>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={5}
                    placeholder="Type your goals here..."
                    className="input-field w-full text-sm resize-none leading-relaxed"
                  />
                  <button
                    onClick={() => generateMarketing(activeTab)}
                    disabled={loading || !prompt.trim()}
                    className="w-full py-4 bg-orange-500 hover:bg-orange-600 rounded-xl text-black font-black text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                    Generate {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="admin-card p-6 border-t-2 border-t-blue-500">
            <h2 className="text-sm font-bold text-white mb-4 uppercase tracking-widest flex items-center gap-2">
              <TrendingUp size={16} className="text-blue-400" /> Market Trends
            </h2>
            <div className="space-y-3">
              {[
                { label: "Streaming Demand", value: "+24%", color: "text-green-400", bg: "bg-green-500/10" },
                { label: "AI Tools Interest", value: "+89%", color: "text-orange-400", bg: "bg-orange-500/10" },
                { label: "Software Key Competition", value: "High", color: "text-red-400", bg: "bg-red-500/10" },
              ].map((trend) => (
                <div key={trend.label} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                  <span className="text-xs font-bold text-zinc-300">{trend.label}</span>
                  <span className={`text-[11px] font-bold uppercase tracking-widest px-2 py-1 rounded ${trend.color} ${trend.bg}`}>{trend.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col">
          {result ? (
            <div className="admin-card flex-1 flex flex-col animate-in fade-in slide-in-from-right-4">
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                    <Zap size={24} className="text-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">AI Strategy Result</h3>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 mt-1">Generated by Laguna AI</p>
                  </div>
                </div>
                <button 
                  onClick={() => copyText(result, "res")}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors text-[11px] font-bold uppercase tracking-widest text-zinc-300 hover:text-white"
                >
                  {copied === "res" ? <><Check size={14} className="text-green-400" /> Copied</> : <><Copy size={14} /> Copy All</>}
                </button>
              </div>
              
              {error && (
                <div className="m-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
                  <AlertCircle size={18} className="text-red-400 shrink-0" />
                  <p className="text-sm font-bold text-red-400">{error}</p>
                </div>
              )}
              
              <div className="p-6 flex-1 overflow-auto">
                <div className="prose prose-invert max-w-none prose-p:text-zinc-400 prose-headings:text-white prose-strong:text-orange-400 whitespace-pre-wrap text-sm leading-relaxed">
                  {result}
                </div>
              </div>
            </div>
          ) : (
            <div className="admin-card flex-1 min-h-[500px] flex flex-col items-center justify-center text-center p-8 bg-white/[0.02] border-dashed">
              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm max-w-md font-bold flex items-center justify-center gap-2 w-full">
                  <AlertCircle size={18} /> {error}
                </div>
              )}
              <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-center mb-6">
                <Megaphone size={36} className="text-zinc-600" />
              </div>
              <h3 className="text-2xl font-black text-white mb-2">Ready to scale?</h3>
              <p className="text-sm font-medium text-zinc-500 max-w-sm">
                Select a tab and provide some details. Laguna AI will build your next breakthrough marketing campaign in seconds.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
