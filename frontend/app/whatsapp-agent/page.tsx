import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { GATEWAY_URL } from "@/lib/constants";

export default async function WhatsappAgentPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/");
  }

  // Double check that they are actually connected
  const userId = session.user.id;
  try {
    const res = await fetch(
      `${GATEWAY_URL}/whatshapp/status?userId=${userId}`,
      { cache: "no-store" },
    );
    if (res.ok) {
      const data = await res.json();
      if (data.status !== "connected") {
        redirect("/whatsapp");
      }
    }
  } catch (err) {
    console.error("Failed to verify connection status", err);
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA] font-sans">
      <header className="bg-white border-b border-[#E9EDEF] sticky top-0 z-10 px-6 py-4 flex items-center justify-between shadow-sm">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-[#667781] hover:text-[#111B21] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-semibold">Dashboard</span>
        </Link>
        <div className="flex items-center gap-2">
          <MessageCircle
            className="w-6 h-6 text-[#25D366]"
            fill="#25D366"
            stroke="white"
          />
          <span className="font-bold text-[#111B21] text-lg">
            Agent Control Panel
          </span>
        </div>
        <div className="w-24"></div>
      </header>

      <main className="container mx-auto px-4 lg:px-8 py-16">
        <div className="bg-white rounded-[2rem] p-16 border border-[#E9EDEF] text-center max-w-4xl mx-auto shadow-xl">
          <div className="w-24 h-24 bg-[#25D366]/10 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
            <MessageCircle
              className="w-12 h-12 text-[#25D366]"
              fill="#25D366"
              stroke="white"
            />
          </div>
          <h1 className="text-4xl font-bold font-outfit text-[#111B21] mb-6 tracking-tight">
            WhatsApp Agent Active!
          </h1>
          <p className="text-[#667781] text-xl mb-12 max-w-xl mx-auto leading-relaxed">
            Your agent is currently securely connected to WhatsApp. The full
            chat configuration and mode-switching panel is coming soon.
          </p>

          <button className="bg-[#128C7E] hover:bg-[#075E54] text-white px-8 py-3.5 rounded-full font-bold shadow-lg transition-colors duration-300">
            Configure Agent Tone
          </button>
        </div>
      </main>
    </div>
  );
}
