"use client";

import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

import { GlassCard } from "@/components/dashboard/glass-card";
import { cn } from "@/lib/utils";
import type { StatMetric } from "@/lib/dashboard/data";

type StatCardProps = {
  metric: StatMetric;
  index?: number;
};

export function StatCard({ metric, index = 0 }: StatCardProps) {
  const TrendIcon =
    metric.trend === "up"
      ? ArrowUpRight
      : metric.trend === "down"
        ? ArrowDownRight
        : Minus;

  const trendPositive =
    metric.trend === "up" ||
    (metric.trend === "down" && metric.id === "latency");

  return (
    <GlassCard
      hover
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
    >
      <div className="p-5">
        <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
        <p className="mt-2 text-3xl font-semibold tracking-tight">{metric.value}</p>
        <div
          className={cn(
            "mt-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
            trendPositive
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
          )}
        >
          <TrendIcon className="size-3.5" />
          {metric.change}
        </div>
      </div>
    </GlassCard>
  );
}
