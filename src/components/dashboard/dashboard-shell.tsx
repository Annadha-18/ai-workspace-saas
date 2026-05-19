"use client";

import type { User } from "@supabase/supabase-js";

import { DashboardBackground } from "@/components/dashboard/dashboard-background";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";

type DashboardShellProps = {
  user: User;
  children: React.ReactNode;
};

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="relative min-h-svh">
      <DashboardBackground />
      <div className="mx-auto flex max-w-[1600px] gap-4 p-4 lg:p-6">
        <DashboardSidebar />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
