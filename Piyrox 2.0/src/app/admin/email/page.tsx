"use client";

import { useState, useEffect } from "react";
import { Mail, Send, Loader2, Users, User, ShoppingCart, Eye, AlertTriangle, Sparkles } from "lucide-react";

type Audience = "all" | "customers" | "guests" | "custom" | "order";

const AUDIENCE_OPTIONS: { key: Audience; label: string; desc: string; icon: typeof Users; color: string }[] = [
  {
    key: "all",
    label: "Everyone",
    desc: "Registered users + guests + subscribers",
    icon: Users,
    color: "text-purple-400",
  },
  {
    key: "customers",
    label: "Registered Users",
    desc: "All non-banned registered accounts",
    icon: User,
    color: "text-blue-400",
  },
  {
    key: "guests",
    label: "Guests & Subscribers",
    desc: "Guest order emails + restock subscribers",
    icon: Mail,
    color: "text-green-400",
  },
  {
    key: "custom",
    label: "Single Email",
    desc: "Send to one specific email address",
    icon: User,
    color: "text-cyan-400",
  },
  {
    key: "order",
    label: "Order Reminder",
    desc: "Send to the customer of a specific order",
    icon: ShoppingCart,
    color: "text-yellow-400",
  },
];

export default function AdminEmailPage() {
  const [audience, setAudience] = useState<Audience>("all");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [customEmail, setCustomEmail] = useState("");
  const [orderId, setOrderId] = useState("");
  const [sending, setSending] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [result, setResult] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // Reset preview count when audience changes
  useEffect(() => {
    setPreviewCount(null);
    setConfirmed(false);
    setResult(null);
  }, [audience]);

  async function fetchPreview() {
    if (audience === "custom" || audience === "order") {
      setPreviewCount(1);
      return;
    }
    setPreviewing(true);
    try {
      const res = await fetch("/api/admin/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: audience,
          subject: subject || "preview",
          message: message || "preview",
          preview: true,
        }),
      });
      const data = await res.json();
      if (res.ok) setPreviewCount(data.count ?? 0);
    } catch { /* ignore */ }
    finally { setPreviewing(false); }
  }

  async function send() {
    if (!subject.trim() || !message.trim()) {
      setResult({ type: "error", text: "Subject and message are required" });
      return;
    }
    if (audience === "custom" && !customEmail.trim()) {
      setResult({ type: "error", text: "Recipient email is required" });
      return;
    }
    if (audience === "order" && !orderId.trim()) {
      setResult({ type: "error", text: "Order ID is required" });
      return;
    }

    setSending(true);
    setResult(null);
    try {
      const body: Record<string, string | boolean> = {
        to: audience,
        subject,
        message,
        type: audience === "order" ? "order_reminder" : "announcement",
      };
      if (audience === "custom") body.customEmail = customEmail;
      if (audience === "order") body.orderId = orderId;

      const res = await fetch("/api/admin/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setResult({ type: "error", text: data.error ?? "Failed to send" });
        return;
      }
      const sentCount = data.sent ?? 1;
      const failedCount = data.failed ?? 0;
      setResult({
        type: "success",
        text: `Sent to ${sentCount} recipient${sentCount !== 1 ? "s" : ""}${failedCount > 0 ? ` (${failedCount} failed)` : ""}`,
      });
      setSubject("");
      setMessage("");
      setCustomEmail("");
      setOrderId("");
      setPreviewCount(null);
      setConfirmed(false);
    } catch (e) {
      setResult({ type: "error", text: String(e) });
    } finally {
      setSending(false);
    }
  }

  async function generateEmail() {
    if (!subject.trim()) {
      setResult({ type: "error", text: "Please enter a subject first to guide the AI" });
      return;
    }
    setAiLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ 
            role: "user", 
            content: `Write a compelling marketing email with the subject "${subject}". 
            Target audience: ${AUDIENCE_OPTIONS.find(o => o.key === audience)?.label}. 
            The store is PIYROX, a premium digital marketplace. Keep it professional and persuasive.` 
          }]
        }),
      });
      const data = await res.json();
      if (data.reply) setMessage(data.reply);
    } catch (e) { console.error(e); }
    setAiLoading(false);
  }

  const isBulk = audience === "all" || audience === "customers" || audience === "guests";
  const canSend = isBulk ? confirmed : true;

  return (
    <div className="max-w-3xl pb-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <Mail size={24} className="text-orange-400" /> 
          Email Campaigns
        </h1>
        <p className="text-zinc-500 text-sm mt-0.5">Send targeted emails to your audience</p>
      </div>

      {/* Audience selector */}
      <div className="admin-card p-6 mb-6">
        <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-4">Select Audience</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {AUDIENCE_OPTIONS.map(({ key, label, desc, icon: Icon, color }) => (
            <button key={key} onClick={() => setAudience(key)}
              className="flex items-start gap-3 p-4 rounded-xl text-left transition-all border text-white"
              style={{
                background: audience === key ? "rgba(249,115,22,0.1)" : "rgba(255,255,255,0.03)",
                borderColor: audience === key ? "rgba(249,115,22,0.4)" : "rgba(255,255,255,0.05)",
              }}>
              <Icon size={18} className={`${audience === key ? 'text-orange-400' : color} shrink-0 mt-0.5`} />
              <div>
                <p className="text-sm font-bold">{label}</p>
                <p className="text-[10px] text-zinc-500 mt-1 leading-snug">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="admin-card p-6 space-y-6">
        {/* Audience-specific inputs */}
        {audience === "custom" && (
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Recipient Email</label>
            <input value={customEmail} onChange={(e) => setCustomEmail(e.target.value)}
              placeholder="customer@example.com" type="email" className="input-field w-full font-mono text-sm" />
          </div>
        )}

        {audience === "order" && (
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Order ID (full ID or MMT-XXXXXX)</label>
            <input value={orderId} onChange={(e) => setOrderId(e.target.value)}
              placeholder="Paste the full order ID..." className="input-field w-full font-mono text-sm" />
            <p className="text-[10px] text-zinc-500 mt-1.5 uppercase tracking-wider">Email will be sent to the customer who placed this order.</p>
          </div>
        )}

        {/* Subject */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Email Subject</label>
          <input value={subject} onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. New products just dropped at PIYROX!" className="input-field w-full font-bold text-lg" />
        </div>

        {/* Message */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Message Content</label>
            <button
              type="button"
              onClick={generateEmail}
              disabled={aiLoading || !subject.trim()}
              className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-lg text-orange-400 hover:bg-orange-500/20 hover:text-white transition-all disabled:opacity-50 group"
            >
              {aiLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} className="group-hover:text-white transition-colors" />}
              AI Write Content
            </button>
          </div>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your message here. Supports plain text with line breaks."
            rows={12} className="input-field w-full resize-none text-sm leading-relaxed" />
          <div className="flex justify-end mt-1.5">
            <span className="text-[10px] font-medium text-zinc-600 tabular-nums">{message.length}/5000 chars</span>
          </div>
        </div>

        {/* Bulk preview + confirmation */}
        {isBulk && (
          <div className="space-y-4 p-5 rounded-xl border border-white/5 bg-white/[0.02]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-white">Audience Verification</p>
                <p className="text-xs text-zinc-500 mt-0.5">Check how many users will receive this email before sending.</p>
              </div>
              <button onClick={fetchPreview} disabled={previewing}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all border border-white/10 bg-white/5 hover:bg-white/10 text-white disabled:opacity-50">
                {previewing ? <Loader2 size={16} className="animate-spin" /> : <Eye size={16} />}
                {previewing ? "Counting..." : "Preview Audience"}
              </button>
            </div>

            {previewCount !== null && (
              <div className="mt-4 pt-4 border-t border-white/5 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <Users size={16} />
                  </div>
                  <div>
                    <span className="text-lg font-black text-white tabular-nums">{previewCount.toLocaleString()}</span>
                    <span className="text-xs font-medium text-zinc-500 ml-2">Total Recipients Found</span>
                  </div>
                </div>

                {previewCount > 0 && (
                  <div className="p-4 rounded-xl border border-orange-500/20 bg-orange-500/5">
                    <div className="flex gap-3">
                      <AlertTriangle size={20} className="text-orange-400 shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-orange-400">Warning: Bulk Action</p>
                        <p className="text-xs text-orange-400/80 mt-1 mb-3">
                          You are about to send an email to {previewCount.toLocaleString()} people. This action cannot be undone.
                        </p>
                        <label className="flex items-center gap-3 cursor-pointer group w-fit">
                          <div className="relative flex items-center justify-center">
                            <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="peer sr-only" />
                            <div className="w-5 h-5 border-2 border-orange-500/50 rounded bg-transparent peer-checked:bg-orange-500 peer-checked:border-orange-500 transition-colors" />
                            <div className="absolute opacity-0 peer-checked:opacity-100 transition-opacity text-black">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-orange-400 group-hover:text-orange-300 transition-colors">I confirm I want to send this bulk email</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="p-4 rounded-xl text-sm font-bold flex items-center gap-3"
            style={{
              background: result.type === "success" ? "rgba(74,222,128,0.1)" : "rgba(248,113,113,0.1)",
              border: `1px solid ${result.type === "success" ? "rgba(74,222,128,0.2)" : "rgba(248,113,113,0.2)"}`,
              color: result.type === "success" ? "#4ade80" : "#f87171",
            }}>
            {result.type === "success" ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
            {result.text}
          </div>
        )}

        {/* Send button */}
        <div>
          <button onClick={send} disabled={sending || !canSend || (isBulk && previewCount === 0)}
            className="w-full bg-orange-500 hover:bg-orange-600 text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            {sending
              ? "Sending..."
              : isBulk && previewCount !== null
                ? `Send to ${previewCount.toLocaleString()} Recipients`
                : "Send Email"}
          </button>
          
          {isBulk && !confirmed && previewCount !== null && previewCount > 0 && (
            <p className="text-xs text-center font-bold text-red-400 mt-3">↑ Check the confirmation box above to enable sending.</p>
          )}
        </div>
      </div>
    </div>
  );
}
