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
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState<string | null>(null);

  async function generateMarketing(type: string) {
    if (!prompt.trim()) return;
    setLoading(true);
    setResult(null);
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
          ]
        }),
      });
      const data = await res.json();
      if (data.reply) setResult(data.reply);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  function copyText(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Megaphone size={22} style={{ color: "#f59e0b" }} /> Marketing Suite
        </h1>
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
          {[
            { id: "campaign", label: "Campaigns", icon: Zap },
            { id: "social", label: "Social", icon: MessageSquare },
            { id: "promo", label: "Strategy", icon: Target },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab.id ? "bg-amber-500 text-black shadow-lg" : "text-gray-400 hover:text-white"
              }`}
            >
              <tab.icon size={12} /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-5">
            <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Sparkles size={14} className="text-amber-500" /> AI Generator
            </h2>
            <div className="space-y-4">
              <p className="text-xs text-gray-500">
                {activeTab === "campaign" && "Describe your new product or sale to generate a full launch plan."}
                {activeTab === "social" && "What is the vibe or topic for your next social media blast?"}
                {activeTab === "promo" && "What are your goals? (e.g. clear old stock, increase average order value)"}
              </p>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                placeholder="Type your goals here..."
                className="input-field text-sm p-3 resize-none w-full"
              />
              <button
                onClick={() => generateMarketing(activeTab)}
                disabled={loading || !prompt.trim()}
                className="w-full py-3 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl text-black font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 disabled:opacity-50"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                Generate {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </button>
            </div>
          </div>

          <div className="glass-card p-5">
            <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp size={14} className="text-amber-500" /> Market Trends
            </h2>
            <div className="space-y-3">
              {[
                { label: "Streaming Demand", value: "+24%", color: "text-green-400" },
                { label: "AI Tools Interest", value: "+89%", color: "text-amber-400" },
                { label: "Software Key Competition", value: "High", color: "text-red-400" },
              ].map((trend) => (
                <div key={trend.label} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                  <span className="text-xs text-gray-400">{trend.label}</span>
                  <span className={`text-xs font-bold ${trend.color}`}>{trend.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {result ? (
            <div className="glass-card p-6 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                    <Zap size={20} className="text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">AI Strategy Result</h3>
                    <p className="text-xs text-gray-500">Tailored for MetraMart Ecosystem</p>
                  </div>
                </div>
                <button 
                  onClick={() => copyText(result, "res")}
                  className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                >
                  {copied === "res" ? <Check size={16} className="text-green-400" /> : <Copy size={16} className="text-gray-400" />}
                </button>
              </div>
              <div className="prose prose-invert max-w-none prose-p:text-gray-400 prose-headings:text-white prose-strong:text-amber-400 whitespace-pre-wrap text-sm leading-relaxed">
                {result}
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[400px] rounded-2xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mb-4">
                <Megaphone size={32} className="text-gray-600" />
              </div>
              <h3 className="text-xl font-bold text-white/40 mb-2">Ready to scale?</h3>
              <p className="text-sm text-gray-600 max-w-md">
                Select a tab and provide some details. OWL AI will build your next breakthrough marketing campaign in seconds.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
