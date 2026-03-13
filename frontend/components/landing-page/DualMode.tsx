"use client";

import { motion } from "framer-motion";
import { Briefcase, Zap } from "lucide-react";

export default function DualMode() {
  return (
    <section
      id="features"
      className="py-24 relative overflow-hidden bg-white"
    >
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="font-outfit text-4xl md:text-5xl font-bold mb-4"
          >
            Two Modes. One Agent.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-zinc-600 text-lg md:text-xl max-w-2xl mx-auto"
          >
            Switch between Casual and Professional mode in one tap. Casual is
            for laid-back everyday chats. Professional is for business — with
            deeper context memory and formal replies.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Casual Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, type: "spring" }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-brand-accent-blue/5 blur-3xl rounded-full group-hover:bg-brand-accent-blue/10 transition-all duration-500"></div>
            <div className="relative glass-card rounded-3xl p-8 border-zinc-200 hover:border-brand-accent-blue/30 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-brand-accent-blue/10 flex items-center justify-center mb-6">
                <Zap className="w-7 h-7 text-brand-accent-blue" />
              </div>
              <h3 className="text-2xl font-bold font-outfit mb-3 text-zinc-900">
                Casual Mode
              </h3>
              <p className="text-zinc-600 mb-8 font-inter">
                Stores only the latest message for quick, lightweight replies.
                Perfect for friends and family.
              </p>

              <div className="bg-brand-accent-blue/5 rounded-2xl p-5 border border-brand-accent-blue/10 shadow-inner">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-brand-accent-blue text-white flex-shrink-0 flex items-center justify-center text-xs font-bold">
                    You
                  </div>
                  <div className="bg-white border border-zinc-100 shadow-sm rounded-2xl rounded-tl-none p-4 text-zinc-800 text-sm">
                    &quot;Hey! Sure, I&apos;ll check 🙌&quot;
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Professional Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.2, type: "spring" }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-brand-accent-emerald/5 blur-3xl rounded-full group-hover:bg-brand-accent-emerald/10 transition-all duration-500"></div>
            <div className="relative glass-card rounded-3xl p-8 border-zinc-200 hover:border-brand-accent-emerald/30 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-brand-accent-emerald/10 flex items-center justify-center mb-6">
                <Briefcase className="w-7 h-7 text-brand-accent-emerald" />
              </div>
              <h3 className="text-2xl font-bold font-outfit mb-3 text-zinc-900">
                Professional Mode
              </h3>
              <p className="text-zinc-600 mb-8 font-inter">
                Retains up to 10 messages for rich, context-aware responses.
                Perfect for business and support.
              </p>

              <div className="bg-brand-accent-emerald/5 rounded-2xl p-5 border border-brand-accent-emerald/10 shadow-inner">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-brand-accent-emerald text-white flex-shrink-0 flex items-center justify-center text-xs font-bold">
                    You
                  </div>
                  <div className="bg-white border border-zinc-100 shadow-sm rounded-2xl rounded-tl-none p-4 text-zinc-800 text-sm">
                    "Thank you for reaching out. I'll have the user follow up
                    with details shortly."
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
