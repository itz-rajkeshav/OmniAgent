import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import WhatsappConnectView from "@/components/whatsapp/WhatsappConnectView";
import { GATEWAY_URL } from "@/lib/constants";

export default async function WhatsappPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/");
  }

  const userId = session.user.id;

  // Check the initial status on the server
  let isConnected = false;
  try {
    const res = await fetch(
      `${GATEWAY_URL}/whatshapp/status?userId=${userId}`,
      { cache: "no-store" },
    );
    if (res.ok) {
      const data = await res.json();
      if (data.status === "connected") {
        isConnected = true;
      }
    }
  } catch (err) {
    console.error("Failed to check status", err);
  }

  return <WhatsappConnectView userId={userId} isConnected={isConnected} />;
}
