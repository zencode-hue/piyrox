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
        setResult(`❌ Error: ${data.error || "Failed to get response from Metra AI"}`);
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
    <div className="fixed bottom-0 left-0 right-0 z-[100] lg:left-60">
      {/* Expanded Console */}
      {isOpen && (
        <div className="mx-4 mb-4 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
          <div className="bg-zinc-950 p-3 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-orange-500" />
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Metra AI Admin Console</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="p-4 max-h-[300px] overflow-y-auto scrollbar-hide text-sm font-mono text-zinc-300">
            {result ? (
              <div className="whitespace-pre-wrap leading-relaxed">{result}</div>
            ) : loading ? (
              <div className="flex items-center gap-2 text-zinc-500 italic">
                <Brain className="w-4 h-4 animate-pulse" />
                Processing administrative request...
              </div>
            ) : (
              <div className="text-zinc-600">
                Type a command below to manage MetraMart. 
                <br />
                Examples: &quot;Create a blog about Netflix discounts&quot;, &quot;Show me recent orders&quot;, &quot;Send deals to Discord&quot;.
              </div>
            )}
          </div>

          <form onSubmit={handleCommand} className="p-3 bg-zinc-950 border-t border-zinc-800 flex gap-2">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter AI command..."
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500/50"
            />
            <button type="submit" disabled={loading} className="bg-orange-600 hover:bg-orange-500 text-white p-2 rounded-lg transition-colors">
              <Command className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Trigger Bar */}
      {!isOpen && (
        <div className="p-4 flex justify-center lg:justify-start">
          <button 
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-3 px-5 py-2.5 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 rounded-full shadow-xl transition-all hover:-translate-y-1 active:scale-95 group backdrop-blur-md"
          >
            <div className="w-6 h-6 rounded-full bg-orange-600 flex items-center justify-center shadow-lg shadow-orange-600/20">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors">Ask Metra AI to help with this page</span>
          </button>
        </div>
      )}
    </div>
  );
}
