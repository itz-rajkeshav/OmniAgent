"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function CTASection() {
  return (
    <section className="py-32 relative overflow-hidden bg-white">
      {/* Background Glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="w-[600px] h-[600px] bg-brand-accent-blue/10 blur-[150px] rounded-full mix-blend-multiply"
        />
      </div>

      <div className="container mx-auto px-4 relative z-10 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto bg-white border border-zinc-200 rounded-[2rem] md:rounded-[3rem] p-6 md:p-20 shadow-[0_0_100px_rgba(2,132,199,0.1)] relative"
        >
          {/* Subtle noise overlay */}
          <div className="absolute inset-0 rounded-[3rem] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-multiply"></div>

          <div className="relative z-10">
            <h2 className="font-outfit text-3xl md:text-6xl font-bold mb-6 tracking-tight text-zinc-900">
              Ready to Put Your Chats on <span className="text-brand-accent-blue">Autopilot?</span>
            </h2>
            <p className="text-zinc-600 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-inter">
              Join the early access list. Be the first to let AI handle your messages — your way.
            </p>

            <form className="max-w-md mx-auto relative flex items-center" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Enter your email address" 
                className="w-full bg-zinc-50 border border-zinc-200 rounded-full py-3 md:py-4 pl-4 md:pl-6 pr-28 md:pr-36 focus:outline-none focus:border-brand-accent-blue transition-colors text-sm md:text-base text-zinc-900 font-inter placeholder:text-zinc-400"
                required
              />
              <button 
                type="submit"
                className="absolute right-1.5 md:right-2 top-1.5 md:top-2 bottom-1.5 md:bottom-2 bg-brand-accent-blue hover:bg-brand-accent-blue/90 text-white font-semibold rounded-full px-4 md:px-6 text-sm flex items-center gap-1.5 md:gap-2 transition-all hover:scale-105 active:scale-95 shadow-sm"
              >
                Join Waitlist
              </button>
            </form>
            <p className="text-xs text-zinc-500 mt-4 font-inter">No spam. Unsubscribe at any time.</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
