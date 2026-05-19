"use client";

import { AiChat } from "@/components/dashboard/ai-chat";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import type { User } from "@supabase/supabase-js";

type DashboardChatPageProps = {
  user: User;
};

export function DashboardChatPage({ user }: DashboardChatPageProps) {
  return (
    <>
      <DashboardTopbar
        user={user}
        title="AI Chat"
        description="Stream markdown responses from your Gemini-powered assistant."
      />
      <AiChat />
    </>
  );
}
