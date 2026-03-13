"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { Server, Zap, Database, Layers } from "lucide-react";

export default function Architecture() {
  const nodes = [
    { title: "Gateway Node", sub: "Node.js (Baileys)", icon: Zap, color: "text-brand-accent-blue", x: "10%", y: "20%" },
    { title: "Agent Core", sub: "FastAPI / gRPC", icon: Server, color: "text-brand-accent-emerald", x: "50%", y: "50%" },
    { title: "Vector DB", sub: "Qdrant", icon: Layers, color: "text-brand-accent-blue", x: "80%", y: "20%" },
    { title: "State Cache", sub: "Redis", icon: Database, color: "text-zinc-600", x: "50%", y: "80%" },
  ];

  const constraintsRef = useRef(null);

  return (
    <section id="how-it-works" className="py-32 relative overflow-hidden bg-white">
      <div className="container mx-auto px-4 max-w-5xl relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="mb-20"
        >
          <h2 className="font-outfit text-4xl md:text-5xl font-bold mb-6 text-zinc-900">
            Built for Scale. Engineered for Speed.
          </h2>
          <p className="text-zinc-600 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            OmniAgent is powered by a microservices architecture with gRPC communication, Redis for real-time state, Supabase for persistence, and Qdrant for vector search.
          </p>
        </motion.div>

        {/* Abstract diagram UI */}
        <div ref={constraintsRef} className="relative h-[400px] w-full max-w-3xl mx-auto rounded-3xl bg-zinc-50 border border-zinc-200 shadow-lg overflow-hidden">
          {/* Grid background */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPPHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDAsMCwwLDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3N2Zz4=')] opacity-50 pointer-events-none"></div>

          {nodes.map((n, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2, type: "spring" }}
              drag
              dragConstraints={constraintsRef}
              dragElastic={0.2}
              dragMomentum={false}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-grab active:cursor-grabbing z-10"
              style={{ left: n.x, top: n.y }}
            >
              <div className="w-16 h-16 rounded-2xl bg-white border border-brand-accent-blue/20 flex items-center justify-center mb-3 shadow-lg relative group transition-colors hover:border-brand-accent-blue/50">
                <n.icon className={`w-8 h-8 ${n.color}`} />
                <div className={`absolute inset-0 rounded-2xl blur-md opacity-0 group-hover:opacity-20 transition-opacity ${n.color.replace('text-', 'bg-')}`}></div>
              </div>
              <div className="bg-white px-3 py-1.5 rounded-lg border border-zinc-200 text-center shadow-sm">
                <p className="text-sm font-bold text-zinc-900 font-outfit">{n.title}</p>
                <p className="text-[10px] text-zinc-500">{n.sub}</p>
              </div>
            </motion.div>
          ))}
          
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40" style={{ zIndex: 0 }}>
             <motion.path 
                d="M 10% 20% L 50% 50%" 
                stroke="#0284c7" 
                strokeWidth="2" 
                fill="none" 
                strokeDasharray="6,6"
                animate={{ strokeDashoffset: [0, -24] }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
             />
             <motion.path 
                d="M 50% 50% L 80% 20%" 
                stroke="#0284c7" 
                strokeWidth="2" 
                fill="none" 
                strokeDasharray="6,6"
                animate={{ strokeDashoffset: [0, -24] }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
             />
             <motion.path 
                d="M 50% 50% L 50% 80%" 
                stroke="#0284c7" 
                strokeWidth="2" 
                fill="none" 
                strokeDasharray="6,6"
                animate={{ strokeDashoffset: [0, -24] }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
             />
          </svg>
        </div>
      </div>
    </section>
  );
}
