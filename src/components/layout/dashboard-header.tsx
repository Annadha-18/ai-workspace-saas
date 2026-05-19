import Link from "next/link";
import { Bot } from "lucide-react";
import type { User } from "@supabase/supabase-js";

import { UserNav } from "@/components/layout/user-nav";
import { AUTH_ROUTES } from "@/lib/auth/config";

type DashboardHeaderProps = {
  user: User;
};

export function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href={AUTH_ROUTES.dashboard}
          className="flex items-center gap-2 font-semibold"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Bot className="size-4" />
          </span>
          <span className="hidden sm:inline">AI Workspace</span>
        </Link>
        <UserNav user={user} />
      </div>
    </header>
  );
}
