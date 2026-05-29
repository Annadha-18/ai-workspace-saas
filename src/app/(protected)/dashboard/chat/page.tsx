import { DashboardChatPage } from "@/components/dashboard/dashboard-chat-page";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "AI Chat",
};

export default async function ChatPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return <DashboardChatPage user={user} />;
}