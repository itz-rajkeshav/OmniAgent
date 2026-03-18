"use client";

import { MessageCircle, Bell, ChevronDown } from "lucide-react";

export function Header() {
  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-[#E9EDEF] sticky top-0 z-40 flex items-center justify-between px-8 shadow-sm transition-all">
      {/* Left side: Page Title or Breadcrumbs can go here */}
      <div className="flex items-center">
        {/* Placeholder if we want dynamic title later */}
      </div>

      {/* Right side: Actions & Status */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 bg-[#25D366]/10 px-3 py-1.5 rounded-full border border-[#25D366]/20">
          <div className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse"></div>
          <span className="text-xs font-semibold text-[#128C7E] tracking-wide">
            Agent Active
          </span>
        </div>

        <div className="h-6 w-px bg-[#E9EDEF]"></div>

        <button className="relative text-[#667781] hover:text-[#111B21] transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>

        <button className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-full bg-[#F0F2F5] border border-[#E9EDEF] flex items-center justify-center overflow-hidden">
             {/* Mini Robot Avatar */}
            <MessageCircle
              className="w-5 h-5 text-[#25D366] group-hover:scale-110 transition-transform"
              fill="#25D366"
              stroke="white"
            />
          </div>
          <ChevronDown className="w-4 h-4 text-[#667781] group-hover:text-[#111B21] transition-colors" />
        </button>
      </div>
    </header>
  );
}
