"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BarChart3, 
  UserX, 
  BookOpen, 
  Clock, 
  MessageSquareText, 
  Settings,
  Bot
} from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarLinks = [
  {
    name: "Dashboard",
    href: "/whatsapp-agent",
    icon: BarChart3,
  },
  {
    name: "Blocked Contacts",
    href: "/whatsapp-agent/blocked-contacts",
    icon: UserX,
  },
  {
    name: "Knowledge Base",
    href: "/whatsapp-agent/knowledge-base",
    icon: BookOpen,
  },
  {
    name: "Working Time",
    href: "/whatsapp-agent/working-time",
    icon: Clock,
  },
  {
    name: "Tone",
    href: "/whatsapp-agent/tone",
    icon: MessageSquareText,
  },
  {
    name: "Settings",
    href: "/whatsapp-agent/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-white border-r border-[#E9EDEF] flex flex-col shadow-sm z-50 transition-transform">
      {/* Brand area */}
      <div className="h-16 flex items-center px-6 border-b border-[#E9EDEF]">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-[#111B21] flex items-center justify-center group-hover:bg-[#128C7E] transition-colors">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-[#111B21] tracking-tight">
            OmniQ
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
        <div className="text-xs font-semibold text-[#8696A0] uppercase tracking-wider mb-4 px-2">
          WhatsApp Agent
        </div>
        <nav className="space-y-1">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-[#25D366]/10 text-[#128C7E]"
                    : "text-[#54656F] hover:bg-[#F0F2F5] hover:text-[#111B21]"
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 transition-colors",
                    isActive ? "text-[#25D366]" : "text-[#8696A0]"
                  )}
                />
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / User Profile snippet if needed */}
      <div className="p-4 border-t border-[#E9EDEF]">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#25D366] to-[#128C7E] flex items-center justify-center text-white font-bold text-xs shadow-md">
            W
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-[#111B21]">Workspace</span>
            <span className="text-xs text-[#8696A0]">Pro Plan</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
