import Link from "next/link";
import { Sparkles, Github, Twitter, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-zinc-50 border-t border-zinc-200 py-12 pb-24 md:pb-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4 group inline-flex">
              <div className="flex items-center justify-center w-6 h-6 rounded bg-brand-accent-blue/10">
                <Sparkles className="w-3 h-3 text-brand-accent-blue" />
              </div>
              <span className="font-outfit font-bold tracking-tight text-zinc-900">
                Omni<span className="text-zinc-500">Agent</span>
              </span>
            </Link>
            <p className="text-zinc-500 text-sm mb-6 leading-relaxed font-inter hover:text-zinc-700 transition-colors">
              Your AI. Your Voice. Every Chat.<br/>
              Putting your communications on autopilot.
            </p>
            <div className="flex items-center gap-4">
              <Link href="#" className="w-8 h-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-500 hover:text-brand-accent-blue hover:bg-zinc-50 transition-all group shadow-sm">
                <Twitter className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </Link>
              <Link href="#" className="w-8 h-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-500 hover:text-brand-accent-blue hover:bg-zinc-50 transition-all group shadow-sm">
                <Github className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </Link>
              <Link href="#" className="w-8 h-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-500 hover:text-brand-accent-blue hover:bg-zinc-50 transition-all group shadow-sm">
                <Linkedin className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </Link>
            </div>
          </div>
          
          <div>
            <h4 className="font-outfit font-bold text-zinc-900 mb-4">Product</h4>
            <ul className="space-y-3 font-inter">
              <li><Link href="#features" className="text-zinc-500 hover:text-brand-accent-blue transition-colors text-sm">Features</Link></li>
              <li><Link href="#how-it-works" className="text-zinc-500 hover:text-brand-accent-blue transition-colors text-sm">How It Works</Link></li>
              <li><Link href="#pricing" className="text-zinc-500 hover:text-brand-accent-blue transition-colors text-sm">Pricing</Link></li>
              <li><Link href="#" className="text-zinc-500 hover:text-brand-accent-blue transition-colors text-sm flex items-center gap-2">Changelog <span className="bg-brand-accent-blue/10 text-brand-accent-blue text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">New</span></Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-outfit font-bold text-zinc-900 mb-4">Resources</h4>
            <ul className="space-y-3 font-inter">
              <li><Link href="#" className="text-zinc-500 hover:text-brand-accent-blue transition-colors text-sm">Documentation</Link></li>
              <li><Link href="#" className="text-zinc-500 hover:text-brand-accent-blue transition-colors text-sm">API Reference</Link></li>
              <li><Link href="#" className="text-zinc-500 hover:text-brand-accent-blue transition-colors text-sm">Help Center</Link></li>
              <li><Link href="#" className="text-zinc-500 hover:text-brand-accent-blue transition-colors text-sm">Community</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-outfit font-bold text-zinc-900 mb-4">Legal</h4>
            <ul className="space-y-3 font-inter">
              <li><Link href="#" className="text-zinc-500 hover:text-brand-accent-blue transition-colors text-sm">Privacy Policy</Link></li>
              <li><Link href="#" className="text-zinc-500 hover:text-brand-accent-blue transition-colors text-sm">Terms of Service</Link></li>
              <li><Link href="#" className="text-zinc-500 hover:text-brand-accent-blue transition-colors text-sm">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-zinc-200 flex flex-col md:flex-row items-center justify-between gap-4 font-inter">
          <p className="text-zinc-400 text-sm">
            © {new Date().getFullYear()} OmniAgent Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
            <span className="text-zinc-500">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
