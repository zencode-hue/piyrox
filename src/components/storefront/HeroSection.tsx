"use client";

import { motion } from "framer-motion";
import { Zap, Shield, Users } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#09090b]">
      {/* Background Images / Gradients */}
      <div className="absolute inset-0 z-0 flex justify-between opacity-30 pointer-events-none mix-blend-luminosity">
        {/* Placeholder for the left hardware image */}
        <div className="w-1/2 h-full bg-[url('https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&q=80&w=1000')] bg-cover bg-left opacity-30" />
        {/* Placeholder for the right character image */}
        <div className="w-1/2 h-full bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1000')] bg-cover bg-right opacity-30" />
      </div>
      
      {/* Dark overlay gradients for blending */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#09090b]/40 via-[#09090b]/60 to-[#09090b] z-0 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#09090b] via-transparent to-[#09090b] z-0 pointer-events-none" />

      <div className="relative z-10 text-center px-4 w-full max-w-5xl mx-auto flex flex-col items-center pt-10">
        {/* Hat Logo Placeholder */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="mb-4 relative">
          <div className="w-32 h-32 relative flex items-center justify-center drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]">
             <svg width="120" height="120" viewBox="0 0 24 24" fill="black" stroke="rgba(255,255,255,0.8)" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-2xl">
               <path d="M12 3c-2.5 0-4.5 1.5-4.5 3.5v2h-3C3.5 8.5 2 9.5 2 11v1h20v-1c0-1.5-1.5-2.5-2.5-2.5h-3v-2C16.5 4.5 14.5 3 12 3z"/>
               <path d="M2 12c0 2 3 4 10 4s10-2 10-4"/>
             </svg>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}
          className="text-[3.5rem] sm:text-[4.5rem] lg:text-[5.5rem] font-bold tracking-tight mb-4 leading-[1.1] text-white">
          Start Winning With <br />
          <span className="text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.4)]">PIYROX</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}
          className="text-zinc-400 text-base sm:text-lg mb-10 max-w-[600px] mx-auto leading-relaxed">
          Providing high-quality enhancement tools to elevate your experience, <br className="hidden sm:block"/> at competitive prices.
        </motion.p>

        {/* Badges */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}
          className="flex flex-wrap justify-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10 transition-colors group cursor-default backdrop-blur-md">
            <Zap size={14} className="text-zinc-400 group-hover:text-white transition-colors" /> Instant Delivery
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10 transition-colors group cursor-default backdrop-blur-md">
            <Shield size={14} className="text-zinc-400 group-hover:text-white transition-colors" /> Secure & Undetected
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10 transition-colors group cursor-default backdrop-blur-md">
            <Users size={14} className="text-zinc-400 group-hover:text-white transition-colors" /> 1000+ Customers
          </div>
        </motion.div>
      </div>
    </section>
  );
}
