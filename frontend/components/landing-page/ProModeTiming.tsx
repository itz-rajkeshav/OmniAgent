"use client";

import { motion } from "framer-motion";
import { Clock, History } from "lucide-react";

export default function ProModeTiming() {
  return (
    <section className="py-24 relative overflow-hidden bg-white">
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="font-outfit text-4xl md:text-5xl font-bold mb-4 text-zinc-900"
          >
            Deeper Context. <span className="text-brand-accent-blue">Smarter Replies.</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.1 }}
            className="text-zinc-600 text-lg md:text-xl max-w-2xl mx-auto"
          >
            In Professional mode, OmniAgent remembers the last 10 messages in every conversation — so replies are contextually accurate, not just reactive. Perfect for ongoing client threads.
          </motion.p>
        </div>

        <div className="max-w-4xl mx-auto bg-white border border-zinc-200 shadow-sm rounded-3xl p-6 md:p-10 relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent-blue/5 blur-[100px] rounded-full pointer-events-none"></div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Visualizer */}
            <div className="relative border-l-2 border-zinc-200 pl-6 py-4 space-y-4">
              <div className="absolute top-0 left-[-11px] bg-white text-brand-accent-blue p-1 rounded-full border border-brand-accent-blue/20">
                <History className="w-4 h-4" />
              </div>
              
              <div className="absolute bottom-0 left-[-11px] bg-white text-brand-accent-blue p-1 rounded-full border border-brand-accent-blue/20">
                <Clock className="w-4 h-4" />
              </div>

              {/* Fake message stack */}
              {[
                { sender: "Client", msg: "Can we review the contract terms?", opacity: "opacity-30" },
                { sender: "You", msg: "Sure, I sent the PDF yesterday.", opacity: "opacity-50" },
                { sender: "Client", msg: "Ah, I see it. What about clause 4?", opacity: "opacity-70" },
                { sender: "Client", msg: "Is there flexibility there?", opacity: "opacity-100" },
              ].map((m, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: idx * 0.15 }}
                  className={`bg-zinc-50 rounded-xl p-3 border border-zinc-100 ${m.opacity}`}
                >
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 font-bold">{m.sender}</div>
                  <div className="text-sm text-zinc-800">{m.msg}</div>
                </motion.div>
              ))}

              {/* AI Reply */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: 0.8, type: "spring" }}
                className="mt-6 relative"
              >
                <div className="absolute -left-10 top-1/2 w-4 h-[2px] bg-brand-accent-blue/20"></div>
                <div className="bg-brand-accent-blue rounded-xl p-4 shadow-[0_0_20px_rgba(2,132,199,0.2)]">
                  <div className="text-[10px] text-white uppercase tracking-wider mb-1 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                    <span className="text-white">OmniAgent</span>
                  </div>
                  <div className="text-sm text-white/90">
                    "Yes, clause 4 (pricing) is flexible based on the PDF terms we discussed yesterday. We can adjust the limits."
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Explanation side */}
            <div className="space-y-6">
              <div className="space-y-2">
                <h4 className="text-xl font-outfit font-bold tracking-wide text-zinc-900">Full Conversational Continuity</h4>
                <p className="text-sm text-zinc-600 leading-relaxed font-inter">
                  The AI doesn't just react to the last bubble. It tracks what was discussed, avoids looping questions, and builds on prior context naturally.
                </p>
              </div>

              <div className="bg-white border border-zinc-200 shadow-sm rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs text-zinc-500 uppercase mb-1 font-bold tracking-wider">Professional Window</div>
                  <div className="text-brand-accent-blue font-bold font-outfit text-xl">10 Messages</div>
                </div>
                <div className="w-px h-10 bg-zinc-200"></div>
                <div>
                  <div className="text-xs text-zinc-500 uppercase mb-1 font-bold tracking-wider">Casual Window</div>
                  <div className="text-brand-accent-blue font-bold font-outfit text-xl">1 Message</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
