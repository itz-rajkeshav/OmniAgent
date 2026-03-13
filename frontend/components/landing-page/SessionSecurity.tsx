"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Wifi, Trash2, Smartphone } from "lucide-react";

export default function SessionSecurity() {
  const steps = [
    { icon: Smartphone, label: "QR Scan", desc: "No passwords or numbers stored." },
    { icon: Wifi, label: "Auto-Reconnect", desc: "Exponential backoff on drop." },
    { icon: ShieldCheck, label: "Multi-Session", desc: "Secure parallel instances." },
    { icon: Trash2, label: "Zero Trace Logout", desc: "Keys and Redis cache wiped." },
  ];

  return (
    <section className="py-24 relative overflow-hidden bg-zinc-50">
      <div className="container mx-auto px-4 max-w-6xl relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <h2 className="font-outfit text-4xl md:text-5xl font-bold mb-6 text-zinc-900">
            Always On. <span className="text-brand-accent-blue">Always Secure.</span>
          </h2>
          <p className="text-zinc-600 text-lg md:text-xl max-w-2xl mx-auto mb-16 leading-relaxed">
            OmniAgent auto-reconnects if the connection drops. Sessions persist across restarts. And when you log out, everything is wiped — credentials, messages, and caches. Zero trace.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: idx * 0.15 }}
              className="bg-white border border-zinc-200 shadow-sm hover:border-brand-accent-blue/30 rounded-3xl p-6 relative group overflow-hidden transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-brand-accent-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="w-12 h-12 rounded-xl bg-brand-accent-blue/10 border border-brand-accent-blue/20 flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-all duration-300">
                <step.icon className="w-6 h-6 text-brand-accent-blue group-hover:text-brand-accent-blue-light transition-colors" />
              </div>
              <h3 className="text-lg font-outfit font-bold text-zinc-900 mb-2">{step.label}</h3>
              <p className="text-sm text-zinc-500">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
