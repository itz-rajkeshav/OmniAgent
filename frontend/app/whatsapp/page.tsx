import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Sparkles, ArrowLeft, MessageCircle } from "lucide-react";

export default async function WhatsappPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-brand-accent-blue/10 border border-brand-accent-blue/20 shadow-[0_0_15px_rgba(2,132,199,0.1)] group-hover:shadow-[0_0_25px_rgba(2,132,199,0.2)] transition-shadow">
              <Sparkles className="w-4 h-4 text-brand-accent-blue" />
            </div>
            <span className="font-outfit font-bold text-xl tracking-tight text-zinc-900 group-hover:text-brand-accent-blue transition-colors">
              Omni<span className="text-zinc-500">Agent</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
             <Link href="/dashboard" className="flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-brand-accent-blue transition-colors">
               <ArrowLeft className="w-4 h-4" />
               Back to Dashboard
             </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 lg:px-8 py-12 max-w-4xl">
        <div className="bg-white border border-zinc-200 rounded-3xl p-8 md:p-12 shadow-sm text-center">
            <div className="w-24 h-24 mx-auto rounded-3xl bg-[#25D366]/15 flex items-center justify-center mb-6">
                <MessageCircle className="w-12 h-12 text-[#25D366]" strokeWidth={1.5} />
            </div>
            <h1 className="font-outfit text-3xl md:text-4xl font-bold text-zinc-900 mb-4">
                WhatsApp Configuration
            </h1>
            <p className="text-zinc-600 text-lg max-w-2xl mx-auto mb-10">
                You're almost there! Soon you'll be able to connect your OmniAgent directly to your WhatsApp number here.
            </p>
            
            <div className="inline-block border border-[#25D366]/30 bg-[#25D366]/5 rounded-xl p-6 text-left max-w-lg mx-auto">
                <h3 className="font-semibold text-zinc-900 mb-2">Next Steps (Coming Soon)</h3>
                <ul className="text-zinc-600 space-y-3">
                    <li className="flex gap-3">
                        <span className="bg-[#25D366] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</span>
                        Scan QR code to link device
                    </li>
                    <li className="flex gap-3">
                        <span className="bg-[#25D366] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</span>
                        Configure agent personalities & tone
                    </li>
                    <li className="flex gap-3">
                        <span className="bg-[#25D366] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</span>
                        Start accepting messages autonomously
                    </li>
                </ul>
            </div>
        </div>
      </main>
    </div>
  );
}
