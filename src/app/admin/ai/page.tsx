"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Bot, Send, Loader2, Trash2, Copy, Check, Settings, Zap, ChevronDown, Image as ImageIcon, Paperclip, X, FileVideo } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string | any[];
  ts: number;
  toolResult?: string | null;
  files?: string[]; // base64 or URLs
}

const AI_MODELS = [
  { id: "google/gemma-4-31b-it:free", name: "Gemma 4 (Unified)", tag: "FREE" },
];

const QUICK_PROMPTS = [
  { icon: "📝", text: "Write a product description for Netflix Premium" },
  { icon: "📧", text: "Draft a welcome email for new customers" },
  { icon: "🏷️", text: "Suggest 5 discount code names for a flash sale" },
  { icon: "📰", text: "Create and publish a blog post about our latest deals" },
  { icon: "📢", text: "Send a Discord announcement about today's deals" },
  { icon: "💡", text: "Suggest pricing strategy for AI tools category" },
];

// ── Lightweight markdown renderer ─────────────────────────────────────────
function renderMarkdown(text: string): string {
  let html = text
    // Code blocks
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="ai-code-block"><code>$2</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="ai-inline-code">$1</code>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    // Italic
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // Strikethrough
    .replace(/~~(.+?)~~/g, "<del>$1</del>")
    // Headers
    .replace(/^### (.+)$/gm, '<h4 class="ai-h4">$1</h4>')
    .replace(/^## (.+)$/gm, '<h3 class="ai-h3">$1</h3>')
    .replace(/^# (.+)$/gm, '<h2 class="ai-h2">$1</h2>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr class="ai-hr" />')
    // Unordered lists
    .replace(/^[•\-\*] (.+)$/gm, '<li class="ai-li">$1</li>')
    // Ordered lists
    .replace(/^\d+\. (.+)$/gm, '<li class="ai-li-num">$1</li>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="ai-link">$1</a>')
    // Line breaks
    .replace(/\n/g, "<br />");

  // Wrap consecutive <li> in <ul>
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
  const [model, setModel] = useState("google/gemma-4-31b-it:free");
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
            setModel("google/gemma-4-31b-it:free");
            await fetch("/api/admin/settings", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ai_model: "google/gemma-4-31b-it:free" })
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
    } catch (err) {
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
    if (!text && selectedFiles.length === 0 || loading) return;
    if (!apiKey) { setShowConfig(true); return; }

    const fileUrls = selectedFiles.map(f => f.base64);
    
    // Prepare message content (string or array for multimodal)
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

    const userMsg: Message = { 
      role: "user", 
      content: messageContent, 
      ts: Date.now(),
      files: fileUrls 
    };
    
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
          messages: newMessages.map((m) => ({ 
            role: m.role, 
            content: m.content 
          })),
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

  function copyMsg(content: string | any[], ts: number) {
    const text = typeof content === 'string' ? content : JSON.stringify(content);
    navigator.clipboard.writeText(text);
    setCopied(ts);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Bot size={22} style={{ color: "#f59e0b" }} /> Metra AI
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMessages([])}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all hover:bg-white/10"
            style={{ color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <Trash2 size={12} /> Clear
          </button>

          {/* Model quick-switch */}
          <div className="relative">
            <button
              onClick={() => setShowModelPicker(!showModelPicker)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all"
              style={{
                background: "rgba(245,158,11,0.1)",
                color: "#fbbf24",
                border: "1px solid rgba(245,158,11,0.2)",
              }}
            >
              <Zap size={11} /> {currentModel.name}
              <ChevronDown size={10} />
            </button>
            {showModelPicker && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowModelPicker(false)} />
                <div
                  className="absolute right-0 top-full mt-1 z-50 min-w-[200px] rounded-xl p-1.5 shadow-2xl"
                  style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  {AI_MODELS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => selectModel(m.id)}
                      className={`w-full text-left text-xs px-3 py-2 rounded-lg flex items-center justify-between gap-3 transition-all ${
                        model === m.id
                          ? "bg-amber-500/15 text-amber-400"
                          : "text-gray-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span>{m.name}</span>
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded-full"
                        style={{
                          background: m.tag === "FREE" ? "rgba(34,197,94,0.15)" : "rgba(245,158,11,0.15)",
                          color: m.tag === "FREE" ? "#4ade80" : "#fbbf24",
                        }}
                      >
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
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all"
            style={{
              background: apiKey ? "rgba(255,255,255,0.05)" : "rgba(239,68,68,0.1)",
              color: apiKey ? "rgba(255,255,255,0.5)" : "#f87171",
              border: `1px solid ${apiKey ? "rgba(255,255,255,0.08)" : "rgba(239,68,68,0.2)"}`,
            }}
          >
            <Settings size={12} /> {apiKey ? "API Key" : "Set API Key"}
          </button>
        </div>
      </div>

      {/* Config panel */}
      {showConfig && (
        <div className="glass-card p-4 mb-3 space-y-3 flex-shrink-0" style={{ borderColor: "rgba(245,158,11,0.2)" }}>
          <p className="text-xs text-gray-400">
            Get your free API key at{" "}
            <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">
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
              className="input-field text-sm py-2 flex-1"
            />
            <button
              onClick={saveConfig}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-black whitespace-nowrap"
              style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}
            >
              Save Key
            </button>
          </div>
          <p className="text-xs text-green-500/80">Stored securely in the database.</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          className="mb-3 p-3 rounded-xl text-sm text-red-400 flex-shrink-0"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
        >
          {error}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1 min-h-0">
        {messages.length === 0 && (
          <div className="text-center py-6">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.15)" }}
            >
              <Bot size={28} style={{ color: "#f59e0b", opacity: 0.6 }} />
            </div>
            <h2 className="text-lg font-semibold text-white mb-1">Metra AI</h2>
            <p className="text-gray-500 text-sm mb-6">
              I can write content, publish blog posts, push deals to Discord, send emails, and more.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-w-3xl mx-auto">
              {QUICK_PROMPTS.map((p) => (
                <button
                  key={p.text}
                  onClick={() => send(p.text)}
                  className="text-left text-xs px-3 py-2.5 rounded-xl transition-all hover:-translate-y-0.5 flex items-start gap-2"
                  style={{
                    background: "rgba(245,158,11,0.06)",
                    border: "1px solid rgba(245,158,11,0.12)",
                    color: "rgba(255,255,255,0.6)",
                  }}
                >
                  <span className="text-sm flex-shrink-0">{p.icon}</span>
                  <span>{p.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.ts} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`relative group ${msg.role === "user" ? "max-w-[75%]" : "max-w-[90%]"}`}>
              {msg.role === "assistant" && (
                <div className="flex items-center gap-1.5 mb-1">
                  <div
                    className="w-5 h-5 rounded-md flex items-center justify-center"
                    style={{ background: "rgba(245,158,11,0.15)" }}
                  >
                    <Bot size={11} style={{ color: "#f59e0b" }} />
                  </div>
                  <span className="text-[10px] text-gray-600">Metra</span>
                </div>
              )}
              <div
                className="rounded-2xl px-4 py-3 text-sm leading-relaxed"
                style={
                  msg.role === "user"
                    ? {
                        background: "rgba(245,158,11,0.15)",
                        border: "1px solid rgba(245,158,11,0.2)",
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
                  <div className="flex flex-wrap gap-2 mb-2">
                    {msg.files.map((f, i) => (
                      <img key={i} src={f} alt="upload" className="max-w-[200px] max-h-[200px] rounded-lg border border-white/10" />
                    ))}
                  </div>
                )}
                {msg.role === "user" ? (
                  <span className="whitespace-pre-wrap">
                    {typeof msg.content === 'string' 
                      ? msg.content 
                      : (msg.content as any[]).find(c => c.type === 'text')?.text || ""
                    }
                  </span>
                ) : (
                  <div
                    className="ai-markdown-body"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)) }}
                  />
                )}
              </div>
              <button
                onClick={() => copyMsg(msg.content, msg.ts)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg"
                style={{ background: "rgba(0,0,0,0.6)" }}
              >
                {copied === msg.ts ? (
                  <Check size={11} className="text-green-400" />
                ) : (
                  <Copy size={11} className="text-gray-400" />
                )}
              </button>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2">
              <div
                className="w-5 h-5 rounded-md flex items-center justify-center"
                style={{ background: "rgba(245,158,11,0.15)" }}
              >
                <Bot size={11} style={{ color: "#f59e0b" }} />
              </div>
              <div
                className="rounded-2xl px-4 py-3 flex items-center gap-2"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <span className="text-xs text-gray-500 ml-1">Metra AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="space-y-2 flex-shrink-0">
        {selectedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 p-2 rounded-xl bg-white/5 border border-white/10">
            {selectedFiles.map((f, i) => (
              <div key={i} className="relative group">
                {f.type.startsWith("image/") ? (
                  <img src={f.base64} alt="preview" className="w-16 h-16 rounded-lg object-cover border border-white/10" />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                    <FileVideo size={20} className="text-gray-500" />
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
        <div className="flex gap-2">
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
            className="p-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all flex-shrink-0"
            disabled={loading || !apiKey}
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
            placeholder={apiKey ? "Ask Metra AI anything... (Enter to send)" : "Set your API key first →"}
            rows={1}
            className="input-field flex-1 text-sm resize-none"
            style={{ minHeight: "48px", maxHeight: "120px" }}
            disabled={!apiKey}
          />
          <button
            onClick={() => send()}
            disabled={loading || (!input.trim() && selectedFiles.length === 0) || !apiKey}
            className="px-4 rounded-xl font-semibold text-black disabled:opacity-40 transition-all hover:-translate-y-0.5 flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", minWidth: "48px" }}
          >
            {loading ? <Loader2 size={16} className="animate-spin mx-auto" /> : <Send size={16} className="mx-auto" />}
          </button>
        </div>
      </div>

      {/* Markdown styles */}
      <style jsx global>{`
        .ai-markdown-body { line-height: 1.7; }
        .ai-markdown-body strong { color: #fbbf24; font-weight: 600; }
        .ai-markdown-body em { color: rgba(255,255,255,0.7); font-style: italic; }
        .ai-markdown-body del { color: rgba(255,255,255,0.4); }
        .ai-h2 { font-size: 1.1rem; font-weight: 700; color: #fff; margin: 12px 0 6px; }
        .ai-h3 { font-size: 1rem; font-weight: 600; color: #fbbf24; margin: 10px 0 4px; }
        .ai-h4 { font-size: 0.9rem; font-weight: 600; color: rgba(255,255,255,0.8); margin: 8px 0 4px; }
        .ai-hr { border: none; border-top: 1px solid rgba(255,255,255,0.08); margin: 12px 0; }
        .ai-link { color: #f59e0b; text-decoration: underline; text-underline-offset: 2px; }
        .ai-link:hover { color: #fbbf24; }
        .ai-ul, .ai-ol { margin: 6px 0; padding-left: 18px; }
        .ai-li { list-style: disc; margin: 2px 0; color: rgba(255,255,255,0.8); }
        .ai-li-num { list-style: decimal; margin: 2px 0; color: rgba(255,255,255,0.8); }
        .ai-code-block {
          background: rgba(0,0,0,0.4);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          padding: 12px;
          margin: 8px 0;
          overflow-x: auto;
          font-size: 0.8rem;
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          color: #e2e8f0;
          white-space: pre;
        }
        .ai-code-block br { display: none; }
        .ai-inline-code {
          background: rgba(245,158,11,0.1);
          border: 1px solid rgba(245,158,11,0.15);
          border-radius: 4px;
          padding: 1px 5px;
          font-size: 0.8rem;
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          color: #fbbf24;
        }
      `}</style>
    </div>
  );
}
