import { BlockedContactsClient } from "@/components/whatsapp-agent/BlockedContactsClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function BlockedContactsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/");
  }

  return <BlockedContactsClient userId={session.user.id} />;
}
