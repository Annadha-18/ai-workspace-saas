"use client";

import type { User } from "@supabase/supabase-js";

import { MobileSidebar } from "@/components/dashboard/mobile-sidebar";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import { UserNav } from "@/components/layout/user-nav";
import { GlassCard } from "@/components/dashboard/glass-card";

type DashboardTopbarProps = {
  user: User;
  title?: string;
  description?: string;
};

export function DashboardTopbar({
  user,
  title,
  description,
}: DashboardTopbarProps) {
  return (
    <GlassCard className="mb-4 flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between lg:mb-6">
      <div className="flex items-center gap-3">
        <MobileSidebar />
        <div>
          {title ? (
            <h1 className="text-lg font-semibold tracking-tight sm:text-xl">{title}</h1>
          ) : null}
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </div>
      <div className="flex items-center justify-end gap-1 sm:gap-2">
        <ThemeToggle className="hidden sm:inline-flex lg:hidden" />
        <UserNav user={user} />
      </div>
    </GlassCard>
  );
}
