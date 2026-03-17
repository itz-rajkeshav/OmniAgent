import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import { MessageCircle, Send, Sparkles, LayoutDashboard, BrainCircuit, Activity, Settings, Plus, ArrowRight, ExternalLink, Zap } from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/");
  }

  const userFirstname = session.user.name?.split(" ")[0] || "there";
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? "Good morning" : currentHour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="min-h-screen bg-zinc-50/50 font-sans flex flex-col md:flex-row">
      {/* Sidebar Navigation (Visible on md+) */}
      <aside className="w-64 bg-white border-r border-zinc-200 hidden md:flex flex-col h-screen sticky top-0 shrink-0">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-brand-accent-blue/10 border border-brand-accent-blue/20 shadow-[0_0_15px_rgba(2,132,199,0.1)] group-hover:shadow-[0_0_25px_rgba(2,132,199,0.2)] transition-shadow">
              <Sparkles className="w-4 h-4 text-brand-accent-blue" />
            </div>
            <span className="font-outfit font-bold text-xl tracking-tight text-zinc-900 group-hover:text-brand-accent-blue transition-colors">
              Omni<span className="text-zinc-500">Agent</span>
            </span>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-zinc-100 text-zinc-900 font-medium">
            <LayoutDashboard className="w-5 h-5 text-brand-accent-blue" />
            Overview
          </Link>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors cursor-not-allowed opacity-70">
            <BrainCircuit className="w-5 h-5" />
            Knowledge Base
          </div>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors cursor-not-allowed opacity-70">
            <Activity className="w-5 h-5" />
            Analytics
          </div>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors cursor-not-allowed opacity-70">
            <Settings className="w-5 h-5" />
            Settings
          </div>
        </nav>

        <div className="p-4 border-t border-zinc-200">
          <div className="flex items-center gap-3 p-2">
            {session.user.image ? (
              <img src={session.user.image} alt="Avatar" className="w-10 h-10 rounded-full border border-zinc-200" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center">
                <span className="text-sm font-medium text-zinc-500">{userFirstname[0]}</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-900 truncate">{session.user.name}</p>
              <p className="text-xs text-zinc-500 truncate">{session.user.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        {/* Mobile Header (Hidden on md+) */}
        <header className="md:hidden bg-white border-b border-zinc-200 p-4 flex items-center justify-between sticky top-0 z-10">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-brand-accent-blue/10 border border-brand-accent-blue/20">
              <Sparkles className="w-4 h-4 text-brand-accent-blue" />
            </div>
            <span className="font-outfit font-bold text-xl tracking-tight text-zinc-900">
              Omni<span className="text-zinc-500">Agent</span>
            </span>
          </Link>
          {session.user.image && (
            <img src={session.user.image} alt="User avatar" className="w-8 h-8 rounded-full border border-zinc-200" referrerPolicy="no-referrer" />
          )}
        </header>

        <main className="flex-1 p-6 md:p-8 lg:p-10 max-w-6xl mx-auto w-full">
          {/* Welcome Banner */}
          <div className="relative bg-gradient-to-br from-brand-accent-blue/10 via-white to-transparent border border-brand-accent-blue/20 rounded-3xl p-8 mb-8 overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <BrainCircuit className="w-48 h-48 text-brand-accent-blue" />
            </div>
            <div className="relative z-10">
              <h1 className="font-outfit text-3xl md:text-4xl font-bold text-zinc-900 mb-3">
                {greeting}, {userFirstname}!
              </h1>
              <p className="text-zinc-600 text-lg max-w-2xl mb-6">
                Your AI agent is currently offline. Connect a gateway like WhatsApp to start automating your conversations immediately.
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center gap-3 text-zinc-600 mb-4">
                      <MessageCircle className="w-5 h-5" />
                      <span className="font-medium text-sm">Messages Handled</span>
                  </div>
                  <div>
                      <span className="text-4xl font-bold text-zinc-900">0</span>
                      <p className="text-sm text-zinc-500 mt-1">Ready for first setup</p>
                  </div>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center gap-3 text-zinc-600 mb-4">
                      <BrainCircuit className="w-5 h-5" />
                      <span className="font-medium text-sm">Knowledge Base Size</span>
                  </div>
                  <div>
                      <span className="text-4xl font-bold text-zinc-900">0</span>
                      <p className="text-sm text-zinc-500 mt-1">Documents and URLs</p>
                  </div>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center gap-3 text-zinc-600 mb-4">
                      <Activity className="w-5 h-5" />
                      <span className="font-medium text-sm">Active Connections</span>
                  </div>
                  <div>
                      <span className="text-4xl font-bold text-brand-accent-blue">0/2</span>
                      <p className="text-sm text-zinc-500 mt-1">Gateways configured</p>
                  </div>
              </div>
          </div>

          {/* Gateways Section */}
          <div className="bg-white rounded-3xl p-8 border border-zinc-200 shadow-sm mb-8">
            <div className="flex sm:items-center justify-between mb-8 flex-col sm:flex-row gap-4">
              <div>
                <h2 className="font-outfit text-2xl font-semibold text-zinc-900 mb-2">Connect Your Platforms</h2>
                <p className="text-zinc-600 outline-none">Choose a gateway to deploy your OmniAgent. More platforms are coming soon.</p>
              </div>
              <button className="hidden sm:flex items-center gap-2 text-sm font-medium text-brand-accent-blue hover:text-brand-accent-blue/80 transition-colors">
                  View full list <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
              {/* WhatsApp - Active */}
              <Link href="/whatsapp" className="group block">
                 <div className="relative h-full rounded-2xl flex items-start gap-6 p-6 border transition-all duration-300 bg-white border-zinc-200 hover:border-[#25D366]/50 shadow-sm hover:shadow-md hover:shadow-[#25D366]/5">
                   <div className="w-16 h-16 shrink-0 rounded-2xl bg-[#25D366]/10 flex items-center justify-center transition-transform group-hover:scale-105 group-hover:bg-[#25D366]/15">
                     <MessageCircle className="w-8 h-8 text-[#25D366]" strokeWidth={1.5} />
                   </div>
                   <div className="flex-1">
                       <div className="flex items-center justify-between mb-2">
                           <h3 className="font-outfit font-semibold text-zinc-900 text-lg group-hover:text-[#128C7E] transition-colors">WhatsApp</h3>
                           <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-600 border border-rose-100">
                               <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                               Disconnected
                           </span>
                       </div>
                       <p className="text-sm text-zinc-500 mb-4 line-clamp-2">Connect a dedicated WhatsApp number to let your agent handle inquiries and support.</p>
                       <div className="text-sm font-medium text-brand-accent-blue flex items-center gap-1">
                           Configure Gateway <ArrowRight className="w-4 h-4" />
                       </div>
                   </div>
                 </div>
              </Link>

              {/* Telegram - Coming Soon (Disabled) */}
              <div className="relative group opacity-70">
                 <div className="relative h-full rounded-2xl flex items-start gap-6 p-6 border transition-all duration-300 bg-zinc-50 border-zinc-200">
                   <div className="w-16 h-16 shrink-0 rounded-2xl bg-brand-accent-blue/5 flex items-center justify-center grayscale">
                     <Send className="w-8 h-8 text-brand-accent-blue" strokeWidth={1.5} />
                   </div>
                   <div className="flex-1">
                       <div className="flex items-center justify-between mb-2">
                           <h3 className="font-outfit font-semibold text-zinc-800 text-lg">Telegram</h3>
                           <div className="whitespace-nowrap bg-zinc-200 text-zinc-600 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide">
                             Soon
                           </div>
                       </div>
                       <p className="text-sm text-zinc-500 mb-2 line-clamp-2">Deploy your agent as a Telegram bot to handle channels or direct messages.</p>
                       <div className="text-sm font-medium text-zinc-400 flex items-center gap-1">
                           Currently in development
                       </div>
                   </div>
                 </div>
              </div>
            </div>
          </div>

          {/* Activity Placeholder */}
          {/* <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
             <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                 <h2 className="font-outfit font-semibold text-zinc-900">Recent Activity</h2>
                 <button className="text-sm text-zinc-500 hover:text-brand-accent-blue transition-colors">View All</button>
             </div>
             <div className="p-12 flex flex-col items-center justify-center text-center">
                 <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
                     <Activity className="w-8 h-8 text-zinc-300" />
                 </div>
                 <h3 className="text-zinc-900 font-medium mb-1">No activity yet</h3>
                 <p className="text-zinc-500 text-sm max-w-sm">Connect a gateway like WhatsApp to start seeing agent interactions and message logs here.</p>
             </div>
          </div> */}

        </main>
      </div>
    </div>
  );
}
