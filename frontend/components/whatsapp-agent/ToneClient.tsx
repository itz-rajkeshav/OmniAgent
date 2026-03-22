"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquareText,
  Sparkles,
  CheckCircle2,
  Briefcase,
  Coffee,
  Loader2,
} from "lucide-react";
import { GATEWAY_URL } from "@/lib/constants";

interface Tone {
  id: string;
  label: string;
  mode: "casual" | "professional";
  description: string;
  icon: React.ElementType;
  color: string;
}

const TONES: Tone[] = [
  {
    id: "casual_friendly",
    label: "Friendly",
    mode: "casual",
    description: "Warm, approachable, and enthusiastic.",
    icon: Coffee,
    color: "bg-orange-100 text-orange-600 border-orange-200",
  },
  {
    id: "casual_witty",
    label: "Witty",
    mode: "casual",
    description: "Clever, humorous, and engaging.",
    icon: Sparkles,
    color: "bg-yellow-100 text-yellow-600 border-yellow-200",
  },
  {
    id: "casual_empathetic",
    label: "Empathetic",
    mode: "casual",
    description: "Understanding, caring, and patient.",
    icon: MessageSquareText,
    color: "bg-pink-100 text-pink-600 border-pink-200",
  },
  {
    id: "casual_brief",
    label: "Brief",
    mode: "casual",
    description: "Short, casual, and to the point.",
    icon: CheckCircle2,
    color: "bg-green-100 text-green-600 border-green-200",
  },
  {
    id: "professional_formal",
    label: "Formal",
    mode: "professional",
    description: "Polite, respectful, and strictly business.",
    icon: Briefcase,
    color: "bg-blue-100 text-blue-600 border-blue-200",
  },
  {
    id: "professional_consultative",
    label: "Consultative",
    mode: "professional",
    description: "Advisory, knowledgeable, and helpful.",
    icon: MessageSquareText,
    color: "bg-indigo-100 text-indigo-600 border-indigo-200",
  },
  {
    id: "professional_supportive",
    label: "Supportive",
    mode: "professional",
    description: "Reassuring, informative, and reliable.",
    icon: CheckCircle2,
    color: "bg-teal-100 text-teal-600 border-teal-200",
  },
  {
    id: "professional_concise",
    label: "Concise",
    mode: "professional",
    description: "Clear, direct, and efficient.",
    icon: Coffee,
    color: "bg-slate-100 text-slate-600 border-slate-200",
  },
];

export function ToneClient({ userId }: { userId: string }) {
  const [activeTone, setActiveTone] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTone();
  }, [userId]);

  const fetchTone = async () => {
    try {
      const res = await fetch(
        `${GATEWAY_URL}/whatshapp/get-agent-tone/${userId}`,
      );
      if (!res.ok) {
        throw new Error("Failed to fetch tone");
      }

      const data = await res.json();
      setActiveTone(data.tone || "casual_friendly");
    } catch (err: any) {
      console.error(err);
      setActiveTone("casual_friendly");
    } finally {
      setLoading(false);
    }
  };

  const saveTone = async (toneId: string) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(
        `${GATEWAY_URL}/whatshapp/set-agent-tone/${userId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tone: toneId }),
        },
      );
      if (!res.ok) {
        throw new Error("Failed to save tone");
      }
      setActiveTone(toneId);
    } catch (err: any) {
      console.error(err);
      setError("Could not save your preferences. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const casualTones = TONES.filter((t) => t.mode === "casual");
  const professionalTones = TONES.filter((t) => t.mode === "professional");

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-slate-200/60 shadow-xl shadow-slate-200/20 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-indigo-50/50 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-pink-50/50 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-5 mb-10"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <MessageSquareText className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">
                Agent Tone
              </h1>
              <p className="text-slate-500 mt-1 font-medium">
                Customize the personality and voice of your AI agent.
              </p>
            </div>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-red-50 text-red-600 border border-red-200 p-4 rounded-xl mb-6 text-sm font-medium"
            >
              {error}
            </motion.div>
          )}

          <div className="space-y-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px bg-slate-200 flex-1" />
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                  Casual & Friendly
                </h2>
                <div className="h-px bg-slate-200 flex-1" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {casualTones.map((tone) => (
                  <ToneCard
                    key={tone.id}
                    tone={tone}
                    isActive={activeTone === tone.id}
                    onSelect={() => saveTone(tone.id)}
                    saving={saving && activeTone !== tone.id}
                  />
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px bg-slate-200 flex-1" />
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                  Professional & Formal
                </h2>
                <div className="h-px bg-slate-200 flex-1" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {professionalTones.map((tone) => (
                  <ToneCard
                    key={tone.id}
                    tone={tone}
                    isActive={activeTone === tone.id}
                    onSelect={() => saveTone(tone.id)}
                    saving={saving && activeTone !== tone.id}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-12 pt-8 border-t border-slate-200/60"
          >
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold text-slate-800">
                  Advanced Prompting (Coming Soon)
                </h3>
              </div>
              <p className="text-slate-500 text-sm mb-4">
                You will be able to supply custom instructions to further refine
                the agent's behavior.
              </p>
              <textarea
                className="w-full p-4 border border-slate-200 rounded-xl bg-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none transition-all placeholder:text-slate-400"
                rows={3}
                disabled
                placeholder="E.g., Always address the user by their first name if known, and never mention competitor products..."
              ></textarea>
            </div>
          </motion.div> */}
        </div>
      </div>
    </div>
  );
}

function ToneCard({
  tone,
  isActive,
  onSelect,
  saving,
}: {
  tone: Tone;
  isActive: boolean;
  onSelect: () => void;
  saving: boolean;
}) {
  const Icon = tone.icon;

  return (
    <motion.div
      whileHover={{ y: isActive ? 0 : -4, scale: isActive ? 1 : 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => !isActive && !saving && onSelect()}
      className={`relative cursor-pointer rounded-2xl p-5 border-2 transition-all duration-300 ease-out overflow-hidden ${
        isActive
          ? "border-indigo-500 bg-indigo-50/30 shadow-md shadow-indigo-100"
          : "border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm"
      } ${saving ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0, rotate: -45 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"
          />
        )}
      </AnimatePresence>

      <div className="flex items-start gap-4 relative z-10">
        <motion.div
          initial={false}
          animate={{
            backgroundColor: isActive ? "rgb(99 102 241)" : "",
            color: isActive ? "white" : "",
          }}
          className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-colors duration-300 ${tone.color} ${isActive ? "shadow-md shadow-indigo-500/30 border-transparent" : ""}`}
        >
          {isActive ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.1 }}
            >
              <CheckCircle2 className="w-6 h-6" />
            </motion.div>
          ) : (
            <Icon className="w-6 h-6" />
          )}
        </motion.div>

        <div>
          <h3
            className={`font-bold text-lg transition-colors duration-300 ${isActive ? "text-indigo-900" : "text-slate-800"}`}
          >
            {tone.label}
          </h3>
          <p className="text-slate-500 text-sm mt-1 leading-relaxed">
            {tone.description}
          </p>
        </div>
      </div>

      {/* Selection Ring */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            layoutId="active-ring"
            className="absolute inset-0 border-2 border-indigo-500 rounded-2xl pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
