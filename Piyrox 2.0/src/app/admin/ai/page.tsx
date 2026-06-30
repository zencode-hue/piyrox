"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Bot, Send, Loader2, Trash2, Copy, Check, Settings, Zap, ChevronDown, Paperclip, X, FileVideo, Sparkles } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: string | any[];
  ts: number;
  toolResult?: string | null;
  files?: string[];
}

const AI_MODELS = [
  { id: "poolside/laguna-m.1:free", name: "Laguna M.1", tag: "DEFAULT" },
  { id: "google/gemini-2.5-pro:free", name: "Gemini 2.5 Pro", tag: "FREE" },
  { id: "google/gemini-2.5-flash:free", name: "Gemini 2.5 Flash", tag: "FREE" },
  { id: "z-ai/glm-4.5-air:free", name: "GLM 4.5 Air", tag: "FREE" },
  { id: "qwen/qwen-2.5-72b-instruct:free", name: "Qwen 2.5 72B", tag: "FREE" },
];

const QUICK_PROMPTS = [
  { icon: "📝", text: "Write a product description for Netflix Premium" },
  { icon: "📧", text: "Draft a welcome email for new customers" },
  { icon: "🏷️", text: "Suggest 5 discount code names for a flash sale" },
  { icon: "📰", text: "Create and publish a blog post about our latest deals" },
  { icon: "📢", text: "Send a Discord announcement about today's deals" },
  { icon: "💡", text: "Suggest pricing strategy for AI tools category" },
];

function renderMarkdown(text: string): string {
  let html = text
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="ai-code-block"><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code class="ai-inline-code">$1</code>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/~~(.+?)~~/g, "<del>$1</del>")
    .replace(/^### (.+)$/gm, '<h4 class="ai-h4">$1</h4>')
    .replace(/^## (.+)$/gm, '<h3 class="ai-h3">$1</h3>')
    .replace(/^# (.+)$/gm, '<h2 class="ai-h2">$1</h2>')
    .replace(/^---$/gm, '<hr class="ai-hr" />')
    .replace(/^[•\-\*] (.+)$/gm, '<li class="ai-li">$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li class="ai-li-num">$1</li>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="ai-link">$1</a>')
    .replace(/\n/g, "<br />");

  html = html.replace(/((?:<li class="ai-li">.*?<\/li><br \/>)+)/g, (match) => {
    return '<ul class="ai-ul">' + match.replace(/<br \/>/g, "") + "</ul>";
  });
  html = html.replace(/((?:<li class="ai-li-num">.*?<\/li><br \/>)+)/g, (match) => {
    return '<ol class="ai-ol">' + match.replace(/<br \/>/g, "") + "</ol>";
  });

  return html;
}

export default function AdminAIPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("poolside/laguna-m.1:free");
  const [showConfig, setShowConfig] = useState(false);
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<{ name: string; type: string; base64: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const currentModel = useMemo(() => AI_MODELS.find((m) => m.id === model) || AI_MODELS[0], [model]);

  useEffect(() => {
    const VALID = new Set(AI_MODELS.map((m) => m.id));
    async function loadSettings() {
      try {
        const res = await fetch("/api/admin/settings");
        const json = await res.json();
        if (json.data) {
          if (json.data.ai_api_key) setApiKey(json.data.ai_api_key);
          const savedModel = json.data.ai_model;
          if (savedModel && VALID.has(savedModel)) {
            setModel(savedModel);
          } else {
            setModel("poolside/laguna-m.1:free");
            await fetch("/api/admin/settings", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ai_model: "poolside/laguna-m.1:free" })
            });
          }
        }
      } catch (err) {
        console.error("Failed to load settings", err);
      }
    }
    loadSettings();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function saveConfig() {
    try {
      await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ai_api_key: apiKey, ai_model: model }),
      });
      setShowConfig(false);
    } catch {
      setError("Failed to save configuration.");
    }
  }

  async function selectModel(id: string) {
    setModel(id);
    setShowModelPicker(false);
    try {
      await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ai_model: id }),
      });
    } catch (err) {
      console.error("Failed to save model", err);
    }
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedFiles(prev => [...prev, {
          name: file.name,
          type: file.type,
          base64: reader.result as string
        }]);
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeFile(index: number) {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  }

  async function send(overrideInput?: string) {
    const text = (overrideInput || input).trim();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((!text && selectedFiles.length === 0) || loading) return;
    if (!apiKey) { setShowConfig(true); return; }

    const fileUrls = selectedFiles.map(f => f.base64);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let messageContent: any = text;
    if (selectedFiles.length > 0) {
      messageContent = [
        { type: "text", text: text || "Analyze this." },
        ...selectedFiles.map(f => ({
          type: "image_url",
          image_url: { url: f.base64 }
        }))
      ];
    }

    const userMsg: Message = { role: "user", content: messageContent, ts: Date.now(), files: fileUrls };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setSelectedFiles([]);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          model: model
        }),
      });
      const data = await res.json() as { reply?: string; error?: string; toolResult?: string | null };
      if (!res.ok) {
        setError(data.error ?? "AI request failed");
        return;
      }
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply ?? "No response.", ts: Date.now(), toolResult: data.toolResult },
      ]);
    } catch {
      setError("Network error. Check your connection.");
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function copyMsg(content: string | any[], ts: number) {
    const text = typeof content === "string" ? content : JSON.stringify(content);
    navigator.clipboard.writeText(text);
    setCopied(ts);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Bot size={20} className="text-black" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              Piyrox AI <span className="text-[10px] font-black uppercase tracking-widest bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded">LAGUNA M.1</span>
            </h1>
            <p className="text-[11px] text-zinc-500 font-medium">Full store access — can write, publish, and push</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMessages([])}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-zinc-500 hover:text-white hover:bg-white/10 transition-all"
          >
            <Trash2 size={12} /> Clear
          </button>

          <div className="relative">
            <button
              onClick={() => setShowModelPicker(!showModelPicker)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/20 transition-all"
            >
              <Zap size={11} /> {currentModel.name}
              <ChevronDown size={10} />
            </button>
            {showModelPicker && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowModelPicker(false)} />
                <div className="absolute right-0 top-full mt-2 z-50 min-w-[220px] rounded-xl p-2 shadow-2xl bg-[#111118] border border-white/10">
                  {AI_MODELS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => selectModel(m.id)}
                      className={`w-full text-left text-xs px-3 py-2.5 rounded-lg flex items-center justify-between gap-3 transition-all mb-1 last:mb-0 ${
                        model === m.id
                          ? "bg-orange-500/15 text-orange-400"
                          : "text-zinc-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span className="font-bold">{m.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${
                        m.tag === "DEFAULT" ? "bg-orange-500/20 text-orange-400" : "bg-green-500/15 text-green-400"
                      }`}>
                        {m.tag}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <button
            onClick={() => setShowConfig(!showConfig)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all border ${
              apiKey 
                ? "bg-white/5 border-white/10 text-zinc-500 hover:text-white hover:bg-white/10" 
                : "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
            }`}
          >
            <Settings size={12} /> {apiKey ? "API Key" : "Set API Key"}
          </button>
        </div>
      </div>

      {/* Config Panel */}
      {showConfig && (
        <div className="admin-card p-5 mb-4 space-y-3 flex-shrink-0 border-orange-500/20 bg-orange-500/5">
          <p className="text-xs font-medium text-zinc-400">
            Get your free API key at{" "}
            <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline font-bold">
              openrouter.ai
            </a>
            {" "}— most models are free.
          </p>
          <div className="flex gap-2">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-or-..."
              className="input-field text-sm flex-1"
            />
            <button
              onClick={saveConfig}
              className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-black font-black text-sm transition-all whitespace-nowrap"
            >
              Save Key
            </button>
          </div>
          <p className="text-xs text-green-400 font-bold">✓ Stored securely in the database.</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-3 p-3 rounded-xl text-sm text-red-400 flex-shrink-0 bg-red-500/10 border border-red-500/20 font-bold">
          {error}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1 min-h-0 custom-scrollbar">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-10">
            <div className="w-20 h-20 rounded-3xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-6">
              <Sparkles size={36} className="text-orange-400" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Piyrox AI</h2>
            <p className="text-zinc-500 text-sm mb-8 max-w-md font-medium leading-relaxed">
              I can write content, publish blog posts, push deals to Discord, send emails, analyze your store data, and much more.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-3xl w-full">
              {QUICK_PROMPTS.map((p) => (
                <button
                  key={p.text}
                  onClick={() => send(p.text)}
                  className="text-left text-xs px-4 py-3 rounded-xl bg-white/[0.03] border border-white/5 text-zinc-400 hover:text-white hover:bg-white/[0.07] hover:border-orange-500/20 transition-all flex items-start gap-3 group"
                >
                  <span className="text-xl shrink-0">{p.icon}</span>
                  <span className="leading-relaxed group-hover:text-white transition-colors">{p.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.ts} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`relative group ${msg.role === "user" ? "max-w-[75%]" : "max-w-[90%]"}`}>
              {msg.role === "assistant" && (
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-lg bg-orange-500/20 border border-orange-500/20 flex items-center justify-center">
                    <Bot size={12} className="text-orange-400" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Piyrox AI</span>
                </div>
              )}
              <div
                className="rounded-2xl px-5 py-4 text-sm leading-relaxed relative"
                style={
                  msg.role === "user"
                    ? {
                        background: "rgba(249,115,22,0.12)",
                        border: "1px solid rgba(249,115,22,0.25)",
                        color: "#fff",
                      }
                    : {
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        color: "rgba(255,255,255,0.85)",
                      }
                }
              >
                {msg.files && msg.files.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {msg.files.map((f, i) => (
                      <img key={i} src={f} alt="upload" className="max-w-[200px] max-h-[200px] rounded-lg border border-white/10" />
                    ))}
                  </div>
                )}
                {msg.role === "user" ? (
                  <span className="whitespace-pre-wrap">
                    {typeof msg.content === "string"
                      ? msg.content
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      : (msg.content as any[]).find(c => c.type === "text")?.text || ""}
                  </span>
                ) : (
                  <div
                    className="ai-markdown-body"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content)) }}
                  />
                )}
              </div>
              <button
                onClick={() => copyMsg(msg.content, msg.ts)}
                className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-black/80 border border-white/10"
              >
                {copied === msg.ts ? (
                  <Check size={12} className="text-green-400" />
                ) : (
                  <Copy size={12} className="text-zinc-400" />
                )}
              </button>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-lg bg-orange-500/20 border border-orange-500/20 flex items-center justify-center">
                <Bot size={12} className="text-orange-400" />
              </div>
              <div
                className="rounded-2xl px-5 py-4 flex items-center gap-3"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <span className="text-xs text-zinc-500 font-medium">Piyrox AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Bar */}
      <div className="space-y-2 flex-shrink-0">
        {selectedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
            {selectedFiles.map((f, i) => (
              <div key={i} className="relative group">
                {f.type.startsWith("image/") ? (
                  <img src={f.base64} alt="preview" className="w-16 h-16 rounded-lg object-cover border border-white/10" />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                    <FileVideo size={20} className="text-zinc-500" />
                  </div>
                )}
                <button
                  onClick={() => removeFile(i)}
                  className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2 admin-card p-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            multiple
            accept="image/*,video/*"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-lg bg-white/5 border border-white/5 text-zinc-500 hover:text-orange-400 hover:bg-orange-500/10 transition-all shrink-0"
            disabled={loading || !apiKey}
            title="Attach file"
          >
            <Paperclip size={18} />
          </button>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder={apiKey ? "Ask Piyrox AI anything... (Enter to send, Shift+Enter for newline)" : "Set your API key first →"}
            rows={1}
            className="flex-1 bg-transparent text-sm text-white placeholder-zinc-600 resize-none outline-none py-2.5 leading-relaxed"
            style={{ minHeight: "44px", maxHeight: "120px" }}
            disabled={!apiKey}
          />
          <button
            onClick={() => send()}
            disabled={loading || (!input.trim() && selectedFiles.length === 0) || !apiKey}
            className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-black font-black transition-all disabled:opacity-40 shrink-0"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </div>

      <style jsx global>{`
        .ai-markdown-body { line-height: 1.7; }
        .ai-markdown-body strong { color: #fb923c; font-weight: 700; }
        .ai-markdown-body em { color: rgba(255,255,255,0.7); font-style: italic; }
        .ai-markdown-body del { color: rgba(255,255,255,0.4); }
        .ai-h2 { font-size: 1.1rem; font-weight: 800; color: #fff; margin: 14px 0 6px; }
        .ai-h3 { font-size: 1rem; font-weight: 700; color: #fb923c; margin: 10px 0 4px; }
        .ai-h4 { font-size: 0.9rem; font-weight: 700; color: rgba(255,255,255,0.8); margin: 8px 0 4px; }
        .ai-hr { border: none; border-top: 1px solid rgba(255,255,255,0.08); margin: 14px 0; }
        .ai-link { color: #fb923c; text-decoration: underline; text-underline-offset: 2px; }
        .ai-link:hover { color: #f97316; }
        .ai-ul, .ai-ol { margin: 6px 0; padding-left: 20px; }
        .ai-li { list-style: disc; margin: 3px 0; color: rgba(255,255,255,0.8); }
        .ai-li-num { list-style: decimal; margin: 3px 0; color: rgba(255,255,255,0.8); }
        .ai-code-block {
          background: rgba(0,0,0,0.5);
          border: 1px solid rgba(249,115,22,0.15);
          border-radius: 10px;
          padding: 14px;
          margin: 10px 0;
          overflow-x: auto;
          font-size: 0.8rem;
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          color: #e2e8f0;
          white-space: pre;
        }
        .ai-code-block br { display: none; }
        .ai-inline-code {
          background: rgba(249,115,22,0.1);
          border: 1px solid rgba(249,115,22,0.2);
          border-radius: 5px;
          padding: 1px 6px;
          font-size: 0.8rem;
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          color: #fb923c;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(249,115,22,0.3); }
      `}</style>
    </div>
  );
}
