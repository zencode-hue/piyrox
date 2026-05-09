"use client";

import { useState } from "react";
import { 
  Zap, Twitter, Facebook, Instagram, MessageSquare, 
  Linkedin, Send, Hash, Type, Image as ImageIcon,
  Check, Loader2, Globe, Info
} from "lucide-react";

const PLATFORMS = [
  { id: "twitter", name: "X / Twitter", icon: Twitter, color: "text-[#1DA1F2]" },
  { id: "instagram", name: "Instagram", icon: Instagram, color: "text-[#E4405F]" },
  { id: "facebook", name: "Facebook", icon: Facebook, color: "text-[#1877F2]" },
  { id: "discord", name: "Discord", icon: MessageSquare, color: "text-[#5865F2]" },
  { id: "linkedin", name: "LinkedIn", icon: Linkedin, color: "text-[#0A66C2]" },
  { id: "telegram", name: "Telegram", icon: Globe, color: "text-[#26A5E4]" },
];

const TONES = [
  "High-Energy", "Professional", "Sarcastic", "FOMO / Urgent", "Educational", "Playful"
];

const LENGTHS = ["Short", "Medium", "Long"];

export default function BlastConfigurator({ onBlast }: { onBlast: (config: any) => Promise<void> }) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["twitter", "discord", "instagram"]);
  const [tone, setTone] = useState(TONES[0]);
  const [length, setLength] = useState(LENGTHS[1]);
  const [includeImage, setIncludeImage] = useState(true);
  const [automationEnabled, setAutomationEnabled] = useState(false);
  const [frequency, setFrequency] = useState("Daily");
  const [loading, setLoading] = useState(false);

  const togglePlatform = (id: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleBlast = async () => {
    setLoading(true);
    try {
      await onBlast({ platforms: selectedPlatforms, tone, length, includeImage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-6 space-y-6 sticky top-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
            <Zap size={18} className="text-orange-500" />
          </div>
          <h2 className="text-lg font-bold text-white">Blast Engine</h2>
        </div>
        <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${automationEnabled ? "bg-green-500/10 text-green-500" : "bg-white/5 text-gray-500"}`}>
          {automationEnabled ? "AUTO-PILOT ON" : "MANUAL MODE"}
        </div>
      </div>

      {/* Target Platforms */}
      <div className="space-y-3">
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center justify-between">
          <span>Target Channels</span>
          <span className="text-orange-500/60 lowercase font-normal italic">{selectedPlatforms.length} selected</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {PLATFORMS.map((p) => (
            <button
              key={p.id}
              onClick={() => togglePlatform(p.id)}
              className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all ${
                selectedPlatforms.includes(p.id) 
                  ? "bg-white/10 border-white/20 text-white" 
                  : "bg-transparent border-white/5 text-gray-500 hover:border-white/10"
              }`}
            >
              <p.icon size={14} className={selectedPlatforms.includes(p.id) ? p.color : "text-gray-600"} />
              <span className="text-xs font-medium">{p.name}</span>
              {selectedPlatforms.includes(p.id) && <Check size={10} className="ml-auto text-green-500" />}
            </button>
          ))}
        </div>
      </div>

      {/* Content Controls */}
      <div className="space-y-4 pt-2">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
              <Type size={10} /> Brand Tone
            </label>
            <select 
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-orange-500/50 transition-all appearance-none"
            >
              {TONES.map(t => <option key={t} value={t} className="bg-black">{t}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
              <Hash size={10} /> Length
            </label>
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
              {LENGTHS.map(l => (
                <button
                  key={l}
                  onClick={() => setLength(l)}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                    length === l ? "bg-white/10 text-white shadow-sm" : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2">
            <ImageIcon size={14} className="text-purple-400" />
            <span className="text-xs text-white font-medium">AI Visual Generation</span>
          </div>
          <button 
            onClick={() => setIncludeImage(!includeImage)}
            className={`w-10 h-5 rounded-full transition-all relative ${includeImage ? "bg-orange-500" : "bg-white/10"}`}
          >
            <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${includeImage ? "right-1" : "left-1"}`} />
          </button>
        </div>
      </div>

      {/* Automation & Scheduling */}
      <div className="space-y-4 pt-4 border-t border-white/5">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
            <Globe size={10} /> Automation & Schedule
          </label>
          <button 
            onClick={() => setAutomationEnabled(!automationEnabled)}
            className={`px-2 py-0.5 rounded text-[9px] font-black tracking-tighter transition-all ${
              automationEnabled ? "bg-orange-500 text-black" : "bg-white/5 text-gray-500"
            }`}
          >
            {automationEnabled ? "ENABLED" : "DISABLED"}
          </button>
        </div>

        {automationEnabled && (
          <div className="grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
            {["Every 6h", "Daily", "Weekly"].map((f) => (
              <button
                key={f}
                onClick={() => setFrequency(f)}
                className={`p-2.5 rounded-xl border text-[10px] font-bold transition-all ${
                  frequency === f 
                    ? "bg-orange-500/10 border-orange-500/30 text-orange-500" 
                    : "bg-transparent border-white/5 text-gray-600"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={handleBlast}
        disabled={loading || selectedPlatforms.length === 0}
        className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-500/20 active:scale-[0.98] mt-2"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            <span className="uppercase tracking-widest text-xs">Generating...</span>
          </>
        ) : (
          <>
            <Send size={18} />
            <span className="uppercase tracking-widest text-xs">Launch Multi-Blast</span>
          </>
        )}
      </button>

      <div className="p-3 rounded-xl bg-orange-500/5 border border-orange-500/10 flex items-start gap-2">
        <Info size={12} className="text-orange-500 shrink-0 mt-0.5" />
        <p className="text-[9px] text-orange-500/80 leading-relaxed italic">
          Manual blasts bypass schedules. Automation uses random high-performing products.
        </p>
      </div>
    </div>
  );
}
