"use client";

import React, { useState } from "react";
import { Sparkles, X, Terminal, Brain, Command } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

export default function AdminAIBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/admin/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: `You are assisting the Admin on the "${pathname}" page. The current URL path is ${pathname}. Help the admin with tasks related to this section. Request: ${input}` }],
          context: "task"
        })
      });
      const data = await res.json();
      
      if (!res.ok || data.error) {
        setResult(`❌ Error: ${data.error || "Failed to get response from Piyrox AI"}`);
      } else {
        setResult(data.reply);
        if (data.reply.includes("✅")) {
          router.refresh();
        }
      }
    } catch (error) {
      setResult("❌ Error: Could not connect to the administrative brain.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-24 lg:bottom-8 right-6 lg:right-8 z-[9999] flex flex-col items-end">
      {/* Expanded Console */}
      {isOpen && (
        <div className="mb-4 w-[350px] sm:w-[450px] bg-zinc-950 border border-zinc-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in slide-in-from-bottom-4 duration-300 backdrop-blur-xl">
          <div className="bg-orange-600 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Piyrox AI Admin</h3>
                <div className="flex items-center gap-1.5">
                  <Terminal className="w-3 h-3 text-orange-200" />
                  <span className="text-[10px] text-orange-100 uppercase tracking-wider font-black italic">Console Active</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
          
          <div className="p-5 max-h-[350px] min-h-[150px] overflow-y-auto scrollbar-hide text-xs font-mono bg-black/40">
            {result ? (
              <div className="space-y-4 animate-in fade-in duration-500">
                <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 leading-relaxed whitespace-pre-wrap">
                  {result}
                </div>
                <button 
                  onClick={() => setResult(null)}
                  className="text-[10px] text-zinc-500 hover:text-orange-500 transition-colors flex items-center gap-1"
                >
                  <Command className="w-3 h-3" /> Clear Console
                </button>
              </div>
            ) : loading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4 text-zinc-500">
                <div className="relative">
                  <Brain className="w-10 h-10 animate-pulse text-orange-500/50" />
                  <div className="absolute inset-0 animate-ping rounded-full bg-orange-500/20" />
                </div>
                <p className="italic text-[11px] font-medium tracking-wide">Synthesizing administrative logic...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-orange-500">
                  <Sparkles className="w-4 h-4" />
                  <span className="font-bold uppercase tracking-widest text-[10px]">Ready for Commands</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    "Create a blog post about our new deals",
                    "How many orders did we get today?",
                    "Sync all products to the Discord vault",
                    "Optimize SEO metadata for the home page"
                  ].map(example => (
                    <button 
                      key={example}
                      onClick={() => setInput(example)}
                      className="text-left p-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-orange-500/30 hover:bg-white/[0.08] text-zinc-400 hover:text-zinc-200 transition-all text-[11px]"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleCommand} className="p-4 bg-zinc-900/50 border-t border-zinc-800">
            <div className="relative">
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Execute administrative command..."
                className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-600/50 transition-all pr-12"
              />
              <button 
                type="submit" 
                disabled={loading || !input.trim()} 
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white rounded-lg transition-all"
              >
                <Command className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Trigger Bubble */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`group relative flex items-center justify-center transition-all duration-300 active:scale-95 ${
          isOpen ? "w-12 h-12 rounded-2xl bg-zinc-800 rotate-90" : "w-14 h-14 rounded-full bg-orange-600 shadow-[0_10px_30px_rgba(234,88,12,0.3)] hover:scale-110 hover:shadow-[0_15px_40px_rgba(234,88,12,0.4)]"
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center animate-bounce shadow-md">
              <Brain className="w-2.5 h-2.5 text-orange-600" />
            </div>
            <Sparkles className="w-6 h-6 text-white" />
            
            {/* Tooltip on Hover (Desktop) */}
            <div className="absolute right-full mr-4 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none hidden lg:block shadow-2xl">
              Ask Piyrox AI <span className="text-orange-500 ml-1">Admin Assistant</span>
            </div>
          </>
        )}
      </button>
    </div>
  );
}
