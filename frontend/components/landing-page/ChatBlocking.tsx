"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Sparkles, User, Users } from "lucide-react";

const initialChats = [
  { id: 1, name: "Family Group", type: "group", locked: true },
  { id: 2, name: "Client A (Acme Corp)", type: "individual", locked: false },
  { id: 3, name: "Best Friends 👯‍♀️", type: "group", locked: true },
  { id: 4, name: "Support Inquiries", type: "individual", locked: false },
];

export default function ChatBlocking() {
  const [chats, setChats] = useState(initialChats);

  const toggleLock = (id: number) => {
    setChats(chats.map((c) => (c.id === id ? { ...c, locked: !c.locked } : c)));
  };

  return (
    <section className="py-24 relative overflow-hidden bg-zinc-50">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-accent-blue/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Concentric Circles Design */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-[800px] h-[800px] pointer-events-none opacity-50 z-0 hidden md:block">
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
              strokeDasharray={
                i % 3 === 0 ? "1 2" : i % 2 === 0 ? "2 4" : "none"
              }
            />
          ))}
        </motion.svg>
      </div>

      <div className="container mx-auto px-4 max-w-6xl relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-3xl mx-auto mb-16"
        >
          <h2 className="font-outfit text-4xl md:text-5xl font-bold mb-6 text-zinc-900">
            You Decide Where AI Speaks.
          </h2>
          <p className="text-zinc-600 text-lg md:text-xl leading-relaxed">
            Block specific chats or entire groups from AI replies. OmniAgent
            will never respond in conversations you mark private — your family
            group, close friends, or any thread you want left alone.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, type: "spring" }}
          className="max-w-2xl mx-auto rounded-3xl p-2 sm:p-4 border-zinc-200"
        >
          <div className="bg-white rounded-2xl p-6 shadow-xl border border-zinc-100">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-100">
              <h3 className="font-outfit font-bold text-xl text-zinc-900">
                Active Conversations
              </h3>
              <span className="text-xs font-medium px-3 py-1 bg-brand-accent-blue/10 rounded-full text-brand-accent-blue">
                Tap to block
              </span>
            </div>

            <div className="space-y-3">
              <AnimatePresence>
                {chats.map((chat) => (
                  <motion.div
                    key={chat.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                      chat.locked
                        ? "bg-zinc-50 border-zinc-200 hover:border-zinc-300"
                        : "bg-white border-brand-accent-blue/20 hover:border-brand-accent-blue/50 shadow-sm"
                    }`}
                    onClick={() => toggleLock(chat.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          chat.locked
                            ? "bg-zinc-200 text-zinc-500"
                            : "bg-brand-accent-blue/10 text-brand-accent-blue"
                        }`}
                      >
                        {chat.type === "group" ? (
                          <Users className="w-5 h-5" />
                        ) : (
                          <User className="w-5 h-5" />
                        )}
                      </div>
                      <div className="text-left">
                        <div
                          className={`font-medium ${chat.locked ? "text-zinc-400 line-through decoration-zinc-300" : "text-zinc-900"}`}
                        >
                          {chat.name}
                        </div>
                        <div className="text-xs mt-0.5">
                          {chat.locked ? (
                            <span className="text-zinc-500">AI paused</span>
                          ) : (
                            <span className="text-brand-accent-emerald font-medium">
                              AI active
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                        chat.locked
                          ? "bg-zinc-200 text-zinc-500"
                          : "bg-brand-accent-blue/10 text-brand-accent-blue"
                      }`}
                    >
                      <motion.div
                        initial={false}
                        animate={{ scale: chat.locked ? [1, 1.2, 1] : 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        {chat.locked ? (
                          <Lock className="w-5 h-5" />
                        ) : (
                          <Sparkles className="w-5 h-5" />
                        )}
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <p className="text-sm text-zinc-400 mt-6 font-inter italic">
              * Blocklist persists across devices and sessions. Your rules are
              permanent.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
