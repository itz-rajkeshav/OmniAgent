"use client";

import { motion } from "framer-motion";
import { ArrowRight, MessageSquare, ShieldCheck, Zap } from "lucide-react";
import { useEffect, useState } from "react";

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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-32 bg-white">
      {/* Background (Static Minimal Noise or Nothing) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(2,132,199,0.05)_0,transparent_100%)] pointer-events-none" />
      </div>

      {/* Floating Elements (Mock Chat Cards) */}
      <div className="absolute inset-0 pointer-events-none z-10 hidden lg:block perspective-1000">
        <motion.div
          animate={{ y: [0, -10, 0], rotateX: [2, 4, 2], rotateY: [-5, -2, -5] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-[10%] glass-card p-4 rounded-2xl w-64 transform -rotate-6"
          style={{ transform: `translate(${mousePosition.x * 20}px, ${mousePosition.y * 20}px)` }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-brand-accent-blue/10 flex items-center justify-center border border-brand-accent-blue/20">
              <Zap className="w-4 h-4 text-brand-accent-blue" />
            </div>
            <div className="text-xs text-zinc-500">Casual Mode</div>
          </div>
          <div className="text-sm text-zinc-800">"Hey! Sure, I'll check 🙌"</div>
        </motion.div>

        <motion.div
          animate={{ y: [0, 10, 0], rotateX: [2, 0, 2], rotateY: [5, 8, 5] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-1/3 right-[10%] glass-card p-4 rounded-2xl w-72 transform rotate-3"
          style={{ transform: `translate(${mousePosition.x * -30}px, ${mousePosition.y * -30}px)` }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-brand-accent-emerald/10 flex items-center justify-center border border-brand-accent-emerald/20">
              <ShieldCheck className="w-4 h-4 text-brand-accent-emerald" />
            </div>
            <div className="text-xs text-zinc-500">Professional Mode</div>
          </div>
          <div className="text-sm text-zinc-800">"Thank you for reaching out. I'll follow up shortly."</div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="container relative z-20 mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl mx-auto"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-accent-blue/20 bg-brand-accent-blue/5 text-brand-accent-blue text-sm font-medium mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent-blue opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-accent-blue/80"></span>
            </span>
            OmniAgent Early Access Landing
          </motion.div>

          <h1 className="font-outfit text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 text-zinc-900">
            Your AI. <span className="text-brand-accent-blue">Your Voice.</span><br />
            Every Chat.
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-600 max-w-2xl mx-auto mb-10 leading-relaxed font-inter">
            OmniAgent replies to your WhatsApp & Telegram messages using AI that sounds like <span className="text-zinc-900 italic font-medium">you</span> — with your knowledge, your tone, and your rules.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative group px-8 py-4 rounded-xl font-semibold text-white overflow-hidden shadow-[0_0_20px_rgba(2,132,199,0.2)] hover:shadow-[0_0_30px_rgba(2,132,199,0.3)] transition-shadow w-full sm:w-auto flex items-center justify-center gap-2 bg-brand-accent-blue"
            >
              <span className="relative z-10">Get Early Access</span>
              <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-4 rounded-xl font-medium text-zinc-700 hover:text-brand-accent-blue bg-white hover:bg-zinc-50 border border-zinc-200 shadow-sm transition-all w-full sm:w-auto flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              See How It Works ↓
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
