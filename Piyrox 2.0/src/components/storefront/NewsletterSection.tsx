"use client";

import { useState } from "react";
import { CheckCircle } from "lucide-react";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setDone(true);
  }

  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div
        className="rounded-2xl p-8 sm:p-10 text-center"
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <h2 className="text-2xl font-bold text-white mb-2">Stay Updated</h2>
        <p className="text-zinc-400 text-sm mb-6">
          Get notified about new products, deals, and updates.
        </p>

        {done ? (
          <div className="flex items-center justify-center gap-2 text-white">
            <CheckCircle size={20} />
            <span className="font-medium">You&apos;re subscribed!</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="flex-1 text-sm py-2.5 px-4 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-zinc-500 outline-none focus:border-white/20 transition-colors"
            />
            <button
              type="submit"
              className="bg-white text-black text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-zinc-200 transition-colors shrink-0"
            >
              Subscribe
            </button>
          </form>
        )}

        <p className="text-xs text-zinc-600 mt-3">
          No spam. Unsubscribe anytime.
        </p>
      </div>
    </section>
  );
}
