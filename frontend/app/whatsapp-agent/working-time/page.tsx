import { WorkingTimeClient } from "@/components/whatsapp-agent/WorkingTimeClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function WorkingTimePage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/");
  }

  return <WorkingTimeClient userId={session.user.id} />;
}
