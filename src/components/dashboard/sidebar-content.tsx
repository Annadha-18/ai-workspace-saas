"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot } from "lucide-react";

import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import { cn } from "@/lib/utils";
import { dashboardNavItems } from "@/lib/dashboard/navigation";

type SidebarContentProps = {
  onNavigate?: () => void;
};

export function SidebarContent({ onNavigate }: SidebarContentProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-5 dark:border-white/5">
        <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-500/25">
          <Bot className="size-5" />
        </span>
        <div>
          <p className="font-semibold leading-none">AI Workspace</p>
          <p className="text-xs text-muted-foreground">Pro Plan</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {dashboardNavItems.map((item) => {
          const isActive =
            !item.disabled &&
            (item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname === item.href || pathname.startsWith(`${item.href}/`));

          if (item.disabled) {
            return (
              <span
                key={item.href}
                className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground/60"
              >
                <item.icon className="size-4 shrink-0" />
                {item.title}
                <span className="ml-auto rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium">
                  Soon
                </span>
              </span>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-gradient-to-r from-violet-600/90 to-blue-600/90 text-white shadow-md shadow-violet-500/20"
                  : "text-muted-foreground hover:bg-white/50 hover:text-foreground dark:hover:bg-white/10"
              )}
            >
              <item.icon className="size-4 shrink-0" />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3 dark:border-white/5">
        <div className="flex items-center justify-between rounded-xl bg-white/40 px-3 py-2 dark:bg-white/5">
          <span className="text-xs text-muted-foreground">Theme</span>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
