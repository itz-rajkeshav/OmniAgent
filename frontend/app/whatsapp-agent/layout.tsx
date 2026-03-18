import { Sidebar } from "@/components/whatsapp-agent/Sidebar";
import { Header } from "@/components/whatsapp-agent/Header";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { GATEWAY_URL } from "@/lib/constants";

export default async function WhatsappAgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/");
  }

  const userId = session.user.id;
  try {
    const res = await fetch(
      `${GATEWAY_URL}/whatshapp/status?userId=${userId}`,
      { cache: "no-store" }
    );
    if (res.ok) {
      const data = await res.json();
      if (data.status !== "connected") {
        redirect("/whatsapp");
      }
    }
  } catch (err) {
    console.error("Failed to verify connection status:", err);
  }

  return (
    <div className="flex bg-[#F7F8FA] min-h-screen font-sans">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-h-screen transition-all">
        <Header />
        <main className="flex-1 p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
