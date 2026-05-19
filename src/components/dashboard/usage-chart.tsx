"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { GlassCard } from "@/components/dashboard/glass-card";
import { usageChartData } from "@/lib/dashboard/data";

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; dataKey: string; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-white/20 bg-popover/95 px-3 py-2 text-xs shadow-lg backdrop-blur-md">
      <p className="mb-1 font-medium">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="text-muted-foreground">
          {entry.dataKey === "messages" ? "Messages" : "Tokens"}:{" "}
          <span className="font-medium text-foreground">{entry.value.toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
}

export function UsageChart() {
  return (
    <GlassCard
      id="analytics"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
      className="h-full min-h-[320px]"
    >
      <div className="flex flex-col gap-1 border-b border-white/10 p-5 dark:border-white/5">
        <h3 className="font-semibold tracking-tight">Usage overview</h3>
        <p className="text-sm text-muted-foreground">
          Messages and token consumption this week
        </p>
      </div>
      <div className="h-[280px] w-full p-4 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={usageChartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="messagesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.55 0.22 264)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="oklch(0.55 0.22 264)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="tokensGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.6 0.18 220)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="oklch(0.6 0.18 220)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" vertical={false} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />
            <Tooltip content={<ChartTooltip />} />
            <Area
              type="monotone"
              dataKey="messages"
              stroke="oklch(0.55 0.22 264)"
              strokeWidth={2}
              fill="url(#messagesGradient)"
            />
            <Area
              type="monotone"
              dataKey="tokens"
              stroke="oklch(0.6 0.18 220)"
              strokeWidth={2}
              fill="url(#tokensGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
