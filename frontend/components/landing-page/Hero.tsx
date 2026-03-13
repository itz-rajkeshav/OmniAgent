"use client";

import { motion } from "framer-motion";
import { ArrowRight, MessageSquare, ShieldCheck, Zap, Sparkles, MoreHorizontal, FileText, History } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Hero() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-24 pb-32 bg-[#F8FAFC]">
      {/* Background radial gradient */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_left,rgba(2,132,199,0.03)_0,transparent_100%)] pointer-events-none" />
      </div>

      <div className="container relative z-20 mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-xl mx-auto lg:mx-0 text-center lg:text-left pt-10 lg:pt-0"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center justify-center lg:justify-start gap-2 px-4 py-2 rounded-full border border-brand-accent-blue/20 bg-brand-accent-blue/5 text-brand-accent-blue text-sm font-medium mb-8"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent-blue opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-accent-blue/80"></span>
              </span>
              OmniAgent — AI for your Messages
            </motion.div>

            <h1 className="font-outfit text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-8 text-zinc-900 leading-[1.05]">
              Your AI. <br className="hidden sm:block" />
              <span className="text-brand-accent-blue">Your Voice.</span>
              <br />
              Every Chat.
            </h1>

            <p className="text-lg sm:text-xl text-zinc-600 mb-10 leading-relaxed font-inter max-w-lg mx-auto lg:mx-0">
              OmniAgent replies to your WhatsApp & Telegram messages using AI that
              sounds like{" "}
              <span className="text-zinc-900 italic font-medium">you</span> — with
              your knowledge, your tone, and your rules.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link href="/dashboard" className="w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative group w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-white overflow-hidden shadow-[0_0_20px_rgba(2,132,199,0.2)] hover:shadow-[0_0_30px_rgba(2,132,199,0.3)] transition-shadow bg-brand-accent-blue flex items-center justify-center gap-2"
                >
                  <span className="relative z-10">Get Early Access</span>
                  <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
              
              <Link href="#how-it-works" className="w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-medium text-zinc-700 bg-white hover:bg-zinc-50 border border-zinc-200 shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  See How It Works ↓
                </motion.button>
              </Link>
            </div>
          </motion.div>

          {/* Right Column: Isometric 3D Visualization */}
          <div className="relative h-[500px] sm:h-[650px] w-full mt-12 lg:mt-0 perspective-1000 hidden md:block">
            {/* The underlying Box Backdrop (Using Indigo/Blue Gradient to match Professional Mode) */}
            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 1, ease: "easeOut" }}
               className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[45%] w-[85%] h-[85%] max-w-[500px] max-h-[500px] bg-gradient-to-br from-indigo-500 to-indigo-800 rounded-3xl"
            />

            {/* Floating Elements Container with perspective */}
            <div 
              className="absolute inset-0 z-10 flex items-center justify-center transition-transform duration-200 ease-out"
              style={{
                transform: `perspective(1000px) rotateX(20deg) rotateY(-20deg) rotateZ(5deg) translateX(${mousePosition.x * -20}px) translateY(${mousePosition.y * -20}px)`,
                transformStyle: "preserve-3d",
              }}
            >
              
              {/* Top Mini Card - "Casual Mode" */}
              <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[10%] right-[3%] w-[380px] bg-white rounded-3xl p-5 shadow-[0_20px_40px_rgba(0,0,0,0.15)] flex items-center justify-between border-b-4 border-r-4 border-zinc-900/5"
                style={{ transform: "translateZ(80px)" }}
              >
                <div className="absolute inset-0 border-[3px] border-emerald-500/20 rounded-3xl pointer-events-none"></div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-brand-accent-emerald/10 text-brand-accent-emerald flex items-center justify-center shrink-0 border border-brand-accent-emerald/20 shadow-sm">
                    <Zap className="w-5 h-5 fill-current" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mb-1 flex items-center gap-1">
                      Casual Mode
                    </div>
                    <div className="text-lg font-medium text-zinc-800 italic">"Hey! Sure, I'll check 🙌"</div>
                  </div>
                </div>
                <div className="text-zinc-400">
                  <MoreHorizontal className="w-5 h-5" />
                </div>
                {/* 3D Depth element */}
                <div className="absolute inset-0 bg-emerald-900/5 rounded-3xl transform translate-y-3 -translate-x-3 -z-10 blur-sm"></div>
              </motion.div>

              {/* Connecting Line */}
              <div 
                className="absolute top-[30%] right-[30%] w-px h-[100px] bg-zinc-300"
                style={{ transform: "translateZ(30px) rotateZ(-15deg)" }}
              >
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full border border-zinc-400 bg-white shadow-sm"></div>
              </div>

              {/* Bottom Large Card - "Professional Mode" */}
              <motion.div
                animate={{ y: [10, -10, 10] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute top-[35%] right-[15%] w-[440px] bg-white rounded-[2rem] p-6 shadow-[0_30px_60px_rgba(0,0,0,0.2)] border-b-[8px] border-r-[8px] border-zinc-900/5 font-inter"
                style={{ transform: "translateZ(120px)" }}
              >
                <div className="flex flex-col gap-2 mb-4 border-b border-zinc-100 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-brand-accent-blue bg-brand-accent-blue/10 p-2 rounded-lg border border-brand-accent-blue/20">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div className="text-lg font-semibold text-zinc-800">Professional Mode</div>
                    </div>
                    <div className="text-zinc-400">
                      <MoreHorizontal className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="text-sm font-medium text-zinc-700 mt-2 pl-2 border-l-2 border-brand-accent-blue/30 italic">
                    "Thank you for reaching out. Let me verify the details for you."
                  </div>
                </div>

                <div className="space-y-2">
                  {/* Action Item 1: Tone */}
                  <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-zinc-50 transition-colors border-b border-zinc-50 last:border-0">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                      </div>
                      <span className="text-sm font-medium text-zinc-700">Formal Tone Profile</span>
                    </div>
                     <span className="text-xs font-semibold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full">Active</span>
                  </div>
                  {/* Action Item 2: Context */}
                  <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-zinc-50 transition-colors border-b border-zinc-50 last:border-0">
                     <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <History className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium text-zinc-700">10-Message History</span>
                    </div>
                    <span className="text-xs font-semibold text-zinc-400">Context Window</span>
                  </div>
                   {/* Action Item 3: KB */}
                   <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-zinc-50 transition-colors border-b border-zinc-50 last:border-0">
                     <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <FileText className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium text-zinc-700">Knowledge Base Search</span>
                    </div>
                     <span className="text-xs font-semibold text-zinc-400">Enabled</span>
                  </div>
                </div>
                 {/* 3D Depth element */}
                <div className="absolute inset-0 bg-blue-900/5 rounded-[2rem] transform translate-y-3 -translate-x-3 -z-10 blur-xl"></div>
              </motion.div>

            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
