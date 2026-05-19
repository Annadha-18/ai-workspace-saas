"use client";

import { motion } from "framer-motion";

export function DashboardBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background">
      <motion.div
        animate={{ opacity: [0.4, 0.6, 0.4], scale: [1, 1.05, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-32 -top-32 size-[480px] rounded-full bg-violet-500/25 blur-[100px] dark:bg-violet-600/20"
      />
      <motion.div
        animate={{ opacity: [0.3, 0.5, 0.3], x: [0, 30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-0 top-1/4 size-[400px] rounded-full bg-blue-500/20 blur-[90px] dark:bg-blue-600/15"
      />
      <motion.div
        animate={{ opacity: [0.25, 0.4, 0.25] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-0 left-1/3 size-[360px] rounded-full bg-fuchsia-500/15 blur-[80px] dark:bg-fuchsia-600/10"
      />
      <motion.div
        className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,var(--background)_85%)]"
        initial={false}
      />
    </div>
  );
}
