"use client";

import { motion } from "framer-motion";

import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { AiChat } from "@/components/dashboard/ai-chat";
import { AnalyticsGrid } from "@/components/dashboard/analytics-grid";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { UsageChart } from "@/components/dashboard/usage-chart";
import type { User } from "@supabase/supabase-js";

type DashboardOverviewProps = {
  user: User;
  displayName: string;
};

export function DashboardOverview({ user, displayName }: DashboardOverviewProps) {
  return (
    <>
      <DashboardTopbar
        user={user}
        title={`Welcome back, ${displayName}`}
        description="Here's what's happening in your workspace today."
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <AnalyticsGrid />

        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <UsageChart />
          </div>
          <div className="lg:col-span-2">
            <ActivityFeed />
          </div>
        </div>

        <AiChat compact />
      </motion.div>
    </>
  );
}
