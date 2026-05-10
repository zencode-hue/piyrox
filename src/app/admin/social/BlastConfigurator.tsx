"use client";

import { useState, useRef } from "react";
import { 
  Zap, Twitter, Facebook, Instagram, MessageSquare, 
  Linkedin, Send, Hash, Type, Image as ImageIcon,
  Check, Loader2, Globe, Info, Edit3, Sparkles,
  Upload, Trash2, Layout, Clock, Play, List
} from "lucide-react";

const PLATFORMS = [
  { id: "twitter", name: "X / Twitter", icon: Twitter, color: "text-[#1DA1F2]" },
  { id: "instagram", name: "Instagram", icon: Instagram, color: "text-[#E4405F]" },
  { id: "facebook", name: "Facebook", icon: Facebook, color: "text-[#1877F2]" },
  { id: "discord", name: "Discord", icon: MessageSquare, color: "text-[#5865F2]" },
  { id: "linkedin", name: "LinkedIn", icon: Linkedin, color: "text-[#0A66C2]" },
  { id: "telegram", name: "Telegram", icon: Globe, color: "text-[#26A5E4]" },
  { id: "pinterest", name: "Pinterest", icon: Layout, color: "text-[#E60023]" },
];

const TONES = [
  "High-Energy", "Professional", "Sarcastic", "FOMO / Urgent", "Educational", "Playful", "Minimalist", "Gen-Z"
];

const LENGTHS = ["Short", "Medium", "Long"];

export default function BlastConfigurator({ onBlast }: { onBlast: (config: any) => Promise<void> }) {
  const [mode, setMode] = useState<"auto" | "manual">("auto");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["twitter", "discord", "instagram"]);
  const [tone, setTone] = useState(TONES[0]);
  const [length, setLength] = useState(LENGTHS[1]);
  const [includeImage, setIncludeImage] = useState(true);
  
  // Manual Mode State
  const [manualContent, setManualContent] = useState<Record<string, string>>({});
  const [manualImage, setManualImage] = useState<string | null>(null);
  const [isWriting, setIsWriting] = useState<string | null>(null);
  
  // Auto Mode / Schedule State
  const [automationEnabled, setAutomationEnabled] = useState(false);
  const [frequency, setFrequency] = useState("Daily");
  const [sequence, setSequence] = useState<string[]>([]);
  const [scheduleTime, setScheduleTime] = useState("09:00");

  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const togglePlatform = (id: string) => {
    setSelectedPlatforms(prev => {
      const next = prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id];
      // Initialize manual content if adding
      if (!prev.includes(id) && !manualContent[id]) {
        setManualContent(curr => ({ ...curr, [id]: "" }));
      }
      return next;
    });
  };

  const handleManualImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setManualImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateAIContent = async (platform: string) => {
    setIsWriting(platform);
    try {
      const res = await fetch("/api/admin/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: `Write a high-converting ${platform} post for a digital product with tone ${tone} and length ${length}. Include {{TRACKING_LINK}}` }],
          context: "marketing"
        })
      });
      const data = await res.json();
      if (data.reply) {
        setManualContent(prev => ({ ...prev, [platform]: data.reply }));
      } else if (data.error) {
        setManualContent(prev => ({ ...prev, [platform]: `⚠️ AI Writer Error: ${data.error}` }));
      }
    } catch (e) {
      console.error(e);
      setManualContent(prev => ({ ...prev, [platform]: "⚠️ Connection error. Please try writing manually." }));
    } finally {
      setIsWriting(null);
    }
  };

  const handleBlast = async () => {
    setLoading(true);
    try {
      const config = {
        platforms: selectedPlatforms,
        tone,
        length,
        includeImage: mode === "auto" ? includeImage : false,
        manualContent: mode === "manual" ? manualContent : null,
        manualImage: mode === "manual" ? manualImage : null,
        automationSettings: automationEnabled ? { frequency, sequence, scheduleTime } : null
      };
      await onBlast(config);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-6 space-y-6 sticky top-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
            <Zap size={20} className="text-orange-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Blast Engine</h2>
            <p className="text-[10px] text-gray-500 font-medium">Configure multi-channel deployment</p>
          </div>
        </div>
        <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
          <button 
            onClick={() => setMode("auto")}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${mode === "auto" ? "bg-orange-500 text-black shadow-lg" : "text-gray-500"}`}
          >
            AUTO
          </button>
          <button 
            onClick={() => setMode("manual")}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${mode === "manual" ? "bg-orange-500 text-black shadow-lg" : "text-gray-500"}`}
          >
            MANUAL
          </button>
        </div>
      </div>

      {/* Target Platforms */}
      <div className="space-y-3">
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center justify-between">
          <span>Target Channels</span>
          <span className="text-orange-500/60 lowercase font-normal italic">{selectedPlatforms.length} active</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
              <span className="text-[11px] font-medium">{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      {mode === "auto" ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                <Type size={10} /> Brand Tone
              </label>
              <select 
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-orange-500/50"
              >
                {TONES.map(t => <option key={t} value={t} className="bg-zinc-900">{t}</option>)}
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

          {/* Scheduling */}
          <div className="space-y-4 pt-4 border-t border-white/5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                <Clock size={10} /> Auto-Pilot Schedule
              </label>
              <button 
                onClick={() => setAutomationEnabled(!automationEnabled)}
                className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all ${
                  automationEnabled ? "bg-green-500 text-black" : "bg-white/5 text-gray-500"
                }`}
              >
                {automationEnabled ? "ACTIVE" : "OFF"}
              </button>
            </div>

            {automationEnabled && (
              <div className="space-y-3 animate-in slide-in-from-top-2">
                <div className="grid grid-cols-3 gap-2">
                  {["Every 6h", "Daily", "Weekly"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFrequency(f)}
                      className={`p-2 rounded-xl border text-[10px] font-bold transition-all ${
                        frequency === f 
                          ? "bg-orange-500/10 border-orange-500/30 text-orange-500" 
                          : "bg-transparent border-white/5 text-gray-600"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 space-y-1.5">
                    <p className="text-[9px] font-bold text-gray-600 uppercase">Start Time</p>
                    <input 
                      type="time" 
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white outline-none"
                    />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <p className="text-[9px] font-bold text-gray-600 uppercase">Platform Sequence</p>
                    <button className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-[10px] text-gray-400 font-bold flex items-center justify-between">
                      <List size={10} /> Managed
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Manual Mode UI */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                <Edit3 size={10} /> Compose Content
              </label>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 text-[10px] font-bold text-orange-500 hover:text-orange-400 transition-colors"
              >
                <Upload size={12} /> {manualImage ? "Change Image" : "Upload Image"}
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleManualImageUpload} 
                className="hidden" 
                accept="image/*"
              />
            </div>

            {manualImage && (
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/10 group">
                <img src={manualImage} alt="Manual blast" className="w-full h-full object-cover" />
                <button 
                  onClick={() => setManualImage(null)}
                  className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
              {selectedPlatforms.map(platform => (
                <div key={platform} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight">{platform}</span>
                    <button 
                      onClick={() => generateAIContent(platform)}
                      disabled={isWriting === platform}
                      className="text-[9px] font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 disabled:opacity-50"
                    >
                      {isWriting === platform ? <Loader2 size={8} className="animate-spin" /> : <Sparkles size={8} />}
                      AI Writer
                    </button>
                  </div>
                  <textarea 
                    value={manualContent[platform] || ""}
                    onChange={(e) => setManualContent(prev => ({ ...prev, [platform]: e.target.value }))}
                    placeholder={`Write your ${platform} post here... use {{TRACKING_LINK}} for magic.`}
                    className="w-full h-24 bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-orange-500/50 resize-none scrollbar-hide"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleBlast}
        disabled={loading || selectedPlatforms.length === 0}
        className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-[0_10px_30px_rgba(234,88,12,0.3)] active:scale-[0.98]"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            <span className="uppercase tracking-widest text-xs">Processing...</span>
          </>
        ) : (
          <>
            <Play size={18} fill="currentColor" />
            <span className="uppercase tracking-widest text-xs">Launch Multi-Blast</span>
          </>
        )}
      </button>

      <div className="p-3 rounded-xl bg-orange-500/5 border border-orange-500/10 flex items-start gap-2">
        <Info size={12} className="text-orange-500 shrink-0 mt-0.5" />
        <p className="text-[9px] text-orange-500/80 leading-relaxed italic">
          Tip: Manual mode gives you total creative control. AI mode is faster for scale.
        </p>
      </div>
    </div>
  );
}
