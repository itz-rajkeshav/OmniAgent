"use client";

import { motion } from "framer-motion";
import { MessageCircle, Send, Slack, MessagesSquare } from "lucide-react";

export default function MultiGateway() {
  const gateways = [
    { name: "WhatsApp", icon: MessageCircle, color: "text-[#25D366]", bg: "bg-[#25D366]/10", active: true },
    { name: "Telegram", icon: Send, color: "text-brand-accent-blue", bg: "bg-brand-accent-blue/10", active: false },
    { name: "Slack", icon: Slack, color: "text-brand-accent-blue", bg: "bg-brand-accent-blue/10", active: false },
    { name: "Discord", icon: MessagesSquare, color: "text-brand-accent-blue", bg: "bg-brand-accent-blue/10", active: false },
  ];

  return (
    <section className="py-24 relative overflow-hidden bg-zinc-50">
      <div className="container mx-auto px-4 max-w-5xl relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="mb-16"
        >
          <h2 className="font-outfit text-4xl md:text-5xl font-bold mb-6 text-zinc-900">
            One Agent. Every Platform.
          </h2>
          <p className="text-zinc-600 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Connect OmniAgent to WhatsApp today. Telegram, Slack, and more are on the way. Your agent follows you across every messaging platform — same knowledge, same voice.
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-6 md:gap-12 relative">
          <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-200 to-transparent -z-10 -translate-y-1/2 hidden md:block"></div>
          
          {gateways.map((gw, idx) => (
            <motion.div
              key={gw.name}
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: idx * 0.15, type: "spring", stiffness: 200 }}
              className="relative group"
            >
              <div className={`relative w-32 h-32 md:w-40 md:h-40 rounded-3xl flex flex-col items-center justify-center p-6 border transition-all duration-300 z-10 ${gw.active ? "bg-[#25D366]/10 border-[#25D366]/50 shadow-lg shadow-[#25D366]/10" : "bg-white border-zinc-200 hover:bg-zinc-50 hover:border-brand-accent-blue/30 shadow-sm"}`}>
                <div className={`w-16 h-16 rounded-2xl ${gw.active ? "bg-[#25D366]/15" : gw.bg} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                  <gw.icon className={`w-8 h-8 ${gw.active ? "text-[#25D366]" : gw.color}`} strokeWidth={1.5} />
                </div>
                <span className={`font-outfit font-semibold ${gw.active ? "text-[#128C7E]" : "text-zinc-900"}`}>{gw.name}</span>
                
                {!gw.active && (
                  <div className="absolute -top-3 -right-3 whitespace-nowrap bg-zinc-100 border border-zinc-200 text-zinc-500 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    Soon
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
