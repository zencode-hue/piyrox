"use client";

import { useState } from "react";
import { Mail } from "lucide-react";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
    setEmail("");
  }

  return (
    <section className="border-t border-white/5" style={{ backgroundColor: "#09090b" }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-6"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <Mail size={24} className="text-white" />
        </div>

        <h2 className="text-3xl font-bold text-white mb-3">Stay Updated</h2>
        <p className="text-zinc-500 text-sm mb-8 max-w-md mx-auto">
          Get notified about new products, exclusive deals, and important updates. No spam — unsubscribe anytime.
        </p>

        {submitted ? (
          <div
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-white"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            ✓ You&apos;re subscribed! Check your inbox.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="flex-1 px-4 py-3 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none transition-all"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-xl text-sm font-bold bg-white text-black hover:bg-zinc-200 transition-colors shrink-0"
            >
              Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
