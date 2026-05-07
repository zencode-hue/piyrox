"use client";

import { useState } from "react";
import { MessageSquare, Send, Loader2, CheckCircle, Settings } from "lucide-react";

export default function DealsDiscordPush({ initialWebhook }: { initialWebhook: string }) {
  const [pushing, setPushing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [webhook, setWebhook] = useState(initialWebhook);
  const [showWebhook, setShowWebhook] = useState(false);
  const [saving, setSaving] = useState(false);

  async function saveWebhook() {
    setSaving(true);
    await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ discord_deals_webhook_url: webhook }),
    });
    setSaving(false);
    setShowWebhook(false);
    setResult("Webhook URL saved!");
    setTimeout(() => setResult(null), 3000);
  }

  async function pushDeals() {
    setPushing(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/discord-push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "deals" }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(`Pushed ${data.data?.dealsNotified ?? 0} deals to Discord!`);
      } else {
        setResult(`Error: ${data.error ?? "Failed to push"}`);
      }
    } catch {
      setResult("Network error. Try again.");
    } finally {
      setPushing(false);
    }
  }

  return (
    <div className="glass-card p-5" style={{ borderColor: "rgba(245,158,11,0.15)" }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <MessageSquare size={14} style={{ color: "#f59e0b" }} /> Discord Deal Notifications
        </h2>
        <button onClick={() => setShowWebhook(!showWebhook)}
          className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-all"
          style={{ color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <Settings size={11} /> Configure
        </button>
      </div>

      {showWebhook && (
        <div className="mb-4 space-y-2">
          <label className="block text-xs text-gray-500">Discord Webhook URL</label>
          <div className="flex gap-2">
            <input
              type="url"
              value={webhook}
              onChange={(e) => setWebhook(e.target.value)}
              placeholder="https://discord.com/api/webhooks/..."
              className="input-field text-sm py-2 flex-1"
            />
            <button onClick={saveWebhook} disabled={saving}
              className="px-3 py-2 rounded-xl text-sm font-semibold text-black disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}>
              {saving ? <Loader2 size={14} className="animate-spin" /> : "Save"}
            </button>
          </div>
          <p className="text-xs text-gray-600">
            Create a webhook in your Discord server: Server Settings → Integrations → Webhooks → New Webhook
          </p>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button onClick={pushDeals} disabled={pushing || !webhook}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-black disabled:opacity-50 transition-all hover:-translate-y-0.5"
          style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", boxShadow: "0 4px 16px rgba(245,158,11,0.3)" }}>
          {pushing ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
          Push Today&apos;s Deals to Discord
        </button>
        {!webhook && <p className="text-xs text-gray-500">Configure webhook URL first</p>}
      </div>

      {result && (
        <div className="mt-3 flex items-center gap-2 text-sm"
          style={{ color: result.startsWith("Error") ? "#f87171" : "#4ade80" }}>
          <CheckCircle size={13} />
          {result}
        </div>
      )}
    </div>
  );
}
