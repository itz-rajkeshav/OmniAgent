"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { signIn } from "next-auth/react";

export default function CTASection() {
  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

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

      {/* Concentric Circles Design */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-[800px] h-[800px] pointer-events-none opacity-40 z-0 hidden md:block">
        <motion.svg
          viewBox="0 0 100 100"
          className="w-full h-full text-brand-accent-emerald"
          animate={{ rotate: 360 }}
          transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
        >
          {[...Array(15)].map((_, i) => (
            <circle
              key={i}
              cx="50"
              cy="50"
              r={15 + i * 2.5}
              fill="none"
              stroke="currentColor"
              strokeWidth="0.2"
              strokeDasharray={i % 3 === 0 ? "1 2" : (i % 2 === 0 ? "2 4" : "none")}
            />
          ))}
        </motion.svg>
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
              Ready to Let AI Handle <span className="text-brand-accent-blue">Your Chats?</span>
            </h2>
            <p className="text-zinc-600 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-inter">
              OmniAgent is live. Connect your WhatsApp or Telegram account and let your AI run your conversations — your tone, your rules.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleGoogleSignIn}
                className="px-8 py-4 rounded-full bg-brand-accent-blue hover:bg-brand-accent-blue/90 text-white font-semibold text-base flex items-center gap-2 transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
              >
                Get Started <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href="#how-it-works"
                className="px-8 py-4 rounded-full border border-zinc-200 text-zinc-700 hover:text-brand-accent-blue hover:border-brand-accent-blue/30 font-medium text-base flex items-center gap-2 transition-all bg-white hover:bg-zinc-50"
              >
                See How It Works
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
