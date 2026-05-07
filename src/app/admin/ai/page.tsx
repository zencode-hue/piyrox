"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Send, Loader2, Trash2, Copy, Check, Sparkles, Settings } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  ts: number;
}

const QUICK_PROMPTS = [
  "Write a product description for Netflix Premium subscription",
  "Draft a welcome email for new MetraMart customers",
  "Suggest 5 discount code names for a flash sale",
  "Write an SEO blog post intro about cheap Spotify Premium",
  "Create a Discord announcement for today's deals",
  "Suggest pricing strategy for AI tools category",
  "Write a product description for ChatGPT Plus subscription",
  "Draft a re-engagement email for inactive customers",
];

export default function AdminAIPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("google/gemini-2.0-flash-exp:free");
  const [showConfig, setShowConfig] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("mm_ai_key");
    const savedModel = localStorage.getItem("mm_ai_model");
    if (saved) setApiKey(saved);
    if (savedModel) setModel(savedModel);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function saveConfig() {
    localStorage.setItem("mm_ai_key", apiKey);
    localStorage.setItem("mm_ai_model", model);
    setShowConfig(false);
  }

  async function send() {
    if (!input.trim() || loading) return;
    if (!apiKey) { setShowConfig(true); return; }

    const userMsg: Message = { role: "user", content: input.trim(), ts: Date.now() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          model,
          apiKey,
        }),
      });

      const data = await res.json() as { reply?: string; error?: string };
      if (!res.ok) {
        setError(data.error ?? "AI request failed");
        return;
      }
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply ?? "No response.", ts: Date.now() }]);
    } catch {
      setError("Network error. Check your connection.");
    } finally {
      setLoading(false);
    }
  }

  function copyMsg(content: string, ts: number) {
    navigator.clipboard.writeText(content);
    setCopied(ts);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-h-[800px]">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Bot size={22} style={{ color: "#f59e0b" }} /> AI Assistant
        </h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setMessages([])}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all hover:bg-white/10"
            style={{ color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <Trash2 size={12} /> Clear
          </button>
          <button onClick={() => setShowConfig(!showConfig)}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all"
            style={{
              background: apiKey ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)",
              color: apiKey ? "#fbbf24" : "#f87171",
              border: `1px solid ${apiKey ? "rgba(245,158,11,0.2)" : "rgba(239,68,68,0.2)"}`,
            }}>
            <Settings size={12} /> {apiKey ? model.split("/")[1] ?? model : "Configure API Key"}
          </button>
        </div>
      </div>

      {/* Config panel */}
      {showConfig && (
        <div className="glass-card p-4 mb-4 space-y-3" style={{ borderColor: "rgba(245,158,11,0.2)" }}>
          <div>
            <p className="text-xs text-gray-400 mb-2">
              Get your free API key at{" "}
              <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">
                openrouter.ai
              </a>
              {" "}— many models are free or very cheap.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">OpenRouter API Key</label>
              <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-or-..." className="input-field text-sm py-2" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Model</label>
              <select value={model} onChange={(e) => setModel(e.target.value)}
                className="input-field text-sm py-2">
                <option value="google/gemini-2.0-flash-exp:free">Gemini 2.0 Flash Exp (FREE - Best)</option>
                <option value="google/gemini-1.5-flash">Gemini 1.5 Flash (FREE)</option>
                <option value="meta-llama/llama-3.3-70b-instruct:free">Llama 3.3 70B (FREE)</option>
                <option value="qwen/qwen-2.5-72b-instruct:free">Qwen 2.5 72B (FREE)</option>
                <option value="mistralai/mistral-nemo-free">Mistral Nemo (FREE)</option>
                <option value="openai/gpt-4o-mini">GPT-4o Mini</option>
              </select>
            </div>
          </div>
          <button onClick={saveConfig}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-black"
            style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}>
            Save Configuration
          </button>
          <p className="text-xs text-gray-600">API key is stored in your browser only, never sent to our servers except to proxy the AI request.</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-3 p-3 rounded-xl text-sm text-red-400" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
          {error}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <Bot size={40} className="mx-auto mb-3 opacity-20" style={{ color: "#f59e0b" }} />
            <p className="text-gray-500 text-sm mb-6">Your MetraMart AI assistant. Ask anything about your store.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-2xl mx-auto">
              {QUICK_PROMPTS.map((p) => (
                <button key={p} onClick={() => setInput(p)}
                  className="text-left text-xs px-3 py-2.5 rounded-xl transition-all hover:-translate-y-0.5"
                  style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.12)", color: "rgba(255,255,255,0.6)" }}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.ts} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className="max-w-[85%] relative group">
              <div className="rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap"
                style={msg.role === "user"
                  ? { background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.2)", color: "#fff" }
                  : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.85)" }}>
                {msg.content}
              </div>
              <button onClick={() => copyMsg(msg.content, msg.ts)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg"
                style={{ background: "rgba(0,0,0,0.5)" }}>
                {copied === msg.ts ? <Check size={11} className="text-green-400" /> : <Copy size={11} className="text-gray-400" />}
              </button>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl px-4 py-3 flex items-center gap-2"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <Loader2 size={14} className="animate-spin text-amber-400" />
              <span className="text-xs text-gray-500">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder={apiKey ? "Ask anything... (Enter to send, Shift+Enter for new line)" : "Configure your API key first"}
          rows={2}
          className="input-field flex-1 text-sm resize-none"
          style={{ minHeight: "60px" }}
          disabled={!apiKey}
        />
        <button onClick={send} disabled={loading || !input.trim() || !apiKey}
          className="px-4 rounded-xl font-semibold text-black disabled:opacity-40 transition-all hover:-translate-y-0.5"
          style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", minWidth: "52px" }}>
          {loading ? <Loader2 size={16} className="animate-spin mx-auto" /> : <Send size={16} className="mx-auto" />}
        </button>
      </div>
    </div>
  );
}
