"use client";

import { SidebarContent } from "@/components/dashboard/sidebar-content";
import { GlassCard } from "@/components/dashboard/glass-card";
import { cn } from "@/lib/utils";

export function DashboardSidebar({ className }: { className?: string }) {
  return (
    <aside
      className={cn(
        "hidden w-64 shrink-0 lg:block",
        className
      )}
    >
      <GlassCard className="sticky top-4 h-[calc(100svh-2rem)] overflow-hidden">
        <SidebarContent />
      </GlassCard>
    </aside>
  );
}
