"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const casualTones = [
  {
    tone: "Friendly",
    icon: "🤝",
    desc: "Warm, approachable, and easygoing",
    sample: "Hey! Sure, I'll let them know 😊",
  },
  {
    tone: "Witty",
    icon: "😏",
    desc: "Playful humour, always respectful",
    sample: "Oh nice, you actually remembered 😂",
  },
  {
    tone: "Empathetic",
    icon: "💛",
    desc: "Calm, caring, emotionally aware",
    sample: "That sounds rough — take your time, okay?",
  },
  {
    tone: "Brief",
    icon: "⚡",
    desc: "Short, direct, no fluff",
    sample: "Got it. Will check.",
  },
];

const proTones = [
  {
    tone: "Formal",
    icon: "🎩",
    desc: "Polished business English",
    sample: "Thank you for your inquiry. The team will respond shortly.",
  },
  {
    tone: "Consultative",
    icon: "🧠",
    desc: "Advisory, structured reasoning",
    sample: "There are two options to consider here…",
  },
  {
    tone: "Supportive",
    icon: "🤲",
    desc: "Warm yet professional",
    sample: "Absolutely — happy to help with that.",
  },
  {
    tone: "Concise",
    icon: "📌",
    desc: "Tight, bullet-point style",
    sample: "• Confirmed. • ETA: Monday.",
  },
];

export default function Tones() {
  const [activeTone, setActiveTone] = useState(casualTones[0]);

  return (
    <section className="py-24 relative bg-zinc-50 overflow-hidden">
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="font-outfit text-4xl md:text-5xl font-bold mb-4 text-zinc-900"
          >
            8 Tones. Your Personality.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.1 }}
            className="text-zinc-600 text-lg md:text-xl"
          >
            Every reply matches <span className="italic font-medium text-zinc-900">your</span>{" "}
            vibe. Pick from 8 carefully crafted AI tones — 4 for casual
            conversations, 4 for professional ones.
          </motion.p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 items-center lg:items-start max-w-5xl mx-auto">
          {/* Tone Selector */}
          <div className="flex-1 w-full space-y-8">
            <div>
              <h3 className="text-sm font-bold text-zinc-500 font-outfit uppercase tracking-widest mb-4 flex items-center gap-4">
                Casual <div className="h-px bg-zinc-200 flex-1"></div>
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {casualTones.map((t) => (
                  <button
                    key={t.tone}
                    onClick={() => setActiveTone(t)}
                    className={`p-3 rounded-xl border text-left transition-all duration-300 flex items-center gap-3 relative overflow-hidden ${
                      activeTone.tone === t.tone
                        ? "bg-white border-brand-accent-blue shadow-md shadow-brand-accent-blue/10"
                        : "bg-white border-zinc-200 hover:border-brand-accent-blue/50 hover:bg-zinc-50"
                    }`}
                  >
                    {activeTone.tone === t.tone && (
                      <motion.div
                        layoutId="active-indicator"
                        className="absolute inset-0 bg-brand-accent-blue/5 pointer-events-none"
                      />
                    )}
                    <span className="text-xl">{t.icon}</span>
                    <span className={`font-semibold ${activeTone.tone === t.tone ? "text-brand-accent-blue" : "text-zinc-700"}`}>
                      {t.tone}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-zinc-500 font-outfit uppercase tracking-widest mb-4 flex items-center gap-4">
                Professional <div className="h-px bg-zinc-200 flex-1"></div>
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {proTones.map((t) => (
                  <button
                    key={t.tone}
                    onClick={() => setActiveTone(t)}
                    className={`p-3 rounded-xl border text-left transition-all duration-300 flex items-center gap-3 relative overflow-hidden ${
                      activeTone.tone === t.tone
                        ? "bg-white border-brand-accent-blue shadow-md shadow-brand-accent-blue/10"
                        : "bg-white border-zinc-200 hover:border-brand-accent-blue/50 hover:bg-zinc-50"
                    }`}
                  >
                    {activeTone.tone === t.tone && (
                      <motion.div
                        layoutId="active-indicator"
                        className="absolute inset-0 bg-brand-accent-blue/5 pointer-events-none"
                      />
                    )}
                    <span className="text-xl">{t.icon}</span>
                    <span className={`font-semibold ${activeTone.tone === t.tone ? "text-brand-accent-blue" : "text-zinc-700"}`}>
                      {t.tone}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tone Preview */}
          <div className="flex-1 w-full bg-white rounded-3xl border border-zinc-200 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent-blue/5 blur-[100px] rounded-full pointer-events-none" />
            
            <div className="bg-zinc-50 border-b border-zinc-100 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Preview</div>
            </div>

            <div className="p-8 md:p-12 min-h-[350px] flex flex-col justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTone.tone}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-brand-accent-blue/10 flex items-center justify-center text-3xl shadow-sm border border-brand-accent-blue/20">
                      {activeTone.icon}
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold text-zinc-900 font-outfit">{activeTone.tone}</h4>
                      <p className="text-zinc-500">{activeTone.desc}</p>
                    </div>
                  </div>

                  <div className="mt-8 border-l-2 border-brand-accent-blue/30 pl-6 relative">
                    <motion.div 
                      key={`dot-${activeTone.tone}`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring" }}
                      className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-brand-accent-blue"
                    />
                    
                    <div className="text-xs text-brand-accent-blue uppercase tracking-wider mb-2 font-bold">OmniAgent Response</div>
                    <div className="bg-zinc-50 rounded-2xl rounded-tl-none p-5 border border-zinc-200 shadow-sm inline-block max-w-[95%] relative">
                      <p className="text-zinc-800 text-lg sm:text-xl leading-relaxed font-medium">"{activeTone.sample}"</p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
