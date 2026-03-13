"use client";

import { motion } from "framer-motion";
import {
  FileText,
  Globe,
  Database,
  ArrowRight,
  Bot,
  Sparkles,
} from "lucide-react";

export default function KnowledgeBase() {
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
            Teach Your Agent.{" "}
            <span className="text-brand-accent-blue">
              It Learns You.
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.1 }}
            className="text-zinc-600 text-lg md:text-xl max-w-2xl mx-auto"
          >
            Upload PDFs or paste a website URL. OmniAgent crawls, chunks, and
            embeds the content into a vector knowledge base — so your AI replies
            with <span className="italic text-zinc-900 font-medium">your</span> data, not
            generic answers.
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Input Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="relative"
          >
            <div className="absolute inset-0 bg-brand-accent-blue/5 blur-[100px] rounded-full pointer-events-none"></div>

            <div className="relative space-y-4">
              {/* PDF Upload Card */}
              <div className="bg-white rounded-2xl p-5 border border-zinc-200 hover:border-brand-accent-blue/30 shadow-sm flex items-center gap-4 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-brand-accent-blue/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-brand-accent-blue" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-zinc-900">
                    Q3_Company_Report.pdf
                  </h4>
                  <p className="text-xs text-zinc-500">
                    12 pages • Processed in 4s
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                </div>
              </div>

              {/* URL Crawl Card */}
              <div className="bg-white rounded-2xl p-5 border border-zinc-200 hover:border-brand-accent-blue/30 shadow-sm flex items-center gap-4 transition-colors ml-8">
                <div className="w-12 h-12 rounded-xl bg-brand-accent-blue/10 flex items-center justify-center flex-shrink-0">
                  <Globe className="w-6 h-6 text-brand-accent-blue" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-zinc-900">
                    acme-corp.com/pricing
                  </h4>
                  <p className="text-xs text-zinc-500">Crawled 5 pages</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Database / Output Side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            {/* Particles linking them */}
            <div className="hidden lg:block absolute -left-16 top-1/2 -translate-y-1/2 text-brand-accent-blue/30">
              <motion.div
                animate={{ x: [0, 40], opacity: [0, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <ArrowRight className="w-8 h-8" />
              </motion.div>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-zinc-200 shadow-md overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent-blue/5 blur-3xl"></div>

              <div className="flex items-center gap-3 mb-6">
                <Database className="w-6 h-6 text-zinc-900" />
                <h3 className="font-outfit font-bold tracking-wider text-sm text-zinc-500 uppercase">
                  Qdrant Vector Store
                </h3>
              </div>

              <div className="space-y-3 mb-8">
                <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: "0%" }}
                    whileInView={{ width: "100%" }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                    className="h-full bg-gradient-to-r from-brand-accent-blue to-brand-accent-blue-light"
                  ></motion.div>
                </div>
                <div className="flex justify-between text-xs text-zinc-500">
                  <span>Converting to vectors (all-MiniLM-L6-v2)</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Result Bubble */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.5 }}
                className="bg-zinc-50 border border-zinc-200 shadow-inner rounded-2xl p-5"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-brand-accent-blue flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xs text-zinc-500 mb-1 flex items-center gap-2">
                      <Sparkles className="w-3 h-3 text-brand-accent-blue" />
                      Based on Q3_Company_Report.pdf
                    </div>
                    <p className="text-zinc-800 text-sm leading-relaxed">
                      &quot;According to our Q3 report, the enterprise tier
                      pricing starts at $499/mo, assuming you have 50+
                      seats.&quot;
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
