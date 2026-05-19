"use client";

import { StatCard } from "@/components/dashboard/stat-card";
import { statMetrics } from "@/lib/dashboard/data";

export function AnalyticsGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {statMetrics.map((metric, index) => (
        <StatCard key={metric.id} metric={metric} index={index} />
      ))}
    </div>
  );
}
