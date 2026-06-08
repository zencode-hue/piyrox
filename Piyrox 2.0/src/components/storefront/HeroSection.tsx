"use client";

import { motion } from "framer-motion";
import { Zap, Shield, Users, Sparkles } from "lucide-react";

export default function HeroSection() {
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
        <div className="w-[700px] h-[400px] rounded-full bg-white/[0.04] blur-[120px]" />
      </div>

      <div className="relative z-10 text-center px-4 w-full max-w-5xl mx-auto flex flex-col items-center pt-16">
        {/* Top tagline pill */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md"
        >
          <Sparkles size={12} className="text-white/80" />
          <span className="text-[11px] font-medium tracking-wider uppercase text-white/70">
            Premium Digital Marketplace
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-[3.2rem] sm:text-[4.5rem] lg:text-[6rem] font-extrabold tracking-tight mb-5 leading-[1.05] text-white"
          style={{ textShadow: "0 0 40px rgba(255,255,255,0.15)" }}
        >
          Start Winning With
          <br />
          <span
            className="inline-block mt-2 text-white"
            style={{
              textShadow:
                "0 0 30px rgba(255,255,255,0.6), 0 0 60px rgba(255,255,255,0.3), 0 0 100px rgba(255,255,255,0.15)",
            }}
          >
            PIYROX
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-white/60 text-base sm:text-lg mb-10 max-w-[560px] mx-auto leading-relaxed"
        >
          Providing high-quality enhancement tools to elevate your experience,
          at competitive prices.
        </motion.p>

        {/* Feature Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex flex-wrap justify-center gap-3"
        >
          {[
            { icon: Zap, label: "Instant Delivery" },
            { icon: Shield, label: "Secure & Undetected" },
            { icon: Users, label: "1000+ Customers" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-white/[0.04] border border-white/10 text-white/80 hover:bg-white/[0.08] hover:border-white/20 transition-all cursor-default backdrop-blur-md"
            >
              <Icon size={13} className="text-white/90" />
              {label}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
