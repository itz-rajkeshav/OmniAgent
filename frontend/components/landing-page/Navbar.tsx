"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 pointer-events-none",
        isScrolled ? "py-4" : "py-6"
      )}
    >
      <div className="container mx-auto px-4 pointer-events-auto">
        <div
          className={cn(
            "flex items-center justify-between px-6 py-3 rounded-full border border-zinc-200/50 transition-all duration-500",
            isScrolled
              ? "bg-white/80 backdrop-blur-xl shadow-lg border-zinc-200 mx-4 md:mx-16 lg:mx-32"
              : "bg-transparent mx-0"
          )}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-brand-accent-blue/10 border border-brand-accent-blue/20 shadow-[0_0_15px_rgba(2,132,199,0.1)] group-hover:shadow-[0_0_25px_rgba(2,132,199,0.2)] transition-shadow">
              <Sparkles className="w-4 h-4 text-brand-accent-blue" />
            </div>
            <span className="font-outfit font-bold text-xl tracking-tight text-zinc-900 group-hover:text-brand-accent-blue transition-colors">
              Omni<span className="text-zinc-500">Agent</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium text-zinc-600 hover:text-brand-accent-blue transition-colors">Features</Link>
            <Link href="#how-it-works" className="text-sm font-medium text-zinc-600 hover:text-brand-accent-blue transition-colors">How It Works</Link>
            <Link href="#pricing" className="text-sm font-medium text-zinc-600 hover:text-brand-accent-blue transition-colors">Pricing</Link>
          </nav>

          {/* CTA & Mobile Toggle */}
          <div className="flex items-center gap-4">
            <button className="hidden md:flex relative items-center justify-center px-6 py-2 text-sm font-semibold text-white transition-all rounded-full overflow-hidden group bg-brand-accent-blue hover:bg-brand-accent-blue/90 border border-brand-accent-blue/20 shadow-lg hover:shadow-xl">
              <span className="absolute inset-0 w-full h-full bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out" />
              Get Started
            </button>
            <button 
              className="md:hidden p-2 text-zinc-600 hover:text-brand-accent-blue"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] bg-white flex flex-col pointer-events-auto"
          >
            <div className="flex items-center justify-between p-6">
              <span className="font-outfit font-bold text-xl text-zinc-900">OmniAgent</span>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-zinc-600 hover:text-brand-accent-blue rounded-full bg-zinc-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex flex-col gap-6 p-8 text-2xl font-outfit">
              <Link href="#features" onClick={() => setMobileMenuOpen(false)} className="text-zinc-600 hover:text-brand-accent-blue">Features</Link>
              <Link href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-zinc-600 hover:text-brand-accent-blue">How It Works</Link>
              <Link href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-zinc-600 hover:text-brand-accent-blue">Pricing</Link>
              <button className="mt-8 px-6 py-4 rounded-xl bg-brand-accent-blue font-semibold text-white shadow-lg text-lg">
                Get Early Access
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
