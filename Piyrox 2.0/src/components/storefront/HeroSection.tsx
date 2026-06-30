"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Bot } from "lucide-react";
import { useState } from "react";

export default function HeroSection() {
  const [prompt, setPrompt] = useState("");

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!prompt.trim()) return;
    window.dispatchEvent(new CustomEvent("open-ai-chat", { detail: prompt }));
  };

  const handleQuickPrompt = (text: string) => {
    window.dispatchEvent(new CustomEvent("open-ai-chat", { detail: text }));
  };

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-black">
      {/* Background Graphics - Left & Right with fade to center */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Left hardware graphic */}
        <div
          className="absolute left-0 top-0 w-1/2 h-full opacity-[0.18]"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&q=80&w=1200')",
            backgroundSize: "cover",
            backgroundPosition: "left center",
            filter: "grayscale(100%) brightness(0.5) contrast(1.1)",
            maskImage:
              "linear-gradient(to right, black 0%, black 25%, transparent 70%)",
            WebkitMaskImage:
              "linear-gradient(to right, black 0%, black 25%, transparent 70%)",
          }}
        />
        {/* Right gaming graphic */}
        <div
          className="absolute right-0 top-0 w-1/2 h-full opacity-[0.18]"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200')",
            backgroundSize: "cover",
            backgroundPosition: "right center",
            filter: "grayscale(100%) brightness(0.5) contrast(1.1)",
            maskImage:
              "linear-gradient(to left, black 0%, black 25%, transparent 70%)",
            WebkitMaskImage:
              "linear-gradient(to left, black 0%, black 25%, transparent 70%)",
          }}
        />
        {/* Center vignette to pure black */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black" />
      </div>

      {/* Subtle radial glow behind headline */}
      <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
        <div className="w-[700px] h-[400px] rounded-full bg-orange-500/[0.08] blur-[120px]" />
      </div>

      <div className="relative z-10 text-center px-4 w-full max-w-4xl mx-auto flex flex-col items-center pt-16">
        {/* Top tagline pill */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md"
        >
          <Sparkles size={12} className="text-orange-400" />
          <span className="text-[11px] font-medium tracking-wider uppercase text-white/70">
            Meet Your Personal Shopper
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-[2.8rem] sm:text-[3.8rem] lg:text-[4.5rem] font-extrabold tracking-tight mb-5 leading-[1.1] text-white"
          style={{ textShadow: "0 0 40px rgba(255,255,255,0.15)" }}
        >
          What are you looking for today?
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-white/60 text-base sm:text-lg mb-10 max-w-[560px] mx-auto leading-relaxed"
        >
          Tell PiyRox AI what you need—from cheap Netflix subscriptions to gaming keys—and we'll find the best deal for you instantly.
        </motion.p>

        {/* AI Prompt Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="w-full max-w-2xl relative mb-8 group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/30 to-purple-500/30 rounded-2xl blur-lg opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
          <form onSubmit={handleSearch} className="relative bg-zinc-950/80 backdrop-blur-xl border border-white/10 rounded-2xl p-2 flex items-center shadow-2xl">
            <div className="pl-4 text-orange-400 flex-shrink-0">
              <Bot size={24} />
            </div>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. 'I need a 1-year Spotify Premium account'"
              className="w-full bg-transparent border-none text-white px-4 py-4 focus:outline-none focus:ring-0 placeholder:text-zinc-500 text-base sm:text-lg"
            />
            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-black px-4 sm:px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 flex-shrink-0"
            >
              Ask AI <ArrowRight size={18} />
            </button>
          </form>
        </motion.div>

        {/* Quick Prompts */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex flex-wrap justify-center gap-3"
        >
          {[
            "📺 Find cheap Netflix accounts",
            "✨ Recommend an AI writing tool",
            "🎮 Show me gaming deals",
            "🎵 I need Spotify Premium"
          ].map((label) => (
            <button
              key={label}
              onClick={() => handleQuickPrompt(label)}
              className="px-4 py-2 rounded-full text-xs font-medium bg-white/[0.04] border border-white/10 text-white/70 hover:bg-white/[0.08] hover:border-white/20 hover:text-white transition-all backdrop-blur-md"
            >
              {label}
            </button>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
