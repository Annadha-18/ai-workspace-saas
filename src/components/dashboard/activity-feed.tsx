"use client";

import { motion } from "framer-motion";
import {
  Bot,
  FileUp,
  Settings2,
  Users,
  type LucideIcon,
} from "lucide-react";

import { GlassCard } from "@/components/dashboard/glass-card";
import { activityFeed, type ActivityItem } from "@/lib/dashboard/data";
import { cn } from "@/lib/utils";

const typeConfig: Record<
  ActivityItem["type"],
  { icon: LucideIcon; className: string }
> = {
  chat: {
    icon: Bot,
    className: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  },
  upload: {
    icon: FileUp,
    className: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  },
  team: {
    icon: Users,
    className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  },
  system: {
    icon: Settings2,
    className: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  },
};

function ActivityRow({ item, index }: { item: ActivityItem; index: number }) {
  const config = typeConfig[item.type];
  const Icon = config.icon;

  return (
    <motion.li
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.25 + index * 0.05 }}
      className="flex gap-3 border-b border-white/10 py-3 last:border-0 dark:border-white/5"
    >
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg",
          config.className
        )}
      >
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{item.title}</p>
        <p className="truncate text-xs text-muted-foreground">{item.description}</p>
      </div>
      <span className="shrink-0 text-xs text-muted-foreground">{item.time}</span>
    </motion.li>
  );
}

export function ActivityFeed() {
  return (
    <GlassCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.28, duration: 0.4 }}
      className="flex h-full min-h-[320px] flex-col"
    >
      <div className="border-b border-white/10 p-5 dark:border-white/5">
        <h3 className="font-semibold tracking-tight">Activity feed</h3>
        <p className="text-sm text-muted-foreground">Recent workspace events</p>
      </div>
      <ul className="flex-1 overflow-y-auto px-5">
        {activityFeed.map((item, index) => (
          <ActivityRow key={item.id} item={item} index={index} />
        ))}
      </ul>
    </GlassCard>
  );
}
