import { ToneClient } from "@/components/whatsapp-agent/ToneClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function TonePage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/");
  }

  return <ToneClient userId={session.user.id} />;
}
